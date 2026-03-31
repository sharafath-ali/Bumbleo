package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/sharafath/bumbleo/internal/auth"
)

func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			http.Error(w, `{"error":"missing or invalid authorization header"}`, http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(header, "Bearer ")
		claims, err := auth.ValidateToken(tokenStr)
		if err != nil || claims.TokenType != "access" {
			http.Error(w, `{"error":"invalid or expired token"}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "userID", claims.UserID)
		ctx = context.WithValue(ctx, "email", claims.Email)
		ctx = context.WithValue(ctx, "username", claims.Username)
		ctx = context.WithValue(ctx, "isVerified", claims.IsVerified)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func RequireVerified(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		isVerified, ok := r.Context().Value("isVerified").(bool)
		if !ok || !isVerified {
			http.Error(w, `{"error":"email not verified"}`, http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}
