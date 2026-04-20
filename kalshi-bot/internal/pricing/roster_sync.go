package pricing

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
)

// StartDailyRosterSync launches a background Goroutine that fetches the balldontlie.io
// API once immediately, and then daily at 3:00 AM, mapping all players to their teams.
func StartDailyRosterSync(apiKey string) {
	go func() {
		// Run once immediately on bot startup
		fetchAndMapNBA(apiKey)

		// Create daily schedule for 3:00 AM
		for {
			now := time.Now()
			next := time.Date(now.Year(), now.Month(), now.Day(), 3, 0, 0, 0, now.Location())
			
			// If it's already past 3 AM today, schedule for 3 AM tomorrow
			if now.After(next) {
				next = next.Add(24 * time.Hour)
			}
			
			duration := next.Sub(now)
			timer := time.NewTimer(duration)
			<-timer.C
			
			fetchAndMapNBA(apiKey)
		}
	}()
}

type balldontliePlayer struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Team      struct {
		Abbreviation string `json:"abbreviation"`
	} `json:"team"`
}

type balldontlieResponse struct {
	Data []balldontliePlayer `json:"data"`
	Meta struct {
		NextCursor *int `json:"next_cursor"`
	} `json:"meta"`
}

func fetchAndMapNBA(apiKey string) {
	log.Println("[ROSTER SYNC] Fetching balldontlie NBA rosters...")
	
	newRoster := make(map[string]string)
	cursor := 0
	
	for {
		url := "https://api.balldontlie.io/v1/players?per_page=100"
		if cursor > 0 {
			url = fmt.Sprintf("%s&cursor=%d", url, cursor)
		}

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			log.Printf("[ROSTER SYNC] Error creating request: %v", err)
			return
		}
		
		if apiKey != "" {
			// Some free tiers require Authorization header, others don't.
			req.Header.Set("Authorization", apiKey)
		}

		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("[ROSTER SYNC] Request failed: %v", err)
			return
		}
		
		if resp.StatusCode != 200 {
			log.Printf("[ROSTER SYNC] API returned status %d. Sync aborted (RosterCache remains unchanged).", resp.StatusCode)
			resp.Body.Close()
			return
		}

		var bdlResp balldontlieResponse
		if err := json.NewDecoder(resp.Body).Decode(&bdlResp); err != nil {
			log.Printf("[ROSTER SYNC] JSON unmarshal error: %v", err)
			resp.Body.Close()
			return
		}
		resp.Body.Close()

		for _, p := range bdlResp.Data {
			// Convert "LeBron James" -> "LEBRON_JAMES" (matching Kalshi ticker format)
			firstName := strings.ToUpper(p.FirstName)
			lastName := strings.ToUpper(p.LastName)
			entity := fmt.Sprintf("%s_%s", firstName, lastName)
			
			// Map to Team
			newRoster[entity] = strings.ToUpper(p.Team.Abbreviation)
		}

		if bdlResp.Meta.NextCursor == nil {
			break
		}
		cursor = *bdlResp.Meta.NextCursor
	}

	if len(newRoster) > 0 {
		// Thread-safely overwrite the old map with the fresh data
		RosterCache.Update(newRoster)
		log.Printf("[ROSTER SYNC] Successfully updated roster cache with %d players.", len(newRoster))
	} else {
		log.Printf("[ROSTER SYNC] Warning: Fetch returned 0 players.")
	}
}
