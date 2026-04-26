package pricing

import (
	"fmt"
	"rfqbot/internal/ticker"
	"sort"
	"strings"
)

type CorrelationType int

const (
	None CorrelationType = iota
	SamePlayer
	SameTeam
	PlayerTeam
	SameGame
	Stack
)

// CorrelationResult matches 1.md logic exactly
type CorrelationResult struct {
	Type          CorrelationType
	VigMultiplier float64
	ShouldDecline bool
	Reason        string
}

// DetectCorrelation checks an array of RFQ legs and returns the exact CorrelationResult specified in 1.md
func DetectCorrelation(legs []MVELeg) CorrelationResult {
	if len(legs) <= 1 {
		return CorrelationResult{Type: None, VigMultiplier: 1.0, ShouldDecline: false, Reason: "Independent"}
	}

	// 1. Group legs by entity (Player/Team)
	entityGroups := make(map[string][]ticker.Info)
	dateGroups := make(map[string][]ticker.Info)

	for _, leg := range legs {
		t := ticker.Parse(leg.MarketTicker)
		key := fmt.Sprintf("%s:%s", t.Date, t.Entity)
		entityGroups[key] = append(entityGroups[key], t)
		dateGroups[t.Date] = append(dateGroups[t.Date], t)
	}

	// 2. Check STACK: 3+ legs same player/team
	for key, lgs := range entityGroups {
		if len(lgs) >= 3 {
			return CorrelationResult{
				Type:          Stack,
				VigMultiplier: 3.0,
				ShouldDecline: true,
				Reason:        fmt.Sprintf("3+ legs same entity: %s", key),
			}
		}
	}

	// 3. Check SAME_PLAYER: 2 legs same player
	for _, lgs := range entityGroups {
		if len(lgs) == 2 && !lgs[0].IsTeam {
			return CorrelationResult{
				Type:          SamePlayer,
				VigMultiplier: 1.8,
				ShouldDecline: false,
				Reason:        fmt.Sprintf("2 legs same player: %s", lgs[0].Entity),
			}
		}
	}

	// 4. Check SAME_GAME: Multiple players from same matchup
	for date, dlegs := range dateGroups {
		if len(dlegs) < 2 {
			continue
		}

		matchups := groupByMatchup(dlegs, date)
		for matchup, mlegs := range matchups {
			if len(mlegs) >= 2 {
				hasML := false
				hasProp := false
				for _, l := range mlegs {
					if l.IsMoneyline {
						hasML = true
					} else {
						hasProp = true
					}
				}

				if hasML && hasProp {
					return CorrelationResult{
						Type:          PlayerTeam,
						VigMultiplier: 2.0,
						ShouldDecline: false,
						Reason:        fmt.Sprintf("ML + player prop same game: %s", matchup),
					}
				} else {
					return CorrelationResult{
						Type:          SameGame,
						VigMultiplier: 1.5,
						ShouldDecline: false,
						Reason:        fmt.Sprintf("Multiple legs same game: %s", matchup),
					}
				}
			}
		}
	}

	return CorrelationResult{Type: None, VigMultiplier: 1.0, ShouldDecline: false, Reason: "Independent"}
}

func groupByMatchup(legs []ticker.Info, date string) map[string][]ticker.Info {
	matchups := make(map[string][]ticker.Info)
	for _, leg := range legs {
		team := ""
		if leg.IsTeam {
			team = leg.Entity
		} else {
			team = RosterCache.GetTeam(leg.Entity)
		}

		if team == "" {
			// If we don't know the team, we can't safely group by matchup.
			// Fallback to "UNKNOWN"
			matchups["UNKNOWN"] = append(matchups["UNKNOWN"], leg)
			continue
		}

		opp := RosterCache.GetOpponent(team, date)
		if opp == "" {
			// Single team known but no opponent found in schedule
			matchups[team] = append(matchups[team], leg)
			continue
		}

		// Normalize matchup key so A vs B == B vs A
		teams := []string{team, opp}
		sort.Strings(teams)
		matchupKey := strings.Join(teams, ":")
		matchups[matchupKey] = append(matchups[matchupKey], leg)
	}
	return matchups
}
