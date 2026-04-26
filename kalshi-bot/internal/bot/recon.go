package bot

import (
	"context"
	"fmt"
	"log/slog"
	"strconv"
	"time"

	"rfqbot/internal/db"
	"rfqbot/internal/kalshi"
	"github.com/redis/go-redis/v9"
)

// ReconciliationEngine performs daily audits of exchange balances.
type ReconciliationEngine struct {
	log    *slog.Logger
	client *kalshi.Client
	db     *db.Logger
	rdb    *redis.Client
	safety *SafetyMonitor
}

func NewReconciliationEngine(log *slog.Logger, client *kalshi.Client, dbLog *db.Logger, rdb *redis.Client, safety *SafetyMonitor) *ReconciliationEngine {
	return &ReconciliationEngine{
		log:    log,
		client: client,
		db:     dbLog,
		rdb:    rdb,
		safety: safety,
	}
}

// Start launches the daily reconciliation loop.
func (r *ReconciliationEngine) Start(ctx context.Context) {
	// Run once on startup to sync any missed settlements while offline
	r.Run(ctx)

	// Then run daily at midnight
	ticker := time.NewTicker(24 * time.Hour)
	go func() {
		for {
			select {
			case <-ticker.C:
				r.Run(ctx)
			case <-ctx.Done():
				ticker.Stop()
				return
			}
		}
	}()
}

// Run performs the full audit: sync settlements -> compare balances.
func (r *ReconciliationEngine) Run(ctx context.Context) {
	r.log.Info("starting balance reconciliation audit")

	// 1. Sync settlements from Kalshi REST
	// Look back 48 hours to be safe
	minTS := time.Now().Add(-48 * time.Hour).UnixMilli()
	settlements, err := r.client.GetSettlements(ctx, minTS)
	if err != nil {
		r.log.Error("recon: failed to fetch settlements", "err", err)
	} else {
		for _, s := range settlements {
			rev, _ := strconv.Atoi(s.Revenue)
			if err := r.db.ApplySettlement(ctx, s.Ticker, s.Result, rev); err == nil {
				r.log.Info("recon: applied missed settlement", "ticker", s.Ticker, "result", s.Result)
			}
		}
	}

	// 2. Fetch current Kalshi balance
	externalBalance, err := r.client.GetBalance(ctx)
	if err != nil {
		r.log.Error("recon: failed to fetch Kalshi balance", "err", err)
		return
	}

	// 3. Fetch initial balance from Redis or store it if first run
	var initialBalance int64
	val, err := r.rdb.Get(ctx, "bankroll:initial").Result()
	if err == redis.Nil {
		// First run: store current balance as initial
		initialBalance = externalBalance
		r.rdb.Set(ctx, "bankroll:initial", initialBalance, 0)
		r.log.Info("recon: stored initial bankroll", "balance", initialBalance)
	} else if err == nil {
		initialBalance, _ = strconv.ParseInt(val, 10, 64)
	}

	// 4. Calculate Internal Balance: Initial + Total Realized P&L
	pnl, err := r.db.GetInternalBalance(ctx)
	if err != nil {
		r.log.Error("recon: failed to calculate internal P&L", "err", err)
		return
	}
	internalBalance := initialBalance + pnl

	// 5. Compare and Alert
	diff := externalBalance - internalBalance
	if diff < 0 {
		diff = -diff
	}

	r.log.Info("reconciliation audit complete", 
		"external", externalBalance, 
		"internal", internalBalance, 
		"diff_cents", diff,
	)

	// Threshold: $1.00 (100 cents)
	if diff > 100 {
		r.log.Error("CRITICAL BALANCE DISCREPANCY DETECTED", 
			"diff", diff, 
			"external", externalBalance, 
			"internal", internalBalance,
		)
		// We don't necessarily halt for small drift, but we log it as error.
		// If diff is massive (>10% of bankroll), we should halt.
		if initialBalance > 0 && diff > (initialBalance / 10) {
			r.safety.TriggerHalt(ctx, fmt.Sprintf("massive_balance_discrepancy:%d", diff))
		}
	}
}
