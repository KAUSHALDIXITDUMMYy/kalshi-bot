package bot

import (
	"sync"
	"time"

	"rfqbot/internal/pricing"
)

// quoteTracker remembers quote IDs we submitted so we only confirm our own fills.
type quoteTracker struct {
	mu  sync.Mutex
	ids map[string]time.Time
}

func newQuoteTracker() *quoteTracker {
	return &quoteTracker{ids: make(map[string]time.Time)}
}

func (t *quoteTracker) add(id string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.ids[id] = time.Now()
}

func (t *quoteTracker) owns(id string) bool {
	t.mu.Lock()
	defer t.mu.Unlock()
	_, ok := t.ids[id]
	return ok
}

func (t *quoteTracker) remove(id string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	delete(t.ids, id)
}

// Prune removes quotes older than the given duration to prevent memory leaks.
func (t *quoteTracker) Prune(olderThan time.Duration) {
	t.mu.Lock()
	defer t.mu.Unlock()
	now := time.Now()
	for id, ts := range t.ids {
		if now.Sub(ts) > olderThan {
			delete(t.ids, id)
		}
	}
}

func (t *quoteTracker) Count() int {
	t.mu.Lock()
	defer t.mu.Unlock()
	return len(t.ids)
}

// trackedRFQ wraps an RFQ with metadata for the requoting engine.
type trackedRFQ struct {
	rfq          pricing.RFQInput
	createdAt    time.Time
	lastQuotedAt time.Time
	lastYesBid   string
	isProcessing bool
}

// activeRFQTracker stores open RFQs so we can re-quote them if the orderbook changes.
type activeRFQTracker struct {
	mu   sync.RWMutex
	rfqs map[string]trackedRFQ
}

func newActiveRFQTracker() *activeRFQTracker {
	return &activeRFQTracker{rfqs: make(map[string]trackedRFQ)}
}

func (t *activeRFQTracker) addOrUpdate(rfq pricing.RFQInput, lastYesBid string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	
	// Preserve createdAt if updating an existing RFQ
	createdAt := time.Now()
	if existing, ok := t.rfqs[rfq.ID]; ok {
		createdAt = existing.createdAt
	}
	
	t.rfqs[rfq.ID] = trackedRFQ{
		rfq:          rfq,
		createdAt:    createdAt,
		lastQuotedAt: time.Now(),
		lastYesBid:   lastYesBid,
		isProcessing: false,
	}
}

func (t *activeRFQTracker) TryLockForRequote(id string) bool {
	t.mu.Lock()
	defer t.mu.Unlock()
	
	tr, ok := t.rfqs[id]
	if !ok {
		return false
	}
	
	// Throttle: Max 1 quote per second per RFQ
	if time.Since(tr.lastQuotedAt) < 1*time.Second {
		return false
	}
	
	// Concurrency lock: Don't start another requote if one is in flight
	if tr.isProcessing {
		return false
	}
	
	tr.isProcessing = true
	t.rfqs[id] = tr
	return true
}

func (t *activeRFQTracker) ReleaseLock(id string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	
	if tr, ok := t.rfqs[id]; ok {
		tr.isProcessing = false
		t.rfqs[id] = tr
	}
}

func (t *activeRFQTracker) remove(id string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	delete(t.rfqs, id)
}

func (t *activeRFQTracker) Get(id string) (pricing.RFQInput, bool) {
	t.mu.RLock()
	defer t.mu.RUnlock()
	tr, ok := t.rfqs[id]
	return tr.rfq, ok
}

func (t *activeRFQTracker) getAffectedRFQs(ticker string) []trackedRFQ {
	t.mu.RLock()
	defer t.mu.RUnlock()
	var affected []trackedRFQ
	for _, tr := range t.rfqs {
		// Check standard market
		if tr.rfq.MarketTicker == ticker {
			affected = append(affected, tr)
			continue
		}
		// Check parlay legs
		for _, leg := range tr.rfq.MVESelectedLegs {
			if leg.MarketTicker == ticker {
				affected = append(affected, tr)
				break
			}
		}
	}
	return affected
}

// Prune removes RFQs older than 2 minutes (RFQs naturally expire quickly).
func (t *activeRFQTracker) Prune() {
	t.mu.Lock()
	defer t.mu.Unlock()
	now := time.Now()
	for id, tr := range t.rfqs {
		if now.Sub(tr.createdAt) > 2*time.Minute {
			delete(t.rfqs, id)
		}
	}
}

func (t *activeRFQTracker) Count() int {
	t.mu.RLock()
	defer t.mu.RUnlock()
	return len(t.rfqs)
}
