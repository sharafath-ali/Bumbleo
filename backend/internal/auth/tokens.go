package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	verifyPrefix  = "bumbleo:verify:"
	resetPrefix   = "bumbleo:reset:"
	refreshPrefix = "bumbleo:refresh:"
	verifyTTL     = 24 * time.Hour
	resetTTL      = 1 * time.Hour
	refreshTTL    = 7 * 24 * time.Hour
)

var rdb *redis.Client

func InitRedis(r *redis.Client) {
	rdb = r
}

func GenerateVerificationToken(ctx context.Context, userID string) (string, error) {
	token, err := randomHex(32)
	if err != nil {
		return "", err
	}
	key := fmt.Sprintf("%s%s", verifyPrefix, token)
	if err := rdb.Set(ctx, key, userID, verifyTTL).Err(); err != nil {
		return "", err
	}
	return token, nil
}

func RedeemVerificationToken(ctx context.Context, token string) (string, error) {
	key := fmt.Sprintf("%s%s", verifyPrefix, token)
	userID, err := rdb.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", fmt.Errorf("invalid or expired verification token")
	}
	if err != nil {
		return "", err
	}
	rdb.Del(ctx, key)
	return userID, nil
}

func GenerateResetToken(ctx context.Context, userID string) (string, error) {
	token, err := randomHex(32)
	if err != nil {
		return "", err
	}
	key := fmt.Sprintf("%s%s", resetPrefix, token)
	if err := rdb.Set(ctx, key, userID, resetTTL).Err(); err != nil {
		return "", err
	}
	return token, nil
}

func RedeemResetToken(ctx context.Context, token string) (string, error) {
	key := fmt.Sprintf("%s%s", resetPrefix, token)
	userID, err := rdb.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", fmt.Errorf("invalid or expired reset token")
	}
	if err != nil {
		return "", err
	}
	rdb.Del(ctx, key)
	return userID, nil
}

func StoreRefreshToken(ctx context.Context, userID, token string) error {
	key := fmt.Sprintf("%s%s", refreshPrefix, userID)
	return rdb.Set(ctx, key, token, refreshTTL).Err()
}

func GetRefreshToken(ctx context.Context, userID string) (string, error) {
	key := fmt.Sprintf("%s%s", refreshPrefix, userID)
	return rdb.Get(ctx, key).Result()
}

func DeleteRefreshToken(ctx context.Context, userID string) error {
	key := fmt.Sprintf("%s%s", refreshPrefix, userID)
	return rdb.Del(ctx, key).Err()
}

func randomHex(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
