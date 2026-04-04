package bot

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	"rfqbot/internal/config"
	"rfqbot/internal/kalshi"
	"rfqbot/internal/pricing"
)

// Engine wires RFQ events to pricing and REST actions.
type Engine struct {
	cfg    *config.Config
	log    *slog.Logger
	client *kalshi.Client
	price  pricing.Engine
	quotes *quoteTracker
}

func NewEngine(cfg *config.Config, log *slog.Logger, client *kalshi.Client, pe pricing.Engine) *Engine {
	return &Engine{
		cfg:    cfg,
		log:    log,
		client: client,
		price:  pe,
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
	case "quote_created", "quote_executed", "rfq_deleted":
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
		ID:           id,
		MarketTicker: str(msg["market_ticker"]),
		EventTicker:  str(msg["event_ticker"]),
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

	if e.cfg.DryRun || !e.cfg.QuoteEnabled {
		return
	}

	yes, no, err := e.price.Price(ctx, rfq)
	if err != nil {
		e.log.Debug("skip quote", "rfq_id", id, "reason", err.Error())
		return
	}

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
		return
	}
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
	e.log.Info("quote accepted — confirming", "quote_id", qid)

	confirm := func() {
		cctx, cancel := context.WithTimeout(context.Background(), 25*time.Second)
		defer cancel()
		if err := e.client.ConfirmQuote(cctx, qid); err != nil {
			e.log.Error("confirm failed", "quote_id", qid, "err", err)
			return
		}
		e.log.Info("confirmed", "quote_id", qid)
		e.quotes.remove(qid)
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
