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

func (l *Logger) GetUnsettledFillsByTicker(ctx context.Context, ticker string) ([]struct {
	Sport          string
	MaxPayoutCents int
}, error) {
	// Querying JSONB for the ticker. This handles both single markets and parlays.
	query := `
		SELECT sport, max_payout_cents 
		FROM fill_log 
		WHERE settled = FALSE AND (
			legs @> $1 OR legs @> $2
		)
	`
	// Check if ticker is in a list of legs or is the main ticker if stored differently
	jsonPath1 := fmt.Sprintf(`[{"market_ticker": "%s"}]`, ticker)
	jsonPath2 := fmt.Sprintf(`[{"ticker": "%s"}]`, ticker)

	rows, err := l.pool.Query(ctx, query, jsonPath1, jsonPath2)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []struct {
		Sport          string
		MaxPayoutCents int
	}
	for rows.Next() {
		var res struct {
			Sport          string
			MaxPayoutCents int
		}
		if err := rows.Scan(&res.Sport, &res.MaxPayoutCents); err != nil {
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func (l *Logger) MarkFillsAsSettled(ctx context.Context, ticker string) error {
	query := `
		UPDATE fill_log 
		SET settled = TRUE 
		WHERE settled = FALSE AND (
			legs @> $1 OR legs @> $2
		)
	`
	jsonPath1 := fmt.Sprintf(`[{"market_ticker": "%s"}]`, ticker)
	jsonPath2 := fmt.Sprintf(`[{"ticker": "%s"}]`, ticker)
	
	_, err := l.pool.Exec(ctx, query, jsonPath1, jsonPath2)
	return err
}

func (l *Logger) GetInternalBalance(ctx context.Context) (int64, error) {
	query := `SELECT COALESCE(SUM(pnl_cents), 0) FROM fill_log WHERE settled = TRUE`
	var pnl int64
	err := l.pool.QueryRow(ctx, query).Scan(&pnl)
	return pnl, err
}

func (l *Logger) ApplySettlement(ctx context.Context, ticker, result string, revenue int) error {
	// 1. Find the fill
	queryFind := `SELECT id, max_payout_cents FROM fill_log WHERE settled = FALSE AND (legs @> $1 OR legs @> $2) LIMIT 1`
	jsonPath1 := fmt.Sprintf(`[{"market_ticker": "%s"}]`, ticker)
	jsonPath2 := fmt.Sprintf(`[{"ticker": "%s"}]`, ticker)

	var id string
	var maxPayout int
	err := l.pool.QueryRow(ctx, queryFind, jsonPath1, jsonPath2).Scan(&id, &maxPayout)
	if err != nil {
		return err // No matching unsettled fill
	}

	// 2. Update P&L
	// If revenue > 0, we won (or partially won). In Kalshi MM terms, if we sold NO, 
	// and result is NO, we keep the money.
	// Actually, Kalshi's revenue field in settlements is "payout received".
	// For a seller: payout = cost + profit.
	// P&L = Revenue - MaxPayout (since collateral was locked)
	// Wait, P&L for a seller is: if win, P&L = YesPrice. If loss, P&L = -NoPrice.
	// Kalshi Revenue for seller: if win, Revenue = 100. If loss, Revenue = 0.
	
	pnl := int(revenue) - maxPayout
	
	queryUpdate := `UPDATE fill_log SET settled = TRUE, market_result = $1, pnl_cents = $2 WHERE id = $3`
	_, err = l.pool.Exec(ctx, queryUpdate, result, pnl, id)
	return err
}
