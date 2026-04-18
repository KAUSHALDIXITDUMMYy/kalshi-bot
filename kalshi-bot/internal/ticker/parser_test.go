package ticker

import (
	"testing"
)

func TestParse(t *testing.T) {
	tests := []struct {
		input    string
		expected Info
	}{
		{
			input: "KXNBA-24NOV22-LEBRON_JAMES-OVER-25.5",
			expected: Info{
				Sport:  "NBA",
				Date:   "24NOV22",
				Entity: "LEBRON_JAMES",
				Suffix: "OVER-25.5",
			},
		},
		{
			input: "KXNFL-25DEC23-CHIEFS-WIN",
			expected: Info{
				Sport:  "NFL",
				Date:   "25DEC23",
				Entity: "CHIEFS",
				Suffix: "WIN",
			},
		},
		{
			input: "KXMLB",
			expected: Info{
				Sport:   "MLB",
				IsEvent: true,
			},
		},
	}

	for _, tt := range tests {
		got := Parse(tt.input)
		if got.Sport != tt.expected.Sport {
			t.Errorf("Parse(%q) Sport = %v, want %v", tt.input, got.Sport, tt.expected.Sport)
		}
		if got.Date != tt.expected.Date {
			t.Errorf("Parse(%q) Date = %v, want %v", tt.input, got.Date, tt.expected.Date)
		}
		if got.Entity != tt.expected.Entity {
			t.Errorf("Parse(%q) Entity = %v, want %v", tt.input, got.Entity, tt.expected.Entity)
		}
		if got.Suffix != tt.expected.Suffix {
			t.Errorf("Parse(%q) Suffix = %v, want %v", tt.input, got.Suffix, tt.expected.Suffix)
		}
		if got.IsEvent != tt.expected.IsEvent {
			t.Errorf("Parse(%q) IsEvent = %v, want %v", tt.input, got.IsEvent, tt.expected.IsEvent)
		}
	}
}
