package signaling

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/sharafath/bumbleo/internal/db"
	"github.com/sharafath/bumbleo/internal/matchmaking"
	"github.com/sharafath/bumbleo/internal/models"
	"github.com/sharafath/bumbleo/internal/session"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Message struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

func Relay(sessionID, roomID string, msg Message) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	peerID, ok := matchmaking.GetPeer(ctx, roomID, sessionID)
	if !ok {
		log.Printf("relay: no peer found for session %s in room %s", sessionID, roomID)
		return
	}

	out, _ := json.Marshal(msg)
	session.Global.Send(peerID, out)
}

func HandleNext(sessionID, roomID string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Notify peer they've been skipped
	if roomID != "" {
		peerID, ok := matchmaking.GetPeer(ctx, roomID, sessionID)
		if ok {
			notifyPeerLeft(peerID)
			// Re-queue the peer
			matchmaking.Enqueue(ctx, peerID)
		}
		matchmaking.CloseRoom(ctx, roomID)
	}

	// Update session room
	if c, ok := session.Global.Get(sessionID); ok {
		c.RoomID = ""
	}

	// Re-queue self
	matchmaking.Enqueue(ctx, sessionID)
}

func HandleDisconnect(sessionID, roomID string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	matchmaking.Dequeue(ctx, sessionID)

	if roomID != "" {
		peerID, ok := matchmaking.GetPeer(ctx, roomID, sessionID)
		if ok {
			notifyPeerLeft(peerID)
			// Re-queue peer so they find a new match
			matchmaking.Enqueue(ctx, peerID)
			if c, ok := session.Global.Get(peerID); ok {
				c.RoomID = ""
			}
		}
		matchmaking.CloseRoom(ctx, roomID)
	}

	session.Global.Remove(sessionID)
}

func HandleReport(reporterSessionID, roomID, reason string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	reporter, ok := session.Global.Get(reporterSessionID)
	if !ok {
		return
	}

	peer, peerOk := matchmaking.GetPeer(ctx, roomID, reporterSessionID)

	reportedUserID := ""
	if peerOk {
		if c, ok := session.Global.Get(peer); ok {
			reportedUserID = c.UserID
		}
	}

	report := models.Report{
		ID:         primitive.NewObjectID(),
		ReporterID: reporter.UserID,
		ReportedID: reportedUserID,
		RoomID:     roomID,
		Reason:     reason,
		CreatedAt:  time.Now(),
	}

	col := db.GetCollection("reports")
	col.InsertOne(ctx, report)
}

func notifyPeerLeft(peerID string) {
	msg, _ := json.Marshal(Message{Type: "peer_left"})
	session.Global.Send(peerID, msg)
}
