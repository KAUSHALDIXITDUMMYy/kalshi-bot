package bot

import "sync"

// quoteTracker remembers quote IDs we submitted so we only confirm our own fills.
type quoteTracker struct {
	mu sync.Mutex
	ids map[string]struct{}
}

func newQuoteTracker() *quoteTracker {
	return &quoteTracker{ids: make(map[string]struct{})}
}

func (t *quoteTracker) add(id string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.ids[id] = struct{}{}
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
