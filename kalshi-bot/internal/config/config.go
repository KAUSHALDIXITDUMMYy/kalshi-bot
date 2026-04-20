package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Config holds runtime options loaded from the environment.
type Config struct {
	APIKeyID        string
	PrivateKeyPath  string
	RESTBase        string // e.g. https://demo-api.kalshi.co/trade-api/v2
	WebSocketURL    string // e.g. wss://demo-api.kalshi.co/trade-api/ws/v2
	DryRun          bool   // if true, never POST quotes (default true)
	QuoteEnabled    bool   // if false, skip pricing/quote path entirely
	Strategy        string // noop | fixed
	FixedYesBid     string // dollar string e.g. "0.48"
	FixedNoBid      string
	ShardFactor     int
	ShardKey        int
	ConfirmParallel bool // confirm in separate goroutine (still immediate)

	// Infrastructure
	DBURL    string
	RedisURL string

	// Risk Limits
	MaxLegExposureCents   int64
	MaxSportExposureCents int64
	MaxTotalExposureCents int64
}

func FromEnv() (*Config, error) {
	c := &Config{
		APIKeyID:       strings.TrimSpace(os.Getenv("KALSHI_ACCESS_KEY_ID")),
		PrivateKeyPath: strings.TrimSpace(os.Getenv("KALSHI_PRIVATE_KEY_PATH")),
		RESTBase:       strings.TrimSpace(os.Getenv("KALSHI_REST_BASE")),
		WebSocketURL:   strings.TrimSpace(os.Getenv("KALSHI_WS_URL")),
		Strategy:       strings.TrimSpace(os.Getenv("KALSHI_STRATEGY")),
		FixedYesBid:    strings.TrimSpace(os.Getenv("KALSHI_FIXED_YES_BID")),
		FixedNoBid:     strings.TrimSpace(os.Getenv("KALSHI_FIXED_NO_BID")),
		DBURL:          strings.TrimSpace(os.Getenv("DATABASE_URL")),
		RedisURL:       strings.TrimSpace(os.Getenv("REDIS_URL")),
		MaxLegExposureCents:   int64(getenvInt("RISK_MAX_LEG_EXPOSURE", 30000)),   // $300
		MaxSportExposureCents: int64(getenvInt("RISK_MAX_SPORT_EXPOSURE", 150000)), // $1,500
		MaxTotalExposureCents: int64(getenvInt("RISK_MAX_TOTAL_EXPOSURE", 500000)), // $5,000
	}

	if c.APIKeyID == "" {
		return nil, fmt.Errorf("KALSHI_ACCESS_KEY_ID is required")
	}
	if c.PrivateKeyPath == "" {
		return nil, fmt.Errorf("KALSHI_PRIVATE_KEY_PATH is required")
	}

	if c.RESTBase == "" {
		c.RESTBase = "https://demo-api.kalshi.co/trade-api/v2"
	}
	if c.WebSocketURL == "" {
		c.WebSocketURL = "wss://demo-api.kalshi.co/trade-api/ws/v2"
	}

	c.DryRun = getenvBool("KALSHI_DRY_RUN", true)
	c.QuoteEnabled = getenvBool("KALSHI_QUOTE_ENABLED", false)
	c.ConfirmParallel = getenvBool("KALSHI_CONFIRM_PARALLEL", true)

	if c.DBURL == "" {
		c.DBURL = "postgres://kalshi:kalshibot123@localhost:5433/rfqbot?sslmode=disable"
	}
	if c.RedisURL == "" {
		c.RedisURL = "redis://localhost:6379"
	}

	if c.Strategy == "" {
		c.Strategy = "noop"
	}

	if c.ShardFactor == 0 {
		c.ShardFactor = getenvInt("KALSHI_COMM_SHARD_FACTOR", 0)
	}
	if c.ShardKey == 0 {
		c.ShardKey = getenvInt("KALSHI_COMM_SHARD_KEY", 0)
	}

	if !c.DryRun && c.QuoteEnabled && c.Strategy == "fixed" {
		if c.FixedYesBid == "" || c.FixedNoBid == "" {
			return nil, fmt.Errorf("KALSHI_FIXED_YES_BID and KALSHI_FIXED_NO_BID are required when strategy=fixed and quoting is enabled")
		}
	}

	return c, nil
}

func getenvBool(key string, def bool) bool {
	s := strings.TrimSpace(os.Getenv(key))
	if s == "" {
		return def
	}
	b, err := strconv.ParseBool(s)
	if err != nil {
		return def
	}
	return b
}

func getenvInt(key string, def int) int {
	s := strings.TrimSpace(os.Getenv(key))
	if s == "" {
		return def
	}
	n, err := strconv.Atoi(s)
	if err != nil {
		return def
	}
	return n
}
