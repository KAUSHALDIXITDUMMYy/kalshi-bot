package pricing

import (
	"context"
	"fmt"

	"rfqbot/internal/config"
)

// RFQInput is a minimal view of an RFQ for pricing.
type RFQInput struct {
	ID                 string
	MarketTicker       string
	EventTicker        string
	TargetCostDollars  string
	ContractsFP        string
	MVECollection      string
	MVESelectedLegs    []map[string]any
	RawMsg             map[string]any
}

// Engine returns yes/no bid dollar strings for CreateQuote.
type Engine interface {
	Price(ctx context.Context, r RFQInput) (yesBid, noBid string, err error)
}

func NewEngine(cfg *config.Config) (Engine, error) {
	switch cfg.Strategy {
	case "noop":
		return noopEngine{}, nil
	case "fixed":
		return fixedEngine{yes: cfg.FixedYesBid, no: cfg.FixedNoBid}, nil
	default:
		return nil, fmt.Errorf("unknown KALSHI_STRATEGY %q", cfg.Strategy)
	}
}

type noopEngine struct{}

func (noopEngine) Price(ctx context.Context, r RFQInput) (string, string, error) {
	return "", "", fmt.Errorf("noop strategy: no quote")
}

type fixedEngine struct {
	yes, no string
}

func (f fixedEngine) Price(ctx context.Context, r RFQInput) (string, string, error) {
	if f.yes == "" || f.no == "" {
		return "", "", fmt.Errorf("fixed strategy: empty bids")
	}
	return f.yes, f.no, nil
}
