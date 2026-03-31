package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/sharafath/bumbleo/internal/auth"
	"github.com/sharafath/bumbleo/internal/matchmaking"
	"github.com/sharafath/bumbleo/internal/session"
	"github.com/sharafath/bumbleo/internal/signaling"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // lock down in production by checking Origin header
	},
}

type wsMessage = signaling.Message

func WSHandler(w http.ResponseWriter, r *http.Request) {
	// Authenticate via query param token (WebSocket can't send headers)
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "missing token", http.StatusUnauthorized)
		return
	}

	claims, err := auth.ValidateToken(token)
	if err != nil || claims.TokenType != "access" {
		http.Error(w, "invalid token", http.StatusUnauthorized)
		return
	}

	if !claims.IsVerified {
		http.Error(w, "email not verified", http.StatusForbidden)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("websocket upgrade error:", err)
		return
	}

	client := &session.Client{
		ID:       uuid.New().String(),
		UserID:   claims.UserID,
		Username: claims.Username,
		Conn:     conn,
		Send:     make(chan []byte, 256),
	}

	session.Global.Add(client)

	// Write pump
	go func() {
		defer func() {
			conn.Close()
			signaling.HandleDisconnect(client.ID, client.RoomID)
		}()
		for msg := range client.Send {
			conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}
		}
	}()

	// Read pump — blocks until connection closes
	conn.SetReadLimit(8192)
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	// Ping ticker
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}()

	// Send welcome
	welcome, _ := json.Marshal(map[string]any{
		"type": "connected",
		"payload": map[string]string{
			"sessionId": client.ID,
			"userId":    client.UserID,
			"username":  client.Username,
		},
	})
	client.Send <- welcome

	for {
		_, raw, err := conn.ReadMessage()
		if err != nil {
			break
		}
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))

		var msg wsMessage
		if err := json.Unmarshal(raw, &msg); err != nil {
			continue
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

		switch msg.Type {
		case "join_queue":
			matchmaking.Enqueue(ctx, client.ID)

		case "next":
			signaling.HandleNext(client.ID, client.RoomID)

		case "offer", "answer", "ice_candidate":
			if client.RoomID != "" {
				signaling.Relay(client.ID, client.RoomID, msg)
			}

		case "chat_message":
			if client.RoomID != "" {
				// Add sender username to payload before relaying
				var payload map[string]any
				json.Unmarshal(msg.Payload, &payload)
				payload["from"] = client.Username
				enhanced, _ := json.Marshal(map[string]any{
					"type":    "chat_message",
					"payload": payload,
				})
				peerID, ok := matchmaking.GetPeer(ctx, client.RoomID, client.ID)
				if ok {
					session.Global.Send(peerID, enhanced)
				}
			}

		case "report":
			var payload map[string]string
			json.Unmarshal(msg.Payload, &payload)
			reason := payload["reason"]
			if reason == "" {
				reason = "unspecified"
			}
			go signaling.HandleReport(client.ID, client.RoomID, reason)
		}

		cancel()
	}

	close(client.Send)
}
