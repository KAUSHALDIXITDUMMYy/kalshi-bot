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
	safety     *SafetyMonitor
	quotes     *quoteTracker
	activeRFQs *activeRFQTracker
}

func NewEngine(cfg *config.Config, log *slog.Logger, client *kalshi.Client, pe pricing.Engine, pc *pricing.PriceCache, pool *pgxpool.Pool, rdb *redis.Client, dbLog *db.Logger, risk *RiskEngine, safety *SafetyMonitor) *Engine {
	return &Engine{
		cfg:        cfg,
		log:        log,
		client:     client,
		price:      pe,
		cache:      pc,
		pool:       pool,
		db:         dbLog,
		rdb:        rdb,
		risk:       risk,
		safety:     safety,
		quotes:     newQuoteTracker(),
		activeRFQs: newActiveRFQTracker(),
	}
}

// StartBackgroundCleanup runs periodic pruning of in-memory maps to prevent memory leaks.
func (e *Engine) StartBackgroundCleanup(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Minute)
	go func() {
		for {
			select {
			case <-ticker.C:
				e.log.Info("running background memory cleanup")
				// Remove quotes older than 2 hours
				e.quotes.Prune(2 * time.Hour)
				// Remove RFQs older than 2 minutes (they expire)
				e.activeRFQs.Prune()
				// Remove price data not updated for 12 hours
				e.cache.Prune(12 * time.Hour)
			case <-ctx.Done():
				ticker.Stop()
				return
			}
		}
	}()
}

// HandleWSMessage parses a single WebSocket JSON payload using typed structs.
func (e *Engine) HandleWSMessage(ctx context.Context, payload []byte) {
	var env WSEvent
	if err := json.Unmarshal(payload, &env); err != nil {
		e.log.Debug("ws skip non-json", "err", err)
		return
	}
	typ := env.Type
	switch typ {
	case "rfq_created":
		e.onRFQCreated(ctx, env.Msg)
	case "quote_accepted":
		e.onQuoteAccepted(ctx, env.Msg)
	case "market_settled", "market_lifecycle":
		e.onMarketSettled(ctx, env.Msg)
	case "orderbook_delta", "orderbook_snapshot":
		ticker, ok := e.cache.HandleDelta(payload)
		if ok {
			e.requoteAffectedRFQs(ctx, ticker)
		}
	case "quote_created", "quote_executed":
		e.log.Debug("ws event", "type", typ, "body", string(payload))
	case "rfq_deleted":
		var msg struct { ID string `json:"id"` }
		if err := json.Unmarshal(env.Msg, &msg); err == nil {
			e.activeRFQs.remove(msg.ID)
		}
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

func (e *Engine) onRFQCreated(ctx context.Context, rawMsg json.RawMessage) {
	var msg RFQMsg
	if err := json.Unmarshal(rawMsg, &msg); err != nil {
		e.log.Warn("rfq_created invalid msg format")
		return
	}

	rfq := pricing.RFQInput{
		ID:                msg.ID,
		MarketTicker:      msg.MarketTicker,
		EventTicker:       msg.EventTicker,
		TargetCostDollars: msg.TargetCostDollars,
		ContractsFP:       msg.ContractsFP,
		MVECollection:     msg.MVECollectionTicker,
		MVESelectedLegs:   msg.MVESelectedLegs,
		IsHVM:             msg.IsHVM,
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
				if l.MarketTicker != "" {
					tickers = append(tickers, l.MarketTicker)
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
			RequesterID:   msg.CreatorID,
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
		RFQID:         rfq.ID,
		YesBid:        yes,
		NoBid:         no,
		RestRemainder: false,
	})
	if err != nil {
		e.log.Error("create quote failed", "rfq_id", rfq.ID, "err", err)
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
	e.activeRFQs.addOrUpdate(rfq, yes)
	e.log.Info("quoted", "rfq_id", rfq.ID, "quote_id", qid, "yes", yes, "no", no)
}

func (e *Engine) onQuoteAccepted(ctx context.Context, rawMsg json.RawMessage) {
	var msg QuoteAcceptedMsg
	if err := json.Unmarshal(rawMsg, &msg); err != nil {
		e.log.Warn("quote_accepted invalid msg format")
		return
	}
	qid := msg.QuoteID
	if qid == "" || !e.quotes.owns(qid) {
		e.log.Debug("quote_accepted not ours", "quote_id", qid)
		return
	}
	
	rfq, ok := e.activeRFQs.Get(msg.RFQID)
	if !ok {
		e.log.Warn("quote accepted for untracked RFQ", "rfq_id", msg.RFQID)
	}

	e.activeRFQs.remove(msg.RFQID)
	e.rdb.Decr(ctx, "rfq:count:open")
	e.log.Info("quote accepted — confirming", "quote_id", qid)

	confirm := func() {
		// HVM Check: If it's a High Volatility Market, we only have 1s to confirm.
		// Otherwise, use the standard 25s window.
		timeout := 25 * time.Second
		if msg.IsHVM || (ok && rfq.IsHVM) {
			timeout = 1 * time.Second
			e.log.Info("HVM detected — switching to 1s confirmation window", "quote_id", qid)
		}

		cctx, cancel := context.WithTimeout(context.Background(), timeout)
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
			side := msg.AcceptedSide
			rfqID := msg.RFQID
			e.db.UpdateQuoteStatus(context.Background(), qid, "ACCEPTED", side)

			contracts := parseFloat(msg.ContractsAcceptedFP)
			yesCents := int64(parseFloat(msg.YesBidDollars) * 100)
			payoutRiskCents := (100 - yesCents) * int64(contracts)

			// Determine sport and legs from tracked RFQ
			sport := "UNKNOWN"
			var legs interface{} = nil
			var tickerList []string
			
			if ok {
				sport = ticker.Parse(rfq.MarketTicker).Sport
				legs = rfq.MVESelectedLegs
				if len(rfq.MVESelectedLegs) > 0 {
					for _, l := range rfq.MVESelectedLegs {
						tickerList = append(tickerList, l.MarketTicker)
					}
				} else {
					tickerList = []string{rfq.MarketTicker}
				}
			} else {
				tickerList = []string{msg.MarketTicker}
			}

			// Record exposure in Redis with correct sport
			e.risk.RecordFill(context.Background(), sport, tickerList, payoutRiskCents)

			e.db.LogFill(context.Background(), db.FillLog{
				QuoteID:        qid,
				QuoteReqID:     rfqID,
				Sport:          sport,
				ContractsFP:    contracts,
				AcceptedSide:   side,
				CostCents:      int(yesCents),
				MaxPayoutCents: int(payoutRiskCents),
				YesPriceCents:  int(yesCents),
				NoPriceCents:   100 - int(yesCents),
				Legs:           legs,
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

// onMarketSettled clears exposure for markets that have ended.
func (e *Engine) onMarketSettled(ctx context.Context, rawMsg json.RawMessage) {
	var msg MarketSettledMsg
	if err := json.Unmarshal(rawMsg, &msg); err != nil {
		return
	}
	
	ticker := msg.MarketTicker
	status := msg.Status
	
	// If the market is settled, cleared, or determined, we free up the risk budget.
	if ticker != "" && (status == "settled" || status == "determined" || status == "cleared") {
		e.log.Info("market settled — releasing risk budget", "ticker", ticker, "status", status)
		
		// 1. Clear the specific leg (atomic)
		e.risk.ClearLegExposure(ctx, ticker)
		
		// 2. Fetch all fills related to this market to release sport and daily totals
		fills, err := e.db.GetUnsettledFillsByTicker(ctx, ticker)
		if err == nil {
			for _, f := range fills {
				e.risk.DecrementGlobalExposure(ctx, f.Sport, int64(f.MaxPayoutCents))
			}
			// Mark them as settled so we don't clear them twice if another event arrives
			e.db.MarkFillsAsSettled(ctx, ticker)
		} else {
			e.log.Error("failed to fetch fills for risk release", "ticker", ticker, "err", err)
		}

		e.cache.Delete(ticker)
	}
}

// requoteAffectedRFQs recalculates and issues new quotes for active RFQs if the orderbook changes.
func (e *Engine) requoteAffectedRFQs(ctx context.Context, ticker string) {
	affected := e.activeRFQs.getAffectedRFQs(ticker)
	for _, tr := range affected {
		// 1. Try to lock this RFQ for requoting (handles throttle + concurrency)
		if !e.activeRFQs.TryLockForRequote(tr.rfq.ID) {
			continue
		}

		yes, no, err := e.price.Price(ctx, tr.rfq)
		if err != nil || yes == tr.lastYesBid {
			// No change or error, release lock and skip
			e.activeRFQs.ReleaseLock(tr.rfq.ID)
			continue
		}

		e.log.Info("requoting due to market delta", "rfq_id", tr.rfq.ID, "old_yes", tr.lastYesBid, "new_yes", yes)
		
		cctx, cancel := context.WithTimeout(ctx, 8*time.Second)
		qid, err := e.client.CreateQuote(cctx, kalshi.CreateQuoteRequest{
			RFQID:         tr.rfq.ID,
			YesBid:        yes,
			NoBid:         no,
			RestRemainder: false,
		})
		cancel()
		
		if err == nil {
			e.quotes.add(qid)
			e.activeRFQs.addOrUpdate(tr.rfq, yes) // addOrUpdate also resets isProcessing to false
			
			go func(id, reqId, y, n string) {
				e.db.LogQuote(context.Background(), db.QuoteLog{
					QuoteID:       id,
					QuoteReqID:    reqId,
					YesPriceCents: int(parseFloat(y) * 100),
					NoPriceCents:  int(parseFloat(n) * 100),
					LatencyMS:     0, // Requote via delta
				})
			}(qid, tr.rfq.ID, yes, no)
		} else {
			e.log.Error("requote failed", "rfq_id", tr.rfq.ID, "err", err)
			e.activeRFQs.ReleaseLock(tr.rfq.ID)
		}
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

// GetStats returns internal metrics for the health API.
func (e *Engine) GetStats() map[string]int {
	return map[string]int{
		"active_rfqs":    e.activeRFQs.Count(),
		"tracked_quotes": e.quotes.Count(),
		"price_cache":    e.cache.Count(),
	}
}
