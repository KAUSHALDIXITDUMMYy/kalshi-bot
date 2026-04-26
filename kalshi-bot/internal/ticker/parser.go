package ticker

import (
	"strings"
)

// Info holds the decomposed parts of a Kalshi ticker.
type Info struct {
	Raw         string
	Sport       string // NBA, NFL, MLB
	Date        string // e.g., 24NOV22
	Entity      string // e.g., LEBRON_JAMES
	Suffix      string // e.g., OVER-25.5
	IsEvent     bool   // true if it's just a sport/event prefix (e.g., KXNBA)
	IsTeam      bool
	IsMoneyline bool
}

// TEAM_IDS from 1.md logic (simplified list for common sports)
var TEAM_IDS = map[string]bool{
	"LAKERS": true, "WARRIORS": true, "CELTICS": true, "HEAT": true, "BUCKS": true, "NUGGETS": true,
	"CHIEFS": true, "EAGLES": true, "COWBOYS": true, "PATRIOTS": true, "PACKERS": true, "49ERS": true,
	"YANKEES": true, "DODGERS": true, "REDSOX": true, "CUBS": true, "BRAVES": true, "ASTROS": true,
}

// Parse decomposes a Kalshi ticker string into its functional parts.
// Examples:
// "KXNBA-24NOV22-LEBRON_JAMES-OVER-25.5" -> {Sport: "NBA", Date: "24NOV22", Entity: "LEBRON_JAMES", Suffix: "OVER-25.5"}
// "KXNFL" -> {Sport: "NFL", IsEvent: true}
func Parse(t string) Info {
	info := Info{Raw: t}

	// Handle simple event tickers (no dashes)
	if !strings.Contains(t, "-") {
		info.IsEvent = true
		if strings.HasPrefix(t, "KX") {
			info.Sport = t[2:]
		}
		return info
	}

	parts := strings.Split(t, "-")
	
	// Part 0: Prefix (Sport)
	if strings.HasPrefix(parts[0], "KX") {
		info.Sport = parts[0][2:]
	} else {
		info.Sport = parts[0]
	}

	// Part 1: Date
	if len(parts) > 1 {
		info.Date = parts[1]
	}

	// Part 2: Entity (Player/Team)
	if len(parts) > 2 {
		info.Entity = parts[2]
		info.IsTeam = TEAM_IDS[strings.ToUpper(info.Entity)]
	}

	// Part 3+: Suffix (Market specifics like Over/Under or Score)
	if len(parts) > 3 {
		info.Suffix = strings.Join(parts[3:], "-")
		if info.Suffix == "ML" {
			info.IsMoneyline = true
		}
	} else if len(parts) == 3 {
		info.IsMoneyline = true
	}

	return info
}
