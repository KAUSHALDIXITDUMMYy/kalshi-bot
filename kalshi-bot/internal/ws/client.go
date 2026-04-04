package ws

import (
	"context"
	"log/slog"
	"net/http"
	"strconv"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"

	"rfqbot/internal/auth"
)

// Handler receives raw JSON frames from the communications channel.
type Handler func(ctx context.Context, payload []byte)

// RunDialLoop connects with Kalshi auth headers, subscribes to communications, and processes messages until ctx done.
func RunDialLoop(ctx context.Context, log *slog.Logger, wsURL string, signer *auth.Signer, onMessage Handler, shardFactor, shardKey int) {
	backoff := time.Second
	for {
		if ctx.Err() != nil {
			return
		}
		err := oneConnection(ctx, log, wsURL, signer, onMessage, shardFactor, shardKey)
		if ctx.Err() != nil {
			return
		}
		log.Warn("websocket disconnected", "err", err, "reconnect_in", backoff)
		select {
		case <-ctx.Done():
			return
		case <-time.After(backoff):
		}
		if backoff < 30*time.Second {
			backoff *= 2
			if backoff > 30*time.Second {
				backoff = 30 * time.Second
			}
		}
	}
}

var cmdID atomic.Uint32

func oneConnection(ctx context.Context, log *slog.Logger, wsURL string, signer *auth.Signer, onMessage Handler, shardFactor, shardKey int) error {
	ts := strconv.FormatInt(time.Now().UnixMilli(), 10)
	sig, err := signer.SignWebSocket(ts)
	if err != nil {
		return err
	}
	header := http.Header{}
	header.Set("KALSHI-ACCESS-KEY", signer.KeyID())
	header.Set("KALSHI-ACCESS-SIGNATURE", sig)
	header.Set("KALSHI-ACCESS-TIMESTAMP", ts)

	dialer := websocket.Dialer{HandshakeTimeout: 15 * time.Second}
	conn, _, err := dialer.DialContext(ctx, wsURL, header)
	if err != nil {
		return err
	}
	defer conn.Close()

	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	subID := cmdID.Add(1)
	sub := map[string]any{
		"id":  subID,
		"cmd": "subscribe",
		"params": map[string]any{
			"channels": []string{"communications"},
		},
	}
	if shardFactor > 0 {
		p := sub["params"].(map[string]any)
		p["shard_factor"] = shardFactor
		p["shard_key"] = shardKey
	}
	if err := conn.WriteJSON(sub); err != nil {
		return err
	}
	log.Info("subscribed to communications", "cmd_id", subID)

	readErr := make(chan error, 1)
	go func() {
		for {
			_, data, err := conn.ReadMessage()
			if err != nil {
				readErr <- err
				return
			}
			onMessage(ctx, data)
		}
	}()

	tick := time.NewTicker(20 * time.Second)
	defer tick.Stop()

	for {
		select {
		case <-ctx.Done():
			conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			return ctx.Err()
		case err := <-readErr:
			return err
		case <-tick.C:
			deadline := time.Now().Add(5 * time.Second)
			if err := conn.WriteControl(websocket.PingMessage, []byte("ping"), deadline); err != nil {
				return err
			}
		}
	}
}
