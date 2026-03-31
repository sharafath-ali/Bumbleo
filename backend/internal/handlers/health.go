package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/sharafath/bumbleo/internal/session"
)

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"status":      "ok",
		"activeUsers": session.Global.Count(),
	})
}

func StatsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"activeUsers": session.Global.Count(),
	})
}
