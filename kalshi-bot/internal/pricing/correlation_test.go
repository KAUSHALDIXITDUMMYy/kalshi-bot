package pricing

import (
	"testing"
)

func TestDetectCorrelation(t *testing.T) {
	tests := []struct {
		name          string
		legs          []map[string]interface{}
		expectedType  CorrelationType
		shouldDecline bool
	}{
		{
			name: "Same Player - LeBron points and assists",
			legs: []map[string]interface{}{
				{"event_ticker": "KXNBA-25OCT24", "market_ticker": "KXNBA-25OCT24-LEBRON_JAMES-PTS"},
				{"event_ticker": "KXNBA-25OCT24", "market_ticker": "KXNBA-25OCT24-LEBRON_JAMES-AST"},
			},
			expectedType:  SamePlayer,
			shouldDecline: false,
		},
		{
			name: "Stack - LeBron and AD same team, same game",
			legs: []map[string]interface{}{
				{"event_ticker": "KXNBA-25OCT24", "market_ticker": "KXNBA-25OCT24-LEBRON_JAMES-PTS"},
				{"event_ticker": "KXNBA-25OCT24", "market_ticker": "KXNBA-25OCT24-ANTHONY_DAVIS-REB"},
			},
			expectedType:  Stack,
			shouldDecline: true, // Should be declined because they are on the same team (LAL)
		},
		{
			name: "Same Game - LeBron and Curry opposing teams",
			legs: []map[string]interface{}{
				{"event_ticker": "KXNBA-25OCT24", "market_ticker": "KXNBA-25OCT24-LEBRON_JAMES-PTS"},
				{"event_ticker": "KXNBA-25OCT24", "market_ticker": "KXNBA-25OCT24-STEPHEN_CURRY-3PM"},
			},
			expectedType:  SameGame,
			shouldDecline: false,
		},
		{
			name: "Independent - Different games",
			legs: []map[string]interface{}{
				{"event_ticker": "KXNBA-25OCT24", "market_ticker": "KXNBA-25OCT24-LEBRON_JAMES-PTS"},
				{"event_ticker": "KXNBA-26OCT24", "market_ticker": "KXNBA-26OCT24-KEVIN_DURANT-PTS"},
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
