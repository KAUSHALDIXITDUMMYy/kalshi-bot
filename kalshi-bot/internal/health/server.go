package health

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Server struct {
	rdb       *redis.Client
	db        *pgxpool.Pool
	eng       StatsProvider
	safety    SafetyMonitor
	startTime time.Time
}

type StatsProvider interface {
	GetStats() map[string]int
}

type SafetyMonitor interface {
	GetStatus() (int, time.Time)
}

// NewServer initializes a new Health Server with full system visibility.
func NewServer(rdb *redis.Client, db *pgxpool.Pool, eng StatsProvider, safety SafetyMonitor) *Server {
	return &Server{
		rdb:       rdb,
		db:        db,
		eng:       eng,
		safety:    safety,
		startTime: time.Now(),
	}
}

// Response defines the JSON payload for the health check.
type Response struct {
	Status          string         `json:"status"`
	UptimeSeconds   int64          `json:"uptime_seconds"`
	CircuitBreakers map[string]any `json:"circuit_breakers"`
	Capacity        map[string]any `json:"capacity"`
	ExposureCents   map[string]any `json:"exposure_cents"`
	Trackers        map[string]int `json:"trackers"`
	Safety          map[string]any `json:"safety"`
	Postgres        string         `json:"postgres"`
}

// HandleHealth provides a snapshot of the bot's state using a Redis pipeline.
func (s *Server) HandleHealth(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	resp := Response{
		Status:        "OK",
		UptimeSeconds: int64(time.Since(s.startTime).Seconds()),
		CircuitBreakers: map[string]any{
			"global_halt":      false,
			"throttled_sports": []string{},
		},
		Capacity: map[string]any{
			"max_allowed": 100,
		},
		ExposureCents: make(map[string]any),
	}

	w.Header().Set("Content-Type", "application/json")

	// Avoid panicking if Redis is nil (for tests/degraded mode)
	if s.rdb == nil {
		resp.Status = "DEGRADED (No Redis Engine)"
		json.NewEncoder(w).Encode(resp)
		return
	}

	// Fetch all stats atomically via Pipeline
	pipe := s.rdb.Pipeline()

	globalHaltCmd := pipe.Get(ctx, "circuit:global")
	throttledNFLCmd := pipe.Get(ctx, "circuit:sport:NFL")
	throttledNBACmd := pipe.Get(ctx, "circuit:sport:NBA")
	throttledMLBCmd := pipe.Get(ctx, "circuit:sport:MLB")

	rfqCountCmd := pipe.Get(ctx, "rfq:count:open")

	expTotalCmd := pipe.Get(ctx, "exposure:daily:total")
	expNFLCmd := pipe.Get(ctx, "exposure:sport:NFL")
	expNBACmd := pipe.Get(ctx, "exposure:sport:NBA")
	expMLBCmd := pipe.Get(ctx, "exposure:sport:MLB")

	// Execute pipeline. We ignore the error here because a missing key returns redis.Nil,
	// which is expected (means zero exposure or no circuit breaker).
	_, err := pipe.Exec(ctx)
	if err != nil && err != redis.Nil {
		resp.Status = "DEGRADED (Redis Error)"
	}

	// Parse Circuit Breakers
	if globalHaltCmd.Val() == "HALT" {
		resp.CircuitBreakers["global_halt"] = true
	}

	var throttled []string
	if throttledNFLCmd.Val() == "THROTTLED" {
		throttled = append(throttled, "NFL")
	}
	if throttledNBACmd.Val() == "THROTTLED" {
		throttled = append(throttled, "NBA")
	}
	if throttledMLBCmd.Val() == "THROTTLED" {
		throttled = append(throttled, "MLB")
	}
	resp.CircuitBreakers["throttled_sports"] = throttled

	// Parse Capacity
	openRFQs, _ := strconv.Atoi(rfqCountCmd.Val())
	resp.Capacity["open_rfq_count"] = openRFQs

	// Parse Exposures
	expTotal, _ := strconv.Atoi(expTotalCmd.Val())
	expNFL, _ := strconv.Atoi(expNFLCmd.Val())
	expNBA, _ := strconv.Atoi(expNBACmd.Val())
	expMLB, _ := strconv.Atoi(expMLBCmd.Val())

	resp.ExposureCents["daily_total"] = expTotal
	resp.ExposureCents["nfl"] = expNFL
	resp.ExposureCents["nba"] = expNBA
	resp.ExposureCents["mlb"] = expMLB

	// Internal Trackers
	resp.Trackers = s.eng.GetStats()

	// Safety Monitor
	errCount, lastErr := s.safety.GetStatus()
	resp.Safety = map[string]any{
		"error_count":     errCount,
		"last_error_time": lastErr,
	}

	// Postgres Health
	if err := s.db.Ping(ctx); err != nil {
		resp.Postgres = "DISCONNECTED"
		resp.Status = "DEGRADED (Postgres Error)"
	} else {
		resp.Postgres = "CONNECTED"
	}

	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}
