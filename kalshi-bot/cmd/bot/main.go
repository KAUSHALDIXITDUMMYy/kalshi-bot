package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"rfqbot/internal/auth"
	"rfqbot/internal/bot"
	"rfqbot/internal/config"
	"rfqbot/internal/db"
	"rfqbot/internal/health"
	"rfqbot/internal/kalshi"
	"rfqbot/internal/pricing"
	"rfqbot/internal/redis"
	"rfqbot/internal/ws"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if it exists
	_ = godotenv.Load()

	log := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))

	cfg, err := config.FromEnv()
	if err != nil {
		log.Error("config", "err", err)
		os.Exit(1)
	}

	signer, err := auth.NewSigner(cfg.PrivateKeyPath, cfg.APIKeyID)
	if err != nil {
		log.Error("auth", "err", err)
		os.Exit(1)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	// Connect to Infrastructure
	pool, err := db.Connect(ctx, cfg.DBURL)
	if err != nil {
		log.Error("postgres", "err", err)
		os.Exit(1)
	}
	defer pool.Close()

	rdb, err := redis.Connect(ctx, cfg.RedisURL)
	if err != nil {
		log.Error("redis", "err", err)
		os.Exit(1)
	}
	defer rdb.Close()

	kc := kalshi.NewClient(cfg.RESTBase, signer)
	pc := pricing.NewPriceCache()
	risk := bot.NewRiskEngine(cfg, log, rdb)
	pe, err := pricing.NewEngine(cfg, pc, risk)
	if err != nil {
		log.Error("pricing", "err", err)
		os.Exit(1)
	}

	dbLog := db.NewLogger(pool)
	safety := bot.NewSafetyMonitor(log, rdb)
	eng := bot.NewEngine(cfg, log, kc, pe, pc, pool, rdb, dbLog, risk, safety)
	eng.StartBackgroundCleanup(ctx)

	clock := bot.NewClockMonitor(log, safety)
	clock.Start(ctx)

	recon := bot.NewReconciliationEngine(log, kc, dbLog, rdb, safety)
	recon.Start(ctx)

	log.Info("rfqbot starting",
		"rest", cfg.RESTBase,
		"ws", cfg.WebSocketURL,
		"dry_run", cfg.DryRun,
		"quote_enabled", cfg.QuoteEnabled,
		"strategy", cfg.Strategy,
	)

	// Start Health Check API
	healthSrv := health.NewServer(rdb, pool, dbLog, eng, safety, os.Getenv("INTERNAL_SHARED_SECRET"))
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthSrv.WithAuth(healthSrv.HandleHealth))
	mux.HandleFunc("/config", healthSrv.WithAuth(healthSrv.HandleConfig))
	mux.HandleFunc("/audit", healthSrv.WithAuth(healthSrv.HandleAudit))
	healthPort := os.Getenv("HEALTH_PORT")
	if healthPort == "" {
		healthPort = "8080"
	}
	go func() {
		log.Info("Health API listening (SECURED)", "port", healthPort)
		if err := http.ListenAndServe(":"+healthPort, mux); err != nil {
			log.Error("health server failed", "err", err)
		}
	}()

	// 0. Start Background Roster Sync
	// Run even in DryRun so that logs and pricing logic are accurate
	// Uses BALLDONTLIE_API_KEY if present in environment, else attempts without it
	pricing.StartDailyRosterSync(os.Getenv("BALLDONTLIE_API_KEY"))

	// 1. Fetch Active Markets (needed for orderbook subscription)
	tickers, err := kc.GetMarkets(ctx)
	if err != nil {
		log.Error("get markets", "err", err)
		// Don't exit here, maybe we can still process RFQs even if initial pricing is blind
	}
	log.Info("active markets fetched", "count", len(tickers))

	// 2. Market Lifecycle Loop (Settlement/Risk Unclogging)
	// We do not need specific tickers to listen to general lifecycle events
	go ws.RunDialLoop(ctx, log, cfg.WebSocketURL, signer, eng.HandleWSMessage, []string{"market_lifecycle_v2"}, nil, 0, 0)

	// 3. Orderbook Loop (Market Data)
	if len(tickers) > 0 {
		params := map[string]any{
			"market_tickers": tickers,
		}
		// orderbook_delta does not support sharding, pass 0, 0
		go ws.RunDialLoop(ctx, log, cfg.WebSocketURL, signer, eng.HandleWSMessage, []string{"orderbook_delta"}, params, 0, 0)
	}

	// 4. Cache Warm-Up
	// We wait 3 seconds to let the initial orderbook_snapshots arrive and populate our cache 
	// before we start listening to RFQs. This fixes the "Snapshot Latency" cache misses.
	log.Info("warming up price cache for 3 seconds...")
	time.Sleep(3 * time.Second)

	// 5. Communications Loop (RFQs)
	go ws.RunDialLoop(ctx, log, cfg.WebSocketURL, signer, eng.HandleWSMessage, []string{"communications"}, nil, cfg.ShardFactor, cfg.ShardKey)

	<-ctx.Done()
	log.Info("shutdown")
}
