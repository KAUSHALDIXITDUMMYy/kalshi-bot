package bot

import (
	"context"
	"fmt"
	"log/slog"
	"strconv"

	"rfqbot/internal/config"

	"github.com/redis/go-redis/v9"
)

type RiskEngine struct {
	cfg *config.Config
	log *slog.Logger
	rdb *redis.Client
}

func NewRiskEngine(cfg *config.Config, log *slog.Logger, rdb *redis.Client) *RiskEngine {
	return &RiskEngine{
		cfg: cfg,
		log: log,
		rdb: rdb,
	}
}

// CheckLimits returns true if the trade is within exposure limits.
func (re *RiskEngine) CheckLimits(ctx context.Context, sport string, tickers []string, payoutRiskCents int64) (bool, string) {
	// 1. Global Halt
	halt, _ := re.rdb.Get(ctx, "circuit:global").Result()
	if halt == "HALT" {
		return false, "global_halt"
	}

	// 2. Sport-level limit
	sportKey := fmt.Sprintf("exposure:sport:%s", sport)
	sportExp, _ := re.rdb.Get(ctx, sportKey).Int64()
	
	// Fetch limit from Redis, fallback to config
	sportLimitStr, _ := re.rdb.Get(ctx, fmt.Sprintf("config:limit:sport:%s", sport)).Result()
	sportLimit := re.cfg.MaxSportExposureCents
	if sportLimitStr != "" {
		sportLimit = getInt64(sportLimitStr)
	}

	if sportExp+payoutRiskCents > sportLimit {
		return false, fmt.Sprintf("sport_exposure_limit:%s", sport)
	}

	// 3. Leg-level limits
	// Fetch leg limit from Redis, fallback to config
	legLimitStr, _ := re.rdb.Get(ctx, "config:limit:leg").Result()
	legLimit := re.cfg.MaxLegExposureCents
	if legLimitStr != "" {
		legLimit = getInt64(legLimitStr)
	}

	for _, ticker := range tickers {
		legKey := fmt.Sprintf("exposure:leg:%s", ticker)
		legExp, _ := re.rdb.Get(ctx, legKey).Int64()
		if legExp+payoutRiskCents > legLimit {
			return false, fmt.Sprintf("leg_exposure_limit:%s", ticker)
		}

		// Check leg circuit breaker
		blocked, _ := re.rdb.Get(ctx, fmt.Sprintf("circuit:leg:%s", ticker)).Result()
		if blocked == "BLOCKED" {
			return false, fmt.Sprintf("leg_blocked:%s", ticker)
		}
	}

	// 4. Total Daily Limit
	totalExp, _ := re.rdb.Get(ctx, "exposure:daily:total").Int64()
	dailyLimitStr, _ := re.rdb.Get(ctx, "config:limit:daily").Result()
	dailyLimit := re.cfg.MaxTotalExposureCents
	if dailyLimitStr != "" {
		dailyLimit = getInt64(dailyLimitStr)
	}

	if totalExp+payoutRiskCents > dailyLimit {
		return false, "total_exposure_limit"
	}

	return true, ""
}

// GetVig implements pricing.VigProvider
func (re *RiskEngine) GetVig(ctx context.Context, legCount int) int {
	key := fmt.Sprintf("config:vig:leg:%d", legCount)
	val, err := re.rdb.Get(ctx, key).Int64()
	if err == nil {
		return int(val)
	}

	// Fallback to defaults from implementation_requirements.md
	switch legCount {
	case 1:
		return 1
	case 2:
		return 3
	case 3:
		return 5
	default:
		return 7
	}
}

// RecordFill atomically increments exposure for a filled trade.
func (re *RiskEngine) RecordFill(ctx context.Context, sport string, tickers []string, payoutRiskCents int64) error {
	pipe := re.rdb.Pipeline()

	// Increment sport exposure
	pipe.IncrBy(ctx, fmt.Sprintf("exposure:sport:%s", sport), payoutRiskCents)

	// Increment daily total
	pipe.IncrBy(ctx, "exposure:daily:total", payoutRiskCents)

	// Increment each leg exposure
	for _, ticker := range tickers {
		pipe.IncrBy(ctx, fmt.Sprintf("exposure:leg:%s", ticker), payoutRiskCents)
	}

	_, err := pipe.Exec(ctx)
	if err != nil {
		return fmt.Errorf("pipeline exec: %w", err)
	}

	re.log.Info("exposure updated", "sport", sport, "payout_risk", payoutRiskCents, "leg_count", len(tickers))
	return nil
}

// RecordSettlement decrements exposure when a market settles.
func (re *RiskEngine) RecordSettlement(ctx context.Context, sport string, tickers []string, payoutRiskCents int64) error {
	pipe := re.rdb.Pipeline()

	pipe.DecrBy(ctx, fmt.Sprintf("exposure:sport:%s", sport), payoutRiskCents)
	pipe.DecrBy(ctx, "exposure:daily:total", payoutRiskCents)
	for _, ticker := range tickers {
		pipe.DecrBy(ctx, fmt.Sprintf("exposure:leg:%s", ticker), payoutRiskCents)
	}

	_, err := pipe.Exec(ctx)
	return err
}

// ClearLegExposure zeroes out the risk for a specific leg when it settles.
// This prevents "Risk Clogging" on a specific market.
func (re *RiskEngine) ClearLegExposure(ctx context.Context, ticker string) error {
	legKey := fmt.Sprintf("exposure:leg:%s", ticker)
	err := re.rdb.Del(ctx, legKey).Err()
	if err == nil {
		re.log.Info("leg exposure cleared (settlement)", "ticker", ticker)
	}
	return err
}

// DecrementGlobalExposure reduces sport and daily totals.
// Used when a market settles to release broader risk budget.
func (re *RiskEngine) DecrementGlobalExposure(ctx context.Context, sport string, payoutRiskCents int64) error {
	if payoutRiskCents <= 0 {
		return nil
	}
	pipe := re.rdb.Pipeline()
	pipe.DecrBy(ctx, fmt.Sprintf("exposure:sport:%s", sport), payoutRiskCents)
	pipe.DecrBy(ctx, "exposure:daily:total", payoutRiskCents)
	_, err := pipe.Exec(ctx)
	if err == nil {
		re.log.Info("global exposure released", "sport", sport, "amount_cents", payoutRiskCents)
	}
	return err
}

func getInt64(val string) int64 {
	i, _ := strconv.ParseInt(val, 10, 64)
	return i
}
