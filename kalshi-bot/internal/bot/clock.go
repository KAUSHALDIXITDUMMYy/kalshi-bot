package bot

import (
	"context"
	"log/slog"
	"time"

	"github.com/beevik/ntp"
)

// ClockMonitor checks for system clock drift against NTP servers.
// Significant drift causes RSA signature failures with Kalshi.
type ClockMonitor struct {
	log    *slog.Logger
	safety *SafetyMonitor
}

func NewClockMonitor(log *slog.Logger, safety *SafetyMonitor) *ClockMonitor {
	return &ClockMonitor{
		log:    log,
		safety: safety,
	}
}

// Start initiates the periodic drift check.
func (c *ClockMonitor) Start(ctx context.Context) {
	ticker := time.NewTicker(1 * time.Minute)
	go func() {
		for {
			select {
			case <-ticker.C:
				c.CheckDrift(ctx)
			case <-ctx.Done():
				ticker.Stop()
				return
			}
		}
	}()
}

// CheckDrift queries an NTP server and compares it to the local system time.
func (c *ClockMonitor) CheckDrift(ctx context.Context) {
	// Query pool.ntp.org
	response, err := ntp.Query("pool.ntp.org")
	if err != nil {
		c.log.Warn("clock monitor: ntp query failed", "err", err)
		return
	}

	drift := response.ClockOffset
	driftSeconds := drift.Seconds()
	if driftSeconds < 0 {
		driftSeconds = -driftSeconds
	}

	c.log.Debug("clock drift check", "offset_seconds", response.ClockOffset.Seconds())

	// Threshold: 2.0 seconds (per 1.md Section 3.4)
	if driftSeconds > 2.0 {
		c.log.Error("CRITICAL CLOCK DRIFT DETECTED", "offset", drift.String())
		c.safety.TriggerHalt(ctx, "critical_clock_drift:"+drift.String())
	}
}
