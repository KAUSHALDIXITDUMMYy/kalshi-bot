# Kalshi RFQ bot (Go)

Market-maker style loop: authenticated WebSocket (`communications` channel) → optional quote via REST → confirm on `quote_accepted` for quotes this process created.

## Quick start

1. Create API keys in the Kalshi dashboard and save the RSA private key as a PEM file.
2. Copy `env.example` to `.env` or set variables in your shell (on Windows, use `set` / system env).
3. Run:

```bash
go run ./cmd/bot
```

Default is **dry run**: RFQs are logged; no quotes are sent. To send quotes on demo, set `KALSHI_DRY_RUN=false`, `KALSHI_QUOTE_ENABLED=true`, and `KALSHI_STRATEGY=fixed` with `KALSHI_FIXED_YES_BID` / `KALSHI_FIXED_NO_BID` (valid dollar strings for that market).

## Correlation Engine

The bot includes an advanced `Correlation Engine` that dynamically penalizes highly-correlated parlays (e.g., Same Game or Same Team parlays).
To safely map players to teams, the bot runs a background caching worker.

**Required:** You must obtain a free API key from [balldontlie.io](https://www.balldontlie.io/) and add it to your `.env` file or system environment variables:
`BALLDONTLIE_API_KEY=your_key`

The bot runs a background fetch daily at 3:00 AM to keep the internal memory map updated. If the key is missing, the sync will fail but the bot will safely fall back to its internal mock dataset.

## Build

```bash
go build -o kalshi-rfq-bot ./cmd/bot
```

## Layout

- `cmd/bot` — entrypoint
- `internal/auth` — RSA-PSS signing (REST + WebSocket handshake)
- `internal/kalshi` — REST: create quote, confirm quote
- `internal/ws` — WebSocket dial, subscribe, read loop with reconnect
- `internal/bot` — RFQ / quote-accepted handling
- `internal/pricing` — pluggable strategy (`noop` / `fixed` stub)

Production URLs match [Kalshi API docs](https://docs.kalshi.com/): REST `https://api.elections.kalshi.com/trade-api/v2`, WebSocket `wss://api.elections.kalshi.com/trade-api/ws/v2`.
