package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	// Server
	Port string
	Env  string

	// MongoDB
	MongoURI string
	MongoDB  string

	// Redis
	RedisAddr     string
	RedisPassword string
	RedisDB       int

	// JWT
	JWTSecret          string
	JWTAccessExpiry    time.Duration
	JWTRefreshExpiry   time.Duration

	// SMTP
	SMTPHost string
	SMTPPort int
	SMTPUser string
	SMTPPass string
	SMTPFrom string

	// App
	FrontendURL string
	AppName     string

	// TURN
	TURNUsername string
	TURNPassword string
	TURNURLs     string
}

func Load() *Config {
	accessExpiry, _ := time.ParseDuration(getEnv("JWT_ACCESS_EXPIRY", "15m"))
	refreshExpiry, _ := time.ParseDuration(getEnv("JWT_REFRESH_EXPIRY", "168h"))
	smtpPort, _ := strconv.Atoi(getEnv("SMTP_PORT", "587"))
	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", "0"))

	return &Config{
		Port:             getEnv("PORT", "8080"),
		Env:              getEnv("ENV", "development"),
		MongoURI:         getEnv("MONGO_URI", "mongodb://localhost:27017"),
		MongoDB:          getEnv("MONGO_DB", "bumbleo"),
		RedisAddr:        getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:    getEnv("REDIS_PASSWORD", ""),
		RedisDB:          redisDB,
		JWTSecret:        getEnv("JWT_SECRET", "change-me-in-production-super-secret"),
		JWTAccessExpiry:  accessExpiry,
		JWTRefreshExpiry: refreshExpiry,
		SMTPHost:         getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:         smtpPort,
		SMTPUser:         getEnv("SMTP_USER", ""),
		SMTPPass:         getEnv("SMTP_PASS", ""),
		SMTPFrom:         getEnv("SMTP_FROM", "noreply@bumbleo.com"),
		FrontendURL:      getEnv("FRONTEND_URL", "http://localhost:3000"),
		AppName:          getEnv("APP_NAME", "Bumbleo"),
		TURNUsername:     getEnv("TURN_USERNAME", "bumbleo"),
		TURNPassword:     getEnv("TURN_PASSWORD", "bumbleopass"),
		TURNURLs:         getEnv("TURN_URLS", "turn:coturn:3478"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
