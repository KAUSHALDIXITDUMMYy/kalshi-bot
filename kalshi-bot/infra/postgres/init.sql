-- Kalshi RFQ Bot Database Schema

-- ALL INCOMING RFQS
CREATE TABLE rfq_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_req_id UUID NOT NULL UNIQUE,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sport TEXT NOT NULL,
    leg_count INTEGER NOT NULL,
    legs JSONB NOT NULL, -- [{event_ticker, market_ticker, side}]
    contracts_fp DECIMAL(10,2),
    target_cost_usd DECIMAL(10,2),
    requester_id TEXT,
    quoted BOOLEAN DEFAULT FALSE,
    skip_reason TEXT
);

CREATE INDEX idx_rfq_received ON rfq_log(received_at DESC);

-- ALL SUBMITTED QUOTES
CREATE TABLE quote_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL UNIQUE,
    quote_req_id UUID NOT NULL REFERENCES rfq_log(quote_req_id),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    yes_price_cents INTEGER NOT NULL,
    no_price_cents INTEGER NOT NULL,
    composite_prob DECIMAL(8,6),
    vig_applied INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    accepted_side CHAR(1),
    status_updated_at TIMESTAMPTZ,
    latency_ms DECIMAL(8,2)
);

-- ALL CONFIRMED FILLS
CREATE TABLE fill_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES quote_log(quote_id),
    quote_req_id UUID NOT NULL, -- Back-reference for full traceability
    filled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sport TEXT NOT NULL,
    contracts_fp DECIMAL(10,2) NOT NULL,
    accepted_side TEXT NOT NULL, -- 'YES' or 'NO'
    cost_cents INTEGER NOT NULL, -- What buyer paid
    max_payout_cents INTEGER NOT NULL, -- Our max liability
    yes_price_cents INTEGER NOT NULL,
    no_price_cents INTEGER NOT NULL,
    legs JSONB NOT NULL,
    settled BOOLEAN DEFAULT FALSE,
    market_result TEXT, -- 'yes' or 'no' after settlement
    pnl_cents INTEGER, -- Populated after settlement
    confirmed_at TIMESTAMPTZ
);

CREATE INDEX idx_fill_sport ON fill_log(sport, filled_at DESC);
CREATE INDEX idx_fill_settled ON fill_log(settled, filled_at DESC);
CREATE INDEX idx_fill_quote_req ON fill_log(quote_req_id);

-- DAILY SUMMARY
CREATE TABLE daily_pnl (
    date DATE NOT NULL,
    sport TEXT NOT NULL,
    rfqs_received INTEGER DEFAULT 0,
    quotes_sent INTEGER DEFAULT 0,
    fills_count INTEGER DEFAULT 0,
    total_wagered_cents BIGINT DEFAULT 0,
    total_liability_cents BIGINT DEFAULT 0,
    gross_pnl_cents BIGINT,
    win_rate_pct DECIMAL(5,2),
    avg_latency_ms DECIMAL(8,2),
    UNIQUE(date, sport)
);
