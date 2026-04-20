package bot

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

type SafetyMonitor struct {
	log           *slog.Logger
	rdb           *redis.Client
	mu            sync.Mutex
	errorCount    int
	lastErrorTime time.Time
}

func NewSafetyMonitor(log *slog.Logger, rdb *redis.Client) *SafetyMonitor {
	return &SafetyMonitor{
		log: log,
		rdb: rdb,
	}
}

// RecordError tracks exchange rejections.
func (s *SafetyMonitor) RecordError(ctx context.Context, err error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	// Reset counter if last error was more than 1 minute ago (as per 1.md Section 8.2)
	if now.Sub(s.lastErrorTime) > 1*time.Minute {
		s.errorCount = 0
	}

	s.errorCount++
	s.lastErrorTime = now

	s.log.Warn("safety: error recorded", "count", s.errorCount, "err", err)

	// Threshold: 5 errors in 1 minute
	if s.errorCount >= 5 {
		s.TriggerHalt(ctx, fmt.Sprintf("high_error_rate:%d_errors_in_1min", s.errorCount))
	}
}

// RecordLatency tracks pricing speed.
func (s *SafetyMonitor) RecordLatency(ctx context.Context, latencyMS float64) {
	if latencyMS > 500 {
		s.log.Warn("safety: high latency detected", "latency_ms", latencyMS)
		// If it's > 1.0s, halt immediately (as per 4.md Section 4.2)
		if latencyMS > 1000 {
			s.TriggerHalt(ctx, fmt.Sprintf("critical_latency:%.2fms", latencyMS))
		}
	}
}

// TriggerHalt sets the global circuit breaker in Redis.
func (s *SafetyMonitor) TriggerHalt(ctx context.Context, reason string) {
	s.log.Error("!!! SAFETY HALT TRIGGERED !!!", "reason", reason)
	
	// Set the global halt flag in Redis for 1 hour
	err := s.rdb.Set(ctx, "circuit:global", "HALT", 1*time.Hour).Err()
	if err != nil {
		s.log.Error("failed to set global halt in redis", "err", err)
	}

	// Also log a specific event key for observability
	s.rdb.Set(ctx, "safety:last_halt_reason", reason, 24*time.Hour)
}
