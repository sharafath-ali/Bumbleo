package matchmaking

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/sharafath/bumbleo/internal/session"
)

const queueKey = "bumbleo:queue"
const roomPrefix = "bumbleo:room:"

var rdb *redis.Client

func Init(r *redis.Client) {
	rdb = r
}

// Enqueue adds a session to the waiting queue and attempts to match.
func Enqueue(ctx context.Context, sessionID string) {
	// Remove existing entry (safety) then push
	rdb.LRem(ctx, queueKey, 0, sessionID)
	rdb.RPush(ctx, queueKey, sessionID)

	tryMatch(ctx, sessionID)
}

// Dequeue removes a session from the queue.
func Dequeue(ctx context.Context, sessionID string) {
	rdb.LRem(ctx, queueKey, 0, sessionID)
}

func tryMatch(ctx context.Context, newSessionID string) {
	// Pop the oldest waiter
	result, err := rdb.LPop(ctx, queueKey).Result()
	if err == redis.Nil {
		return
	}
	if err != nil {
		log.Println("matchmaking queue error:", err)
		return
	}

	// If we popped ourselves, we're alone — put back
	if result == newSessionID {
		rdb.LPush(ctx, queueKey, newSessionID)
		return
	}

	peerA := result
	peerB := newSessionID

	// Verify both clients are still connected
	_, aOk := session.Global.Get(peerA)
	_, bOk := session.Global.Get(peerB)
	if !aOk || !bOk {
		// One disconnected — re-queue the surviving one
		if aOk {
			rdb.RPush(ctx, queueKey, peerA)
		}
		if bOk {
			rdb.RPush(ctx, queueKey, peerB)
		}
		return
	}

	roomID := uuid.New().String()

	// Store room mapping in Redis (TTL 2h)
	pipe := rdb.Pipeline()
	roomKey := fmt.Sprintf("%s%s", roomPrefix, roomID)
	pipe.HSet(ctx, roomKey, "peerA", peerA, "peerB", peerB, "startedAt", time.Now().Unix())
	pipe.Expire(ctx, roomKey, 2*time.Hour)
	pipe.Exec(ctx)

	// Update session room IDs
	if c, ok := session.Global.Get(peerA); ok {
		c.RoomID = roomID
	}
	if c, ok := session.Global.Get(peerB); ok {
		c.RoomID = roomID
	}

	// Notify peers
	notifyMatched(peerA, roomID, "caller")
	notifyMatched(peerB, roomID, "callee")
}

func notifyMatched(sessionID, roomID, role string) {
	msg, _ := json.Marshal(map[string]any{
		"type": "matched",
		"payload": map[string]string{
			"roomId": roomID,
			"role":   role,
		},
	})
	session.Global.Send(sessionID, msg)
}

func GetPeer(ctx context.Context, roomID, mySessionID string) (string, bool) {
	roomKey := fmt.Sprintf("%s%s", roomPrefix, roomID)
	vals, err := rdb.HGetAll(ctx, roomKey).Result()
	if err != nil || len(vals) == 0 {
		return "", false
	}

	if vals["peerA"] == mySessionID {
		return vals["peerB"], true
	}
	if vals["peerB"] == mySessionID {
		return vals["peerA"], true
	}
	return "", false
}

func CloseRoom(ctx context.Context, roomID string) {
	roomKey := fmt.Sprintf("%s%s", roomPrefix, roomID)
	rdb.Del(ctx, roomKey)
}
