# Kalshi API key setup and environment variables

This guide walks through creating Kalshi API credentials and setting the variables this bot reads. Official reference: [Kalshi API keys](https://docs.kalshi.com/getting_started/api_keys).

---

## Part 1: Create API access (Kalshi account)

The **same key-creation flow** applies whether you use **demo** or **production** API hosts; you choose demo vs prod later via environment URLs.

### 1. Open a Kalshi account

1. Go to [https://kalshi.com](https://kalshi.com) and sign up or log in.
2. Complete any identity or funding steps Kalshi requires for your use case (their product and compliance rules apply to you directly).

### 2. Open Profile / API Keys

1. While logged in, open **Account / profile** settings.  
2. Direct link (as in Kalshi docs): [https://kalshi.com/account/profile](https://kalshi.com/account/profile).  
3. Find the **API Keys** section.

### 3. Generate a key pair

1. Click **Create New API Key** (wording may match Kalshi’s UI).  
2. Kalshi will show:
   - **Key ID** — a UUID-style identifier (this is *not* secret; it identifies the key).  
   - **Private key** — your **secret** RSA key material.  
3. **Important:** Kalshi does **not** keep your private key. After you leave the page you **cannot** download the same secret again. Copy it immediately and store it safely.

### 4. Save the private key as a PEM file for this bot

This project’s signer expects a **PEM** file: text that includes lines like `-----BEGIN ... PRIVATE KEY-----` and `-----END ... PRIVATE KEY-----`.

1. If Kalshi offers a download (e.g. `.txt`), open the file and confirm it contains those `BEGIN` / `END` lines.  
2. Save the file with a stable name and location, for example:
   - `C:\Users\<YourUser>\secrets\kalshi-demo.pem`  
3. If the downloaded file has no `.pem` extension but the contents are PEM, you can rename it to `.pem` or save a copy as `.pem`.  
4. **Do not** commit this file to git or share it. Keep permissions tight on your machine.

You will use the **full path** to this file as `KALSHI_PRIVATE_KEY_PATH`.

---

## Part 2: Map Kalshi outputs to environment variables

| Kalshi gives you | Set this variable | Notes |
|------------------|-------------------|--------|
| Key ID (UUID) | `KALSHI_ACCESS_KEY_ID` | Exact string from the dashboard. |
| Private key file path | `KALSHI_PRIVATE_KEY_PATH` | Absolute path is easiest on Windows (see below). |

Optional URLs (defaults are **demo** if unset):

| Variable | Demo (default in `env.example`) | Production (from project `README.md`) |
|----------|----------------------------------|----------------------------------------|
| `KALSHI_REST_BASE` | `https://demo-api.kalshi.co/trade-api/v2` | `https://api.elections.kalshi.com/trade-api/v2` |
| `KALSHI_WS_URL` | `wss://demo-api.kalshi.co/trade-api/ws/v2` | `wss://api.elections.kalshi.com/trade-api/ws/v2` |

Other variables are documented in `env.example` (dry run, quoting, fixed bids, sharding).

---

## Part 3: Set variables on Windows

This program reads **process environment variables** only. A file named `.env` is **not** loaded automatically unless you use another tool to inject it.

### Option A — Current PowerShell session (good for testing)

Replace the placeholders with your real values and path:

```powershell
$env:KALSHI_ACCESS_KEY_ID = "your-key-id-uuid-here"
$env:KALSHI_PRIVATE_KEY_PATH = "C:\Users\YourUser\secrets\kalshi-demo.pem"
# Optional: keep demo defaults, or set production URLs explicitly
# $env:KALSHI_REST_BASE = "https://demo-api.kalshi.co/trade-api/v2"
# $env:KALSHI_WS_URL = "wss://demo-api.kalshi.co/trade-api/ws/v2"
```

Then, from your project folder:

```powershell
cd "C:\Users\kaush\Desktop\Everything new here\Kalshi Bot\Version 1"
go run ./cmd/bot
```

Variables set this way apply only to **that** PowerShell window.

### Option B — User or system environment (persistent)

1. Press **Win + R**, type `sysdm.cpl`, Enter.  
2. **Advanced** tab → **Environment Variables**.  
3. Under **User variables** (or **System** if you prefer), click **New**:
   - Name: `KALSHI_ACCESS_KEY_ID` — Value: your Key ID.  
   - Name: `KALSHI_PRIVATE_KEY_PATH` — Value: full path to your `.pem` file.  
4. Add optional variables the same way if needed (`KALSHI_REST_BASE`, `KALSHI_WS_URL`, etc.).  
5. **OK** out, then **open a new** terminal so `go run` sees the new values.

### Option C — Copy from `env.example` and load manually

1. Copy `env.example` to `.env` and fill in secrets (do **not** commit `.env`).  
2. Either paste each line into Option A/B, or use a small helper that exports `.env` before `go run` (the Go app itself does not read `.env`).

---

## Part 4: Quick verification checklist

- [ ] Kalshi account can log in; API key created on **Profile → API Keys**.  
- [ ] Key ID copied into `KALSHI_ACCESS_KEY_ID`.  
- [ ] Private key saved as PEM; path set in `KALSHI_PRIVATE_KEY_PATH` (no typos, file exists).  
- [ ] Demo vs production URLs match where you intend to connect.  
- [ ] `go run ./cmd/bot` run from the repository root after env vars are set.

Default behavior remains **safe for first runs**: `KALSHI_DRY_RUN=true` logs RFQs without sending quotes unless you change `env.example`-style settings on purpose.

---

## References

- [Kalshi API keys](https://docs.kalshi.com/getting_started/api_keys)  
- [Kalshi API documentation](https://docs.kalshi.com/)  
- This repo: `README.md`, `env.example`, `EXPLANATION.md`
