package pricing

import (
	"testing"
)

func TestDetectCorrelation(t *testing.T) {
	tests := []struct {
		name          string
		legs          []MVELeg
		expectedType  CorrelationType
		shouldDecline bool
	}{
		{
			name: "Same Player - Two NBA legs same player",
			legs: []MVELeg{
				{EventTicker: "KXNBA-25OCT24", MarketTicker: "KXNBA-25OCT24-LEBRON_JAMES-PTS"},
				{EventTicker: "KXNBA-25OCT24", MarketTicker: "KXNBA-25OCT24-LEBRON_JAMES-REB"},
			},
			expectedType:  SamePlayer,
			shouldDecline: false,
		},
		{
			name: "Stack - LeBron and AD on same team",
			legs: []MVELeg{
				{EventTicker: "KXNBA-25OCT24", MarketTicker: "KXNBA-25OCT24-LEBRON_JAMES-PTS"},
				{EventTicker: "KXNBA-25OCT24", MarketTicker: "KXNBA-25OCT24-ANTHONY_DAVIS-REB"},
			},
			expectedType:  Stack,
			shouldDecline: true, // Should be declined because they are on the same team (LAL)
		},
		{
			name: "Same Game - LeBron and Curry opposing teams",
			legs: []MVELeg{
				{EventTicker: "KXNBA-25OCT24", MarketTicker: "KXNBA-25OCT24-LEBRON_JAMES-PTS"},
				{EventTicker: "KXNBA-25OCT24", MarketTicker: "KXNBA-25OCT24-STEPHEN_CURRY-3PM"},
			},
			expectedType:  SameGame,
			shouldDecline: false,
		},
		{
			name: "Independent - Different games",
			legs: []MVELeg{
				{EventTicker: "KXNBA-25OCT24", MarketTicker: "KXNBA-25OCT24-LEBRON_JAMES-PTS"},
				{EventTicker: "KXNBA-26OCT24", MarketTicker: "KXNBA-26OCT24-KEVIN_DURANT-PTS"},
			},
			expectedType:  None,
			shouldDecline: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := DetectCorrelation(tt.legs)
			if result.Type != tt.expectedType {
				t.Errorf("Expected Type %v, got %v", tt.expectedType, result.Type)
			}
			if result.ShouldDecline != tt.shouldDecline {
				t.Errorf("Expected ShouldDecline %v, got %v", tt.shouldDecline, result.ShouldDecline)
			}
		})
	}
}
