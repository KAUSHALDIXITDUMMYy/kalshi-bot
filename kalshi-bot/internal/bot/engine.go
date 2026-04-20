package bot

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"rfqbot/internal/config"
	"rfqbot/internal/db"
	"rfqbot/internal/kalshi"
	"rfqbot/internal/pricing"
	"rfqbot/internal/ticker"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

// Engine wires RFQ events to pricing and REST actions.
type Engine struct {
	cfg    *config.Config
	log    *slog.Logger
	client *kalshi.Client
	price  pricing.Engine
	cache  *pricing.PriceCache
	pool   *pgxpool.Pool
	db     *db.Logger
	rdb    *redis.Client
	risk   *RiskEngine
	safety *SafetyMonitor
	quotes *quoteTracker
}

func NewEngine(cfg *config.Config, log *slog.Logger, client *kalshi.Client, pe pricing.Engine, pc *pricing.PriceCache, pool *pgxpool.Pool, rdb *redis.Client, dbLog *db.Logger, risk *RiskEngine, safety *SafetyMonitor) *Engine {
	return &Engine{
		cfg:    cfg,
		log:    log,
		client: client,
		price:  pe,
		cache:  pc,
		pool:   pool,
		db:     dbLog,
		rdb:    rdb,
		risk:   risk,
		safety: safety,
		quotes: newQuoteTracker(),
	}
}

// HandleWSMessage parses a single WebSocket JSON payload (one line/object).
func (e *Engine) HandleWSMessage(ctx context.Context, payload []byte) {
	var raw map[string]any
	if err := json.Unmarshal(payload, &raw); err != nil {
		e.log.Debug("ws skip non-json", "err", err)
		return
	}
	typ, _ := raw["type"].(string)
	switch typ {
	case "rfq_created":
		e.onRFQCreated(ctx, raw)
	case "quote_accepted":
		e.onQuoteAccepted(ctx, raw)
	case "orderbook_delta", "orderbook_snapshot":
		e.cache.HandleDelta(payload)
	case "quote_created", "quote_executed":
		e.log.Debug("ws event", "type", typ, "body", string(payload))
	case "rfq_deleted":
		e.rdb.Decr(ctx, "rfq:count:open")
		e.log.Debug("ws event", "type", typ, "body", string(payload))
	case "subscribed", "ok", "error":
		e.log.Info("ws control", "type", typ, "body", string(payload))
	default:
		if typ != "" {
			e.log.Debug("ws message", "type", typ)
		}
	}
}

func (e *Engine) onRFQCreated(ctx context.Context, raw map[string]any) {
	msg, _ := raw["msg"].(map[string]any)
	if msg == nil {
		e.log.Warn("rfq_created missing msg")
		return
	}
	id, _ := msg["id"].(string)
	rfq := pricing.RFQInput{
		ID:                id,
		MarketTicker:      str(msg["market_ticker"]),
		EventTicker:       str(msg["event_ticker"]),
		TargetCostDollars: str(msg["target_cost_dollars"]),
		ContractsFP:       str(msg["contracts_fp"]),
		MVECollection:     str(msg["mve_collection_ticker"]),
		RawMsg:            msg,
	}
	if legs, ok := msg["mve_selected_legs"].([]any); ok {
		for _, l := range legs {
			if m, ok := l.(map[string]any); ok {
				rfq.MVESelectedLegs = append(rfq.MVESelectedLegs, m)
			}
		}
	}

	e.log.Info("rfq",
		"id", rfq.ID,
		"market", rfq.MarketTicker,
		"legs", len(rfq.MVESelectedLegs),
	)

	// Increment open RFQ count in Redis
	e.rdb.Incr(ctx, "rfq:count:open")

	start := time.Now()
	// Always calculate price for visibility/logging
	yes, no, err := e.price.Price(ctx, rfq)
	latency := time.Since(start).Seconds() * 1000
	e.safety.RecordLatency(ctx, latency)

	sport := ticker.Parse(rfq.MarketTicker).Sport

	// Preliminary skip reason
	skipReason := ""
	if err != nil {
		skipReason = err.Error()
	} else if !e.cfg.QuoteEnabled {
		skipReason = "quote_disabled"
	} else if e.cfg.DryRun {
		skipReason = "dry_run"
	}

	// Risk validation if no pricing error
	if skipReason == "" {
		var tickers []string
		if len(rfq.MVESelectedLegs) > 0 {
			for _, l := range rfq.MVESelectedLegs {
				if t, ok := l["market_ticker"].(string); ok {
					tickers = append(tickers, t)
				}
			}
		} else {
			tickers = []string{rfq.MarketTicker}
		}

		contracts := parseFloat(rfq.ContractsFP)
		yesCents := int64(parseFloat(yes) * 100)
		payoutRiskCents := int64(100-yesCents) * int64(contracts)

		allowed, reason := e.risk.CheckLimits(ctx, sport, tickers, payoutRiskCents)
		if !allowed {
			skipReason = reason
		}
	}

	quoted := skipReason == ""

	// Async log RFQ
	go func() {
		err := e.db.LogRFQ(context.Background(), db.RFQLog{
			QuoteReqID:    rfq.ID,
			Sport:         sport,
			LegCount:      len(rfq.MVESelectedLegs),
			Legs:          rfq.MVESelectedLegs,
			ContractsFP:   parseFloat(rfq.ContractsFP),
			TargetCostUSD: parseFloat(rfq.TargetCostDollars),
			RequesterID:   str(msg["creator_id"]),
			Quoted:        quoted,
			SkipReason:    skipReason,
		})
		if err != nil {
			e.log.Error("log rfq failed", "err", err)
		}
	}()

	if !quoted {
		e.log.Info("rfq skipped", "id", rfq.ID, "reason", skipReason)
		// If we skip, the RFQ is effectively "closed" for us, but Kalshi might keep it open.
		// However, for our tracking, we'll decrement if we don't intend to quote or if we can't.
		e.rdb.Decr(ctx, "rfq:count:open")
		return
	}

	e.log.Info("quote calculated",
		"id", rfq.ID,
		"yes", yes,
		"no", no,
		"latency_ms", latency,
	)

	cctx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()
	qid, err := e.client.CreateQuote(cctx, kalshi.CreateQuoteRequest{
		RFQID:         id,
		YesBid:        yes,
		NoBid:         no,
		RestRemainder: false,
	})
	if err != nil {
		e.log.Error("create quote failed", "rfq_id", id, "err", err)
		e.safety.RecordError(ctx, err)
		return
	}

	// Async log Quote
	go func() {
		err := e.db.LogQuote(context.Background(), db.QuoteLog{
			QuoteID:       qid,
			QuoteReqID:    rfq.ID,
			YesPriceCents: int(parseFloat(yes) * 100),
			NoPriceCents:  int(parseFloat(no) * 100),
			CompositeProb: 0, // Could be returned by pricing engine
			VigApplied:    0, // Could be returned by pricing engine
			LatencyMS:     latency,
		})
		if err != nil {
			e.log.Error("log quote failed", "err", err)
		}
	}()

	e.quotes.add(qid)
	e.log.Info("quoted", "rfq_id", id, "quote_id", qid, "yes", yes, "no", no)
}

func (e *Engine) onQuoteAccepted(ctx context.Context, raw map[string]any) {
	msg, _ := raw["msg"].(map[string]any)
	if msg == nil {
		e.log.Warn("quote_accepted missing msg")
		return
	}
	qid, _ := msg["quote_id"].(string)
	if qid == "" || !e.quotes.owns(qid) {
		e.log.Debug("quote_accepted not ours", "quote_id", qid)
		return
	}
	e.rdb.Decr(ctx, "rfq:count:open")
	e.log.Info("quote accepted — confirming", "quote_id", qid)

	confirm := func() {
		cctx, cancel := context.WithTimeout(context.Background(), 25*time.Second)
		defer cancel()
		if err := e.client.ConfirmQuote(cctx, qid); err != nil {
			e.log.Error("confirm failed", "quote_id", qid, "err", err)
			e.safety.RecordError(cctx, err)
			go e.db.UpdateQuoteStatus(context.Background(), qid, "REJECTED", "")
			return
		}
		e.log.Info("confirmed", "quote_id", qid)
		e.quotes.remove(qid)

		// Log Fill & Update Exposure
		go func() {
			side, _ := msg["accepted_side"].(string)
			rfqID := str(msg["rfq_id"])
			e.db.UpdateQuoteStatus(context.Background(), qid, "ACCEPTED", side)

			contracts := parseFloat(str(msg["contracts_accepted_fp"]))
			yesCents := int64(parseFloat(str(msg["yes_bid_dollars"])) * 100)
			payoutRiskCents := (100 - yesCents) * int64(contracts)

			// Record exposure in Redis
			ticker := str(msg["market_ticker"])
			e.risk.RecordFill(context.Background(), "UNKNOWN", []string{ticker}, payoutRiskCents)

			e.db.LogFill(context.Background(), db.FillLog{
				QuoteID:        qid,
				QuoteReqID:     rfqID,
				Sport:          "UNKNOWN",
				ContractsFP:    contracts,
				AcceptedSide:   side,
				CostCents:      int(yesCents),
				MaxPayoutCents: int(payoutRiskCents),
				YesPriceCents:  int(yesCents),
				NoPriceCents:   100 - int(yesCents),
				Legs:           nil,
				ConfirmedAt:    time.Now(),
			})
		}()
	}

	if e.cfg.ConfirmParallel {
		go confirm()
	} else {
		confirm()
	}
}

func str(v any) string {
	if v == nil {
		return ""
	}
	s, _ := v.(string)
	return s
}

func parseFloat(s string) float64 {
	if s == "" {
		return 0
	}
	var f float64
	fmt.Sscanf(s, "%f", &f)
	return f
}
