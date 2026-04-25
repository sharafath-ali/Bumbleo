package middleware

import (
	"fmt"
	"net/http"
	"time"

	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

const (
	reset  = "\033[0m"
	bold   = "\033[1m"
	red    = "\033[31m"
	green  = "\033[32m"
	yellow = "\033[33m"
	blue   = "\033[34m"
	cyan   = "\033[36m"
	gray   = "\033[90m"
)

func statusColor(status int) string {
	switch {
	case status >= 500:
		return red
	case status >= 400:
		return yellow
	case status >= 300:
		return cyan
	default:
		return green
	}
}

func methodColor(method string) string {
	switch method {
	case http.MethodGet:
		return blue
	case http.MethodPost:
		return green
	case http.MethodDelete:
		return red
	case http.MethodPut, http.MethodPatch:
		return yellow
	default:
		return cyan
	}
}

// RequestLogger logs each HTTP request in a clean one-line format:
//
//	GET  /api/auth/login  200  8ms
func RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		ww := chimiddleware.NewWrapResponseWriter(w, r.ProtoMajor)
		next.ServeHTTP(ww, r)

		status := ww.Status()
		latency := time.Since(start)

		fmt.Printf("%s%s%-7s%s  %-30s  %s%d%s  %s%v%s\n",
			bold, methodColor(r.Method), r.Method, reset,
			r.URL.Path,
			bold+statusColor(status), status, reset,
			gray, latency.Round(time.Millisecond), reset,
		)
	})
}
