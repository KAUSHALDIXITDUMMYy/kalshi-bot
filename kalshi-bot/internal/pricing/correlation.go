package pricing

import (
	"rfqbot/internal/ticker"
	"sync"
)

type CorrelationType int

const (
	None CorrelationType = iota
	SameGame
	PlayerTeam
	SamePlayer
	Stack       
)

// CorrelationResult matches 1.md logic exactly
type CorrelationResult struct {
	Type          CorrelationType
	VigMultiplier float64
	ShouldDecline bool
	Reason        string
}

// Thread-safe map to prevent panics during live API syncs
type SyncRosterCache struct {
	mu   sync.RWMutex
	data map[string]string
}

func (c *SyncRosterCache) Get(player string) string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	if c.data == nil {
		return ""
	}
	return c.data[player]
}

func (c *SyncRosterCache) Update(newData map[string]string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.data = newData
}

// Global cached instance
var RosterCache = &SyncRosterCache{
	data: map[string]string{
		"LEBRON_JAMES":  "LAL",
		"ANTHONY_DAVIS": "LAL",
		"STEPHEN_CURRY": "GSW",
		"KLAY_THOMPSON": "GSW",
		"KEVIN_DURANT":  "PHX",
		"DEVIN_BOOKER":  "PHX",
	},
}

// DetectCorrelation checks an array of RFQ legs and returns the exact CorrelationResult specified in 1.md
func DetectCorrelation(legs []map[string]interface{}) CorrelationResult {
	if len(legs) <= 1 {
		return CorrelationResult{Type: None, VigMultiplier: 1.0, ShouldDecline: false, Reason: "Independent"}
	}

	seenPlayers := make(map[string]bool)
	seenTeams := make(map[string]bool)
	seenGames := make(map[string]bool)

	highestRisk := None
	
	for _, leg := range legs {
		eventTicker, _ := leg["event_ticker"].(string)
		marketTicker, _ := leg["market_ticker"].(string)

		parsed := ticker.Parse(marketTicker)
		player := parsed.Entity
		team := RosterCache.Get(player)

		// 1. Same Player (Moderate-High Correlation)
		if seenPlayers[player] && player != "" {
			return CorrelationResult{Type: SamePlayer, VigMultiplier: 1.8, ShouldDecline: false, Reason: "Same player parlay"}
		}

		// 2. Stack (Same Team, Same Game) -> Decline instantly
		if seenTeams[team] && team != "" && seenGames[eventTicker] {
			return CorrelationResult{Type: Stack, VigMultiplier: 3.0, ShouldDecline: true, Reason: "Same team stack parlay"}
		} else if seenGames[eventTicker] {
			// 3. Same Game (Opposite teams)
			highestRisk = SameGame
		}

		seenPlayers[player] = true
		seenTeams[team] = true
		seenGames[eventTicker] = true
	}

	if highestRisk == SameGame {
		return CorrelationResult{Type: SameGame, VigMultiplier: 1.5, ShouldDecline: false, Reason: "Multiple players same game"}
	}

	return CorrelationResult{Type: None, VigMultiplier: 1.0, ShouldDecline: false, Reason: "Independent"}
}
