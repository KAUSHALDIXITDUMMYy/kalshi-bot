package kalshi

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"rfqbot/internal/auth"
)

// Client is a signed REST client for Kalshi trade-api v2.
type Client struct {
	base       string
	signer     *auth.Signer
	httpClient *http.Client
}

func NewClient(base string, signer *auth.Signer) *Client {
	return &Client{
		base:   base,
		signer: signer,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

const tradeAPIPrefix = "/trade-api/v2"

func (c *Client) do(ctx context.Context, method, relPath string, body []byte) (*http.Response, error) {
	if relPath == "" || relPath[0] != '/' {
		return nil, fmt.Errorf("path must start with /")
	}
	u := c.base + relPath
	signPath := tradeAPIPrefix + relPath
	req, err := http.NewRequestWithContext(ctx, method, u, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	if len(body) > 0 {
		req.Header.Set("Content-Type", "application/json")
	}
	ts := strconv.FormatInt(time.Now().UnixMilli(), 10)
	sig, err := c.signer.SignREST(ts, method, signPath)
	if err != nil {
		return nil, err
	}
	req.Header.Set("KALSHI-ACCESS-KEY", c.signer.KeyID())
	req.Header.Set("KALSHI-ACCESS-SIGNATURE", sig)
	req.Header.Set("KALSHI-ACCESS-TIMESTAMP", ts)
	return c.httpClient.Do(req)
}

// CreateQuoteRequest matches POST /communications/quotes.
type CreateQuoteRequest struct {
	RFQID         string `json:"rfq_id"`
	YesBid        string `json:"yes_bid"`
	NoBid         string `json:"no_bid"`
	RestRemainder bool   `json:"rest_remainder"`
}

type CreateQuoteResponse struct {
	ID string `json:"id"`
}

type Market struct {
	Ticker string `json:"ticker"`
}

type GetMarketsResponse struct {
	Markets []Market `json:"markets"`
}

func (c *Client) CreateQuote(ctx context.Context, req CreateQuoteRequest) (string, error) {
	b, err := json.Marshal(req)
	if err != nil {
		return "", err
	}
	resp, err := c.do(ctx, http.MethodPost, "/communications/quotes", b)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("create quote: status %d: %s", resp.StatusCode, string(respBody))
	}
	var out CreateQuoteResponse
	if err := json.Unmarshal(respBody, &out); err != nil {
		return "", fmt.Errorf("decode create quote: %w", err)
	}
	return out.ID, nil
}

func (c *Client) ConfirmQuote(ctx context.Context, quoteID string) error {
	path := "/communications/quotes/" + quoteID + "/confirm"
	resp, err := c.do(ctx, http.MethodPut, path, nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("confirm quote: status %d: %s", resp.StatusCode, string(body))
	}
	return nil
}

func (c *Client) GetMarkets(ctx context.Context) ([]string, error) {
	// status=open is usually what we want for RFQ market making
	// 1000 is a safe upper bound for demo, but we should handle pagination for prod
	resp, err := c.do(ctx, http.MethodGet, "/markets?status=open&limit=1000", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("get markets: status %d: %s", resp.StatusCode, string(body))
	}
	var out GetMarketsResponse
	if err := json.Unmarshal(body, &out); err != nil {
		return nil, err
	}
	tickers := make([]string, 0, len(out.Markets))
	for _, m := range out.Markets {
		tickers = append(tickers, m.Ticker)
	}
	return tickers, nil
}
