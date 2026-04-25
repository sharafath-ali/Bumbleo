package db

import (
	"context"
	"log"
	"strings"

	"github.com/redis/go-redis/v9"
	"github.com/sharafath/bumbleo/internal/config"
)

var RedisClient *redis.Client

func ConnectRedis(cfg *config.Config) {
	if strings.HasPrefix(cfg.RedisAddr, "redis://") || strings.HasPrefix(cfg.RedisAddr, "rediss://") {
		opt, err := redis.ParseURL(cfg.RedisAddr)
		if err != nil {
			log.Fatalf("Invalid Redis URL: %v", err)
		}
		RedisClient = redis.NewClient(opt)
	} else {
		RedisClient = redis.NewClient(&redis.Options{
			Addr:     cfg.RedisAddr,
			Password: cfg.RedisPassword,
			DB:       cfg.RedisDB,
		})
	}

	ctx := context.Background()
	if _, err := RedisClient.Ping(ctx).Result(); err != nil {
		log.Fatalf("Redis connect error: %v", err)
	}
	log.Println("✅  Redis connected")
}

func GetRedis() *redis.Client {
	return RedisClient
}
