package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"rfqbot/internal/auth"
	"rfqbot/internal/bot"
	"rfqbot/internal/config"
	"rfqbot/internal/db"
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

	pe, err := pricing.NewEngine(cfg, pc)
	if err != nil {
		log.Error("pricing", "err", err)
		os.Exit(1)
	}

	dbLog := db.NewLogger(pool)
	risk := bot.NewRiskEngine(cfg, log, rdb)
	safety := bot.NewSafetyMonitor(log, rdb)
	eng := bot.NewEngine(cfg, log, kc, pe, pc, pool, rdb, dbLog, risk, safety)

	log.Info("rfqbot starting",
		"rest", cfg.RESTBase,
		"ws", cfg.WebSocketURL,
		"dry_run", cfg.DryRun,
		"quote_enabled", cfg.QuoteEnabled,
		"strategy", cfg.Strategy,
	)

	ctx, cancel = signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	// 0. Start Background Roster Sync
	if !cfg.DryRun {
		// Uses BALLDONTLIE_API_KEY if present in environment, else attempts without it
		pricing.StartDailyRosterSync(os.Getenv("BALLDONTLIE_API_KEY"))
	}

	// 1. Fetch Active Markets (needed for orderbook subscription)
	tickers, err := kc.GetMarkets(ctx)
	if err != nil {
		log.Error("get markets", "err", err)
		// Don't exit here, maybe we can still process RFQs even if initial pricing is blind
	}
	log.Info("active markets fetched", "count", len(tickers))

	// 2. Communications Loop (RFQs)
	go ws.RunDialLoop(ctx, log, cfg.WebSocketURL, signer, eng.HandleWSMessage, []string{"communications"}, nil, cfg.ShardFactor, cfg.ShardKey)

	// 3. Orderbook Loop (Market Data)
	if len(tickers) > 0 {
		params := map[string]any{
			"market_tickers": tickers,
		}
		go ws.RunDialLoop(ctx, log, cfg.WebSocketURL, signer, eng.HandleWSMessage, []string{"orderbook_delta"}, params, cfg.ShardFactor, cfg.ShardKey)
	}

	<-ctx.Done()
	log.Info("shutdown")
}
