package auth

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"os"
)

// Signer loads an RSA private key and produces Kalshi RSA-PSS signatures.
type Signer struct {
	key   *rsa.PrivateKey
	keyID string
}

// NewSigner reads a PEM private key from path. keyID is KALSHI-ACCESS-KEY (UUID).
func NewSigner(privateKeyPath, keyID string) (*Signer, error) {
	pemBytes, err := os.ReadFile(privateKeyPath)
	if err != nil {
		return nil, fmt.Errorf("read private key: %w", err)
	}
	block, _ := pem.Decode(pemBytes)
	if block == nil {
		return nil, fmt.Errorf("invalid PEM in %s", privateKeyPath)
	}
	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		pk, err2 := x509.ParsePKCS8PrivateKey(block.Bytes)
		if err2 != nil {
			return nil, fmt.Errorf("parse private key: %w (pkcs8: %v)", err, err2)
		}
		rk, ok := pk.(*rsa.PrivateKey)
		if !ok {
			return nil, fmt.Errorf("private key is not RSA")
		}
		key = rk
	}
	return &Signer{key: key, keyID: keyID}, nil
}

// SignREST builds msg = ts + method + path (path must include /trade-api/v2...) and returns base64 signature.
func (s *Signer) SignREST(timestampMs, method, path string) (string, error) {
	msg := timestampMs + method + path
	return s.signString(msg)
}

// WebSocketPath is the path segment used in the WS handshake signature (no host).
const WebSocketPath = "/trade-api/ws/v2"

// SignWebSocket signs the WebSocket GET handshake.
func (s *Signer) SignWebSocket(timestampMs string) (string, error) {
	msg := timestampMs + "GET" + WebSocketPath
	return s.signString(msg)
}

func (s *Signer) signString(msg string) (string, error) {
	h := sha256.Sum256([]byte(msg))
	sig, err := rsa.SignPSS(rand.Reader, s.key, crypto.SHA256, h[:], &rsa.PSSOptions{
		SaltLength: rsa.PSSSaltLengthEqualsHash,
		Hash:       crypto.SHA256,
	})
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(sig), nil
}

func (s *Signer) KeyID() string { return s.keyID }
