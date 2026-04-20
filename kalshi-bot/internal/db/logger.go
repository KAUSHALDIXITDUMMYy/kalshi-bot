package db

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Logger struct {
	pool *pgxpool.Pool
}

func NewLogger(pool *pgxpool.Pool) *Logger {
	return &Logger{pool: pool}
}

// RFQLog represents a record in rfq_log table
type RFQLog struct {
	QuoteReqID    string
	Sport         string
	LegCount      int
	Legs          interface{}
	ContractsFP   float64
	TargetCostUSD float64
	RequesterID   string
	Quoted        bool
	SkipReason    string
}

func (l *Logger) LogRFQ(ctx context.Context, rfq RFQLog) error {
	legsJSON, err := json.Marshal(rfq.Legs)
	if err != nil {
		return fmt.Errorf("marshal legs: %w", err)
	}

	query := `
		INSERT INTO rfq_log (quote_req_id, sport, leg_count, legs, contracts_fp, target_cost_usd, requester_id, quoted, skip_reason)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (quote_req_id) DO NOTHING
	`
	_, err = l.pool.Exec(ctx, query,
		rfq.QuoteReqID,
		rfq.Sport,
		rfq.LegCount,
		legsJSON,
		rfq.ContractsFP,
		rfq.TargetCostUSD,
		rfq.RequesterID,
		rfq.Quoted,
		rfq.SkipReason,
	)
	return err
}

// QuoteLog represents a record in quote_log table
type QuoteLog struct {
	QuoteID       string
	QuoteReqID    string
	YesPriceCents int
	NoPriceCents  int
	CompositeProb float64
	VigApplied    int
	LatencyMS     float64
}

func (l *Logger) LogQuote(ctx context.Context, q QuoteLog) error {
	query := `
		INSERT INTO quote_log (quote_id, quote_req_id, yes_price_cents, no_price_cents, composite_prob, vig_applied, latency_ms)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := l.pool.Exec(ctx, query,
		q.QuoteID,
		q.QuoteReqID,
		q.YesPriceCents,
		q.NoPriceCents,
		q.CompositeProb,
		q.VigApplied,
		q.LatencyMS,
	)
	return err
}

func (l *Logger) UpdateQuoteStatus(ctx context.Context, quoteID, status string, acceptedSide string) error {
	query := `
		UPDATE quote_log 
		SET status = $1, accepted_side = $2, status_updated_at = NOW()
		WHERE quote_id = $3
	`
	_, err := l.pool.Exec(ctx, query, status, acceptedSide, quoteID)
	return err
}

// FillLog represents a record in fill_log table
type FillLog struct {
	QuoteID         string
	QuoteReqID      string
	Sport           string
	ContractsFP     float64
	AcceptedSide    string
	CostCents       int
	MaxPayoutCents  int
	YesPriceCents   int
	NoPriceCents    int
	Legs            interface{}
	ConfirmedAt     time.Time
}

func (l *Logger) LogFill(ctx context.Context, f FillLog) error {
	legsJSON, err := json.Marshal(f.Legs)
	if err != nil {
		return fmt.Errorf("marshal legs: %w", err)
	}

	query := `
		INSERT INTO fill_log (quote_id, quote_req_id, sport, contracts_fp, accepted_side, cost_cents, max_payout_cents, yes_price_cents, no_price_cents, legs, confirmed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err = l.pool.Exec(ctx, query,
		f.QuoteID,
		f.QuoteReqID,
		f.Sport,
		f.ContractsFP,
		f.AcceptedSide,
		f.CostCents,
		f.MaxPayoutCents,
		f.YesPriceCents,
		f.NoPriceCents,
		legsJSON,
		f.ConfirmedAt,
	)
	return err
}
