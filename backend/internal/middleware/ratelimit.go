package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
)

var rdb *redis.Client

func InitRateLimit(r *redis.Client) {
	rdb = r
}

// RateLimit applies a sliding window rate limit.
// key: discriminator (e.g. "auth", "ws"), limit: max requests, window: time window.
func RateLimit(key string, limit int, window time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := realIP(r)
			redisKey := fmt.Sprintf("bumbleo:rl:%s:%s", key, ip)

			ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
			defer cancel()

			pipe := rdb.Pipeline()
			incr := pipe.Incr(ctx, redisKey)
			pipe.Expire(ctx, redisKey, window)
			pipe.Exec(ctx)

			count := incr.Val()
			if count > int64(limit) {
				w.Header().Set("Retry-After", fmt.Sprintf("%d", int(window.Seconds())))
				http.Error(w, `{"error":"too many requests, slow down"}`, http.StatusTooManyRequests)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func realIP(r *http.Request) string {
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
		return ip
	}
	return r.RemoteAddr
}
