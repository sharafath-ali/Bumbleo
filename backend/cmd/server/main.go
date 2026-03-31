package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"github.com/sharafath/bumbleo/internal/auth"
	"github.com/sharafath/bumbleo/internal/config"
	"github.com/sharafath/bumbleo/internal/db"
	"github.com/sharafath/bumbleo/internal/handlers"
	"github.com/sharafath/bumbleo/internal/matchmaking"
	"github.com/sharafath/bumbleo/internal/middleware"
)

func main() {
	// Load .env file in local development (silently ignored if not found)
	if err := godotenv.Load("../../.env"); err != nil {
		_ = godotenv.Load(".env") // fallback when running from backend/ dir
	}

	cfg := config.Load()

	// Init dependencies
	db.ConnectMongo(cfg)
	defer db.DisconnectMongo()

	db.ConnectRedis(cfg)

	auth.Init(cfg)
	auth.InitRedis(db.RedisClient)
	auth.InitEmail(cfg)

	matchmaking.Init(db.RedisClient)
	middleware.InitRateLimit(db.RedisClient)

	// Router
	r := chi.NewRouter()

	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Timeout(30 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.FrontendURL, "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health
	r.Get("/health", handlers.HealthHandler)
	r.Get("/api/stats", handlers.StatsHandler)

	// Auth routes (rate-limited)
	authLimiter := middleware.RateLimit("auth", 10, 15*time.Minute)
	r.Route("/api/auth", func(r chi.Router) {
		r.With(authLimiter).Post("/register", handlers.Register)
		r.Get("/verify", handlers.VerifyEmail)
		r.With(authLimiter).Post("/login", handlers.Login)
		r.Post("/refresh", handlers.RefreshToken)
		r.With(authLimiter).Post("/forgot-password", handlers.ForgotPassword)
		r.With(authLimiter).Post("/reset-password", handlers.ResetPassword)

		// Protected
		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAuth)
			r.Post("/logout", handlers.Logout)
			r.Get("/me", handlers.GetMe)
		})
	})

	// WebSocket (auth via query token)
	r.Get("/ws", handlers.WSHandler)

	// Server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("🚀 Bumbleo server running on :%s (env: %s)", cfg.Port, cfg.Env)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down...")
	srv.Shutdown(context.TODO())
}
