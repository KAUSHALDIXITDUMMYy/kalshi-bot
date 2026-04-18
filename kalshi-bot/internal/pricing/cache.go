package pricing

import (
	"encoding/json"
	"sync"
	"time"
)

// Price holds the best available prices for a market.
type Price struct {
	BestYesBid int
	BestYesAsk int
	UpdatedAt  time.Time
}

// marketBook tracks the full depth of a single market's order book.
type marketBook struct {
	Bids      map[int]int // price -> quantity
	Asks      map[int]int // price -> quantity
	UpdatedAt time.Time
}

// PriceCache maintains a real-time view of market prices using WebSocket deltas.
type PriceCache struct {
	mu     sync.RWMutex
	books  map[string]*marketBook
}

func NewPriceCache() *PriceCache {
	return &PriceCache{
		books: make(map[string]*marketBook),
	}
}

// Get returns the latest best prices for a ticker.
func (pc *PriceCache) Get(ticker string) (Price, bool) {
	pc.mu.RLock()
	defer pc.mu.RUnlock()
	book, ok := pc.books[ticker]
	if !ok {
		return Price{}, false
	}

	res := Price{
		UpdatedAt: book.UpdatedAt,
	}
	// Find Best Bid (highest price with qty > 0)
	for p, q := range book.Bids {
		if q > 0 && p > res.BestYesBid {
			res.BestYesBid = p
		}
	}
	// Find Best Ask (lowest price with qty > 0)
	for p, q := range book.Asks {
		if q > 0 && (res.BestYesAsk == 0 || p < res.BestYesAsk) {
			res.BestYesAsk = p
		}
	}
	return res, true
}

// HandleDelta processes an orderbook_delta or orderbook_snapshot message.
func (pc *PriceCache) HandleDelta(payload []byte) {
	var raw struct {
		Type string `json:"type"`
		Msg  struct {
			MarketTicker string `json:"market_ticker"`
			Bids         [][]int `json:"bids"` // Used for snapshots: [price, quantity]
			Asks         [][]int `json:"asks"` // Used for snapshots
			PriceDelta   []struct {
				Price int    `json:"price"`
				Delta int    `json:"delta"`
				Side  string `json:"side"`
			} `json:"price_delta"` // Used for deltas
		} `json:"msg"`
	}

	if err := json.Unmarshal(payload, &raw); err != nil {
		return
	}

	pc.mu.Lock()
	defer pc.mu.Unlock()

	book, ok := pc.books[raw.Msg.MarketTicker]
	if !ok {
		book = &marketBook{
			Bids: make(map[int]int),
			Asks: make(map[int]int),
		}
		pc.books[raw.Msg.MarketTicker] = book
	}
	book.UpdatedAt = time.Now()

	// Handle Snapshot
	if len(raw.Msg.Bids) > 0 || len(raw.Msg.Asks) > 0 {
		for _, b := range raw.Msg.Bids {
			book.Bids[b[0]] = b[1]
		}
		for _, a := range raw.Msg.Asks {
			book.Asks[a[0]] = a[1]
		}
	}

	// Handle Delta
	for _, d := range raw.Msg.PriceDelta {
		if d.Side == "yes" {
			book.Bids[d.Price] += d.Delta
		} else {
			book.Asks[d.Price] += d.Delta
		}
	}
}
