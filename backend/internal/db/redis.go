package db

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
	"github.com/sharafath/bumbleo/internal/config"
)

var RedisClient *redis.Client

func ConnectRedis(cfg *config.Config) {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	ctx := context.Background()
	if _, err := RedisClient.Ping(ctx).Result(); err != nil {
		log.Fatalf("Redis connect error: %v", err)
	}
	log.Println("✅  Redis connected:", cfg.RedisAddr)
}

func GetRedis() *redis.Client {
	return RedisClient
}
