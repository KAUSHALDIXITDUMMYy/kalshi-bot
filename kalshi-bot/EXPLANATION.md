# What Is Kalshi, and What Does This Project Do?

This document explains **Kalshi** as a trading venue and **this codebase** (a Go “RFQ bot”) in concrete terms.



## What is Kalshi?

**Kalshi** is a **U.S.-regulated exchange** where people trade **event contracts** (sometimes called prediction markets in casual language). Each contract is tied to a **yes/no question** about a future outcome (for example, economic indicators, weather thresholds, or other defined events). Prices are typically expressed in **cents per dollar** of payout: a “Yes” at 48¢ means the market implies roughly a 48% implied probability that the event settles “Yes,” subject to fees, liquidity, and how the contract is defined.

In practice, Kalshi provides:

- **Markets** (individual tradable contracts, identified by tickers).
- **REST and WebSocket APIs** so automated systems can stream data, place orders, and use platform features that support institutional or advanced workflows.
- **Authentication** using an API key plus **RSA** signing (your private key signs requests; Kalshi holds the matching public key).

Kalshi’s own documentation lives at [Kalshi API docs](https://docs.kalshi.com/). This project targets **Trade API v2** URLs (demo by default; production host differs—see `README.md` and `env.example`).

-

## Key idea for this bot: RFQs and quotes

Not all trading on Kalshi is only “post a resting order on the book.” Some flows use **communications** around **requests for quote (RFQ)**:

1. **Someone (often a counterparty or internal flow) creates an RFQ** — essentially a structured request: “What prices would you offer for this bundle / this exposure?” The RFQ carries identifiers (e.g. market ticker, event ticker, size/cost hints, and possibly multi-leg / MVE-related fields).
2. **Liquidity providers can respond with a quote** — bid prices for **Yes** and **No** sides (in dollar-string form as required by the API).
3. If the requester **accepts** a quote, the provider may need to **confirm** that quote via a follow-up API call so the process can complete according to Kalshi’s rules.

This bot is built to participate in that **RFQ → quote → accept → confirm** loop as an automated responder, not as a generic “click to trade” retail app.

---

## What this repository does (in detail)

This repo is a **Go** service (`rfqbot`) that:

1. **Loads configuration** from environment variables (API key id, path to PEM private key, REST base URL, WebSocket URL, dry-run flags, pricing strategy, optional sharding).
2. **Authenticates** to Kalshi using **RSA-PSS** signing for both REST and the WebSocket handshake (`internal/auth`).
3. **Opens a WebSocket** to Kalshi’s trade API, subscribes to the **`communications`** channel, and **reconnects with backoff** if the connection drops (`internal/ws`). Optional **shard_factor** / **shard_key** can be set for communications sharding when Kalshi expects it.
4. **Parses incoming messages** (`internal/bot`):
   - **`rfq_created`**: Reads the RFQ id, market/event tickers, target cost, contracts, MVE collection, selected legs, etc., and logs them. If quoting is allowed, it asks the **pricing engine** for `yes_bid` and `no_bid`, then **POSTs** a quote to `POST /communications/quotes` via `internal/kalshi`. It **tracks** the returned **quote id** as “ours.”
   - **`quote_accepted`**: If the `quote_id` belongs to this process, it **PUTs** `.../communications/quotes/{id}/confirm` to confirm. Other event types are mostly logged at debug/info.
5. **Pricing** is **pluggable** (`internal/pricing`):
   - **`noop`**: Never returns prices (quotes are skipped when this strategy would be used for pricing).
   - **`fixed`**: Returns constant Yes/No bids from environment variables—useful for demos or wiring tests, **not** a full market-making model.

**Safety defaults:** By default the bot runs in **`KALSHI_DRY_RUN=true`**, which **logs RFQs but does not send quotes**. Even with dry run off, **`KALSHI_QUOTE_ENABLED`** must be **true** before the REST quote path runs. That reduces the chance of accidentally posting quotes while developing.

---

## How the pieces map to folders

| Area | Package / path | Role |
|------|----------------|------|
| Entrypoint | `cmd/bot/main.go` | Wire config, signer, Kalshi REST client, bot engine, start WebSocket loop until shutdown signal. |
| Config | `internal/config` | Env-based settings (demo vs prod URLs, dry run, strategy, bids, sharding). |
| Auth | `internal/auth` | Sign REST requests and WebSocket handshake per Kalshi’s scheme. |
| REST | `internal/kalshi` | `CreateQuote`, `ConfirmQuote` against trade-api v2. |
| WebSocket | `internal/ws` | Dial, subscribe to `communications`, ping/pong, reconnect. |
| Orchestration | `internal/bot` | Map WS events to pricing + REST; track which quote ids we created. |
| Pricing | `internal/pricing` | `noop` / `fixed` implementations of `Engine.Price`. |

---

## What this bot is *not* (yet)

- It does **not** implement a full **fair value** or **inventory-aware** pricing model; `fixed` is a stub.
- It does **not** replace reading **Kalshi’s terms, fees, and API contract**; behavior can change when Kalshi updates APIs.
- It is **not** financial advice; running a quoting bot has **P&L and operational risk** (latency, rejections, partial fills, policy changes, etc.).

---

## Summary

- **Kalshi** is a regulated exchange for **event contracts**, with APIs for automated access.
- **This project** is an **RFQ response bot**: it **listens** on the **communications** WebSocket, optionally **submits quotes** via REST when RFQs appear, and **confirms** when its quotes are **accepted**—with **dry run** and **quote enabled** gates plus simple pricing strategies.

For how to run it, see `README.md` and `env.example`.
