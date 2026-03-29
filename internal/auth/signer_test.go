package auth

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"os"
	"path/filepath"
	"testing"
)

func TestSigner_SignREST(t *testing.T) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	der := x509.MarshalPKCS1PrivateKey(key)
	block := &pem.Block{Type: "RSA PRIVATE KEY", Bytes: der}
	dir := t.TempDir()
	p := filepath.Join(dir, "key.pem")
	if err := os.WriteFile(p, pem.EncodeToMemory(block), 0600); err != nil {
		t.Fatal(err)
	}
	s, err := NewSigner(p, "test-key-id")
	if err != nil {
		t.Fatal(err)
	}
	sig, err := s.SignREST("1712345678901", "GET", "/trade-api/v2/portfolio/balance")
	if err != nil || sig == "" {
		t.Fatalf("sig=%q err=%v", sig, err)
	}
}

func TestSigner_SignWebSocket(t *testing.T) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	der := x509.MarshalPKCS1PrivateKey(key)
	block := &pem.Block{Type: "RSA PRIVATE KEY", Bytes: der}
	dir := t.TempDir()
	p := filepath.Join(dir, "key.pem")
	if err := os.WriteFile(p, pem.EncodeToMemory(block), 0600); err != nil {
		t.Fatal(err)
	}
	s, err := NewSigner(p, "id")
	if err != nil {
		t.Fatal(err)
	}
	sig, err := s.SignWebSocket("1712345678901")
	if err != nil || sig == "" {
		t.Fatalf("sig=%q err=%v", sig, err)
	}
}
