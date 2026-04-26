package bot

import (
	"encoding/json"

	"rfqbot/internal/pricing"
)

// WSEvent is the outer envelope for all WebSocket messages
type WSEvent struct {
	Type string          `json:"type"`
	Msg  json.RawMessage `json:"msg"`
}

// RFQMsg is the typed struct for rfq_created messages
type RFQMsg struct {
	ID                  string   `json:"id"`
	MarketTicker        string   `json:"market_ticker"`
	EventTicker         string   `json:"event_ticker"`
	TargetCostDollars   string   `json:"target_cost_dollars"`
	ContractsFP         string           `json:"contracts_fp"`
	MVECollectionTicker string           `json:"mve_collection_ticker"`
	CreatorID           string           `json:"creator_id"`
	MVESelectedLegs     []pricing.MVELeg `json:"mve_selected_legs"`
	IsHVM               bool             `json:"is_hvm"`
}

// QuoteAcceptedMsg is the typed struct for quote_accepted messages
type QuoteAcceptedMsg struct {
	QuoteID             string `json:"quote_id"`
	RFQID               string `json:"rfq_id"`
	AcceptedSide        string `json:"accepted_side"`
	ContractsAcceptedFP string `json:"contracts_accepted_fp"`
	YesBidDollars       string `json:"yes_bid_dollars"`
	MarketTicker        string `json:"market_ticker"`
	IsHVM               bool   `json:"is_hvm"`
}

// MarketSettledMsg is the typed struct for market settlement events
type MarketSettledMsg struct {
	MarketTicker string `json:"market_ticker"`
	Status       string `json:"status"`
}
