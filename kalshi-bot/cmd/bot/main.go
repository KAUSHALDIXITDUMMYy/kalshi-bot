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
	"rfqbot/internal/kalshi"
	"rfqbot/internal/pricing"
	"rfqbot/internal/ws"
)

func main() {
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

	pe, err := pricing.NewEngine(cfg)
	if err != nil {
		log.Error("pricing", "err", err)
		os.Exit(1)
	}

	kc := kalshi.NewClient(cfg.RESTBase, signer)
	eng := bot.NewEngine(cfg, log, kc, pe)

	log.Info("rfqbot starting",
		"rest", cfg.RESTBase,
		"ws", cfg.WebSocketURL,
		"dry_run", cfg.DryRun,
		"quote_enabled", cfg.QuoteEnabled,
		"strategy", cfg.Strategy,
	)

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	go ws.RunDialLoop(ctx, log, cfg.WebSocketURL, signer, eng.HandleWSMessage, cfg.ShardFactor, cfg.ShardKey)

	<-ctx.Done()
	log.Info("shutdown")
}
