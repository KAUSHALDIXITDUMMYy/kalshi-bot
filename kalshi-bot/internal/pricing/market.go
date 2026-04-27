package pricing

import (
	"context"
	"fmt"
	"time"

	"rfqbot/internal/config"
)

type marketEngine struct {
	cfg   *config.Config
	cache *PriceCache
	vig   VigProvider
}

func NewMarketEngine(cfg *config.Config, pc *PriceCache, vig VigProvider) Engine {
	return &marketEngine{
		cfg:   cfg,
		cache: pc,
		vig:   vig,
	}
}

func (e *marketEngine) Price(ctx context.Context, r RFQInput) (string, string, error) {
	// 1. Calculate the Market Cost (using Asks)
	// This is what it would cost the user to buy these legs manually from the order book.
	// Normalize legs: if MVESelectedLegs is empty, use the top-level MarketTicker
	legs := r.MVESelectedLegs
	if len(legs) == 0 && r.MarketTicker != "" {
		legs = []MVELeg{{MarketTicker: r.MarketTicker, Side: "yes"}} // Default to YES fair value
	}

	marketBuyProb := 1.0

	for _, leg := range legs {
		ticker := leg.MarketTicker
		side := leg.Side

		priceData, ok := e.cache.Get(ticker)
		if !ok {
			return "", "", fmt.Errorf("cache miss for ticker: %s", ticker)
		}

		// GUARD: Staleness Check
		// If data is older than 30 seconds, we don't trust it.
		if time.Since(priceData.UpdatedAt) > 30*time.Second {
			return "", "", fmt.Errorf("stale data for ticker %s (age: %v)", ticker, time.Since(priceData.UpdatedAt))
		}

		// GUARD: Spread Check
		// If the gap between Bid and Ask is too wide, the market is illiquid.
		spread := priceData.BestYesAsk - priceData.BestYesBid
		if spread > 15 {
			return "", "", fmt.Errorf("wide spread for ticker %s (spread: %d)", ticker, spread)
		}

		var legAsk float64
		if side == "yes" {
			// If user wants YES, they would have to pay the Ask price.
			if priceData.BestYesAsk == 0 {
				return "", "", fmt.Errorf("no ask for ticker: %s", ticker)
			}
			legAsk = float64(priceData.BestYesAsk) / 100.0
		} else {
			// If user wants NO, they are effectively selling YES.
			// To 'buy' NO, they look at the Best Bid for YES and hit it.
			if priceData.BestYesBid == 0 {
				return "", "", fmt.Errorf("no bid for ticker: %s", ticker)
			}
			legAsk = 1.0 - (float64(priceData.BestYesBid) / 100.0)
		}
		marketBuyProb *= legAsk
	}

	// 2. The "Market Price" in cents
	marketPriceCents := marketBuyProb * 100.0

	// 3. Correlation Detection Engine
	correlation := DetectCorrelation(legs)
	
	if correlation.ShouldDecline {
		return "", "", fmt.Errorf("RFQ declined due to correlation policy: %s", correlation.Reason)
	}

	// 4. Apply the VIG penalties depending on risk
	baseVig := float64(e.calculateVig(ctx, len(r.MVESelectedLegs)))
	
	// correlation penalty formula from 3.md Line 783
	corrAdj := marketPriceCents * (correlation.VigMultiplier - 1.0) * 0.5
	
	totalDeduction := int(baseVig + corrAdj)

	// MARKET MAKER LOGIC:
	// To make a profit, we must SELL at a higher price than the fair market value.
	// We add the totalDeduction (Vig) to BOTH sides.
	quotedYesPriceCents := int(marketPriceCents) + totalDeduction
	quotedNoPriceCents := (100 - int(marketPriceCents)) + totalDeduction

	// 5. Safety Guard: Capping
	// Kalshi contracts must be between 1 and 99 cents.
	// We also ensure we don't quote so high that it becomes impossible (e.g. > 99).
	if quotedYesPriceCents > 99 {
		quotedYesPriceCents = 99
	}
	if quotedYesPriceCents < 1 {
		quotedYesPriceCents = 1
	}
	if quotedNoPriceCents > 99 {
		quotedNoPriceCents = 99
	}
	if quotedNoPriceCents < 1 {
		quotedNoPriceCents = 1
	}

	yesBidDollars := fmt.Sprintf("%.2f", float64(quotedYesPriceCents)/100.0)
	noBidDollars := fmt.Sprintf("%.2f", float64(quotedNoPriceCents)/100.0)

	return yesBidDollars, noBidDollars, nil
}

// calculateVig determines the margin to deduct based on leg count.
// Now uses the injected VigProvider for dynamic reloading.
func (e *marketEngine) calculateVig(ctx context.Context, legCount int) int {
	return e.vig.GetVig(ctx, legCount)
}
