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

type GetBalanceResponse struct {
	Balance int64 `json:"balance"` // Cents
}

type Settlement struct {
	Ticker      string `json:"ticker"`
	Result      string `json:"market_result"` // 'yes' or 'no'
	Revenue     string `json:"revenue"`       // Cents received as string
	CostDollars string `json:"yes_total_cost_dollars"` 
}

type GetSettlementsResponse struct {
	Settlements []Settlement `json:"settlements"`
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
	var tickers []string
	cursor := ""

	for {
		url := "/markets?status=open&limit=1000"
		if cursor != "" {
			url += "&cursor=" + cursor
		}

		resp, err := c.do(ctx, http.MethodGet, url, nil)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(resp.Body)
		if resp.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("get markets: status %d: %s", resp.StatusCode, string(body))
		}

		var out struct {
			Markets []Market `json:"markets"`
			Cursor  string   `json:"cursor"`
		}
		if err := json.Unmarshal(body, &out); err != nil {
			return nil, err
		}

		for _, m := range out.Markets {
			tickers = append(tickers, m.Ticker)
		}

		if out.Cursor == "" || len(out.Markets) == 0 {
			break
		}
		cursor = out.Cursor
	}

	return tickers, nil
}

func (c *Client) GetBalance(ctx context.Context) (int64, error) {
	resp, err := c.do(ctx, http.MethodGet, "/portfolio/balance", nil)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("get balance: status %d: %s", resp.StatusCode, string(body))
	}
	var out GetBalanceResponse
	if err := json.Unmarshal(body, &out); err != nil {
		return 0, err
	}
	return out.Balance, nil
}

func (c *Client) GetSettlements(ctx context.Context, minTS int64) ([]Settlement, error) {
	path := fmt.Sprintf("/portfolio/settlements?min_ts=%d", minTS)
	resp, err := c.do(ctx, http.MethodGet, path, nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("get settlements: status %d: %s", resp.StatusCode, string(body))
	}
	var out GetSettlementsResponse
	if err := json.Unmarshal(body, &out); err != nil {
		return nil, err
	}
	return out.Settlements, nil
}
