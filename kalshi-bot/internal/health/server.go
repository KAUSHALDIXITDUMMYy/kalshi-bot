package health

import (
	"context"
	"encoding/json"
	"net/http"
	"log/slog"
	"runtime"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"rfqbot/internal/db"
)

type Server struct {
	rdb       *redis.Client
	db        *pgxpool.Pool
	dbLogger  *db.Logger
	eng       StatsProvider
	safety    SafetyMonitor
	startTime time.Time
	secret    string
}

type StatsProvider interface {
	GetStats() map[string]int
}

type SafetyMonitor interface {
	GetStatus() (int, time.Time, float64)
}

// NewServer initializes a new Health Server with full system visibility.
func NewServer(rdb *redis.Client, db *pgxpool.Pool, dbLogger *db.Logger, eng StatsProvider, safety SafetyMonitor, secret string) *Server {
	return &Server{
		rdb:       rdb,
		db:        db,
		dbLogger:  dbLogger,
		eng:       eng,
		safety:    safety,
		startTime: time.Now(),
		secret:    secret,
	}
}

// WithAuth is a middleware that checks for the INTERNAL_SHARED_SECRET in the Authorization header.
func (s *Server) WithAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if s.secret == "" {
			// If no secret is configured, allow all (for development/backward compatibility)
			// But in production this should be set.
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader != "Bearer "+s.secret {
			http.Error(w, "Unauthorized: Invalid or missing internal secret", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	}
}

// Response defines the JSON payload for the health check.
type Response struct {
	Status          string         `json:"status"`
	UptimeSeconds   int64          `json:"uptime_seconds"`
	RealizedPnLCents int64         `json:"realized_pnl_cents"`
	CircuitBreakers map[string]any `json:"circuit_breakers"`
	Capacity        map[string]any `json:"capacity"`
	ExposureCents   map[string]any `json:"exposure_cents"`
	Trackers        map[string]int `json:"trackers"`
	Safety          map[string]any `json:"safety"`
	Postgres        string         `json:"postgres"`
	MemoryMB        uint64         `json:"memory_mb"`
}

// HandleHealth provides a snapshot of the bot's state using a Redis pipeline.
func (s *Server) HandleHealth(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	pnl, _ := s.dbLogger.GetInternalBalance(ctx)

	resp := Response{
		Status:           "OK",
		UptimeSeconds:    int64(time.Since(s.startTime).Seconds()),
		RealizedPnLCents: pnl,
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

	// Memory Stats
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	resp.MemoryMB = m.Alloc / 1024 / 1024

	// Safety Monitor
	errCount, lastErr, latency := s.safety.GetStatus()
	resp.Safety = map[string]any{
		"error_count":     errCount,
		"last_error_time": lastErr,
		"ws_latency_ms":   latency,
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

// HandleConfig GET/POST for managing bot parameters in Redis
func (s *Server) HandleConfig(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	if r.Method == http.MethodGet {
		keys := []string{
			"config:vig:leg:1", "config:vig:leg:2", "config:vig:leg:3", "config:vig:leg:4",
			"config:limit:daily", "config:limit:sport", "config:limit:leg",
		}
		
		config := make(map[string]string)
		for _, key := range keys {
			val, _ := s.rdb.Get(ctx, key).Result()
			config[key] = val
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(config)
		return
	}

	if r.Method == http.MethodPost {
		var body struct {
			Key   string `json:"key"`
			Value string `json:"value"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, "Invalid body", http.StatusBadRequest)
			return
		}

		if body.Key == "" {
			http.Error(w, "Missing key", http.StatusBadRequest)
			return
		}

		allowedKeys := map[string]bool{
			"config:vig:leg:1":   true,
			"config:vig:leg:2":   true,
			"config:vig:leg:3":   true,
			"config:vig:leg:4":   true,
			"config:limit:daily": true,
			"config:limit:sport": true,
			"config:limit:leg":   true,
			"circuit:global":     true,
		}

		if !allowedKeys[body.Key] {
			http.Error(w, "Forbidden: Invalid configuration key", http.StatusForbidden)
			return
		}

		if err := s.rdb.Set(ctx, body.Key, body.Value, 0).Err(); err != nil {
			http.Error(w, "Redis update failed", http.StatusInternalServerError)
			return
		}

		// Log specific admin actions to the Go terminal for visibility
		if body.Key == "circuit:global" {
			if body.Value == "HALT" {
				slog.Error("!!! ADMIN ACTION: Operations HALTED via Dashboard !!!")
			} else {
				slog.Info("!!! ADMIN ACTION: Operations RESUMED via Dashboard !!!")
			}
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]bool{"success": true})
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

// HandleAudit GET for fetching recent fills from Postgres
func (s *Server) HandleAudit(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.Query(ctx, `
		SELECT 
			quote_id, quote_req_id, sport, contracts_fp, 
			accepted_side, cost_cents, max_payout_cents, confirmed_at 
		FROM fill_log 
		ORDER BY confirmed_at DESC 
		LIMIT 50
	`)
	if err != nil {
		http.Error(w, "Database query failed", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	logs := make([]map[string]any, 0)
	for rows.Next() {
		var qid, qrid, sport, side string
		var contracts, cost, payout int64
		var confirmedAt time.Time
		
		if err := rows.Scan(&qid, &qrid, &sport, &contracts, &side, &cost, &payout, &confirmedAt); err != nil {
			continue
		}
		
		logs = append(logs, map[string]any{
			"quote_id": qid,
			"quote_req_id": qrid,
			"sport": sport,
			"contracts_fp": contracts,
			"accepted_side": side,
			"cost_cents": cost,
			"max_payout_cents": payout,
			"confirmed_at": confirmedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}

// HandleDecisionLogs GET returns the last 50 RFQ decisions (quoted or skipped)
func (s *Server) HandleDecisionLogs(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := s.db.Query(ctx, `
		SELECT 
			r.quote_req_id, r.sport, r.leg_count, r.quoted, r.skip_reason,
			q.quote_id, q.yes_price_cents, q.no_price_cents, q.latency_ms
		FROM rfq_log r
		LEFT JOIN quote_log q ON r.quote_req_id = q.quote_req_id
		ORDER BY r.quote_req_id DESC
		LIMIT 50
	`)
	if err != nil {
		http.Error(w, "Database query failed", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	logs := make([]map[string]any, 0)
	for rows.Next() {
		var qrid, sport string
		var legCount int
		var quoted bool
		var skipReason string
		var qid *string
		var yes, no *int
		var latency *float64
		
		if err := rows.Scan(&qrid, &sport, &legCount, &quoted, &skipReason, &qid, &yes, &no, &latency); err != nil {
			continue
		}
		
		logs = append(logs, map[string]any{
			"rfq_id":      qrid,
			"sport":       sport,
			"leg_count":   legCount,
			"quoted":      quoted,
			"skip_reason": skipReason,
			"quote_id":    qid,
			"yes":         yes,
			"no":          no,
			"latency":     latency,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}
