package session

import (
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID       string
	UserID   string
	Username string
	Conn     *websocket.Conn
	RoomID   string
	Send     chan []byte
}

type Manager struct {
	mu      sync.RWMutex
	clients map[string]*Client // sessionID → client
}

var Global = &Manager{
	clients: make(map[string]*Client),
}

func (m *Manager) Add(c *Client) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.clients[c.ID] = c
}

func (m *Manager) Remove(id string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.clients, id)
}

func (m *Manager) Get(id string) (*Client, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	c, ok := m.clients[id]
	return c, ok
}

func (m *Manager) Count() int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return len(m.clients)
}

func (m *Manager) Send(id string, msg []byte) bool {
	m.mu.RLock()
	c, ok := m.clients[id]
	m.mu.RUnlock()
	if !ok {
		return false
	}
	select {
	case c.Send <- msg:
		return true
	default:
		return false
	}
}
