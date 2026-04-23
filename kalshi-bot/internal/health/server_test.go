package health

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandleHealth_DegradedMode(t *testing.T) {
	// Initialize without a Redis client to ensure the fallback logic works
	// and doesn't panic on nil pipeline.
	svc := NewServer(nil)

	req, err := http.NewRequest("GET", "/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(svc.HandleHealth)

	// Execute
	handler.ServeHTTP(rr, req)

	// Verify Status Code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Verify JSON body
	var resp Response
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response body as json: %v", err)
	}

	if resp.Status != "DEGRADED (No Redis Engine)" {
		t.Errorf("expected DEGRADED status, got %v", resp.Status)
	}

	if resp.Capacity["max_allowed"] != float64(100) {
		t.Errorf("expected max_allowed 100, got %v", resp.Capacity["max_allowed"])
	}
}
