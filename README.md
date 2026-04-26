# Bumbleo 🎲

> **Anonymous P2P random video chat** — meet strangers instantly, powered by WebRTC.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Go](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go)](https://go.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)](https://www.mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7-red?logo=redis)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://docs.docker.com/compose)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) · TypeScript · Tailwind CSS · Redux Toolkit |
| Backend | Go · Chi router · Gorilla WebSocket |
| Database | MongoDB 7 (users, reports, analytics) |
| Cache/Queue | Redis 7 (matchmaking, rate limiting, tokens) |
| Real-time | WebRTC (P2P video/audio) |
| TURN/STUN | Coturn |
| DevOps | Docker · Docker Compose |

---

## Features

- 🎲 **Random matching** — Redis queue-based O(1) matchmaking
- 📹 **P2P video chat** — WebRTC with STUN/TURN fallback
- 💬 **Text chat** — real-time alongside video
- ⏭ **Next** — skip to a new stranger instantly
- 🔒 **JWT Auth** — register, login, email confirmation, refresh tokens
- 📧 **Email verification** — SMTP with branded HTML templates
- 🛡️ **Rate limiting** — Redis sliding window per IP
- 🚩 **Moderation** — report users (saved to MongoDB)
- 📊 **Analytics hooks** — session tracking, skip count
- 📱 **Responsive** — works on mobile, tablet, desktop

---

## Quick Start (Docker)

### 1. Clone & configure

```bash
git clone https://github.com/sharafath-ali/Bumbleo.git
cd Bumbleo
cp .env.example .env
# Edit .env with your SMTP credentials and JWT secret
```

### 2. Run all services

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Health check | http://localhost:8080/health |

---

## Local Development (without Docker)

This guide runs everything on your machine — **no Docker needed**.

---

### Step 1 — Install Prerequisites

| Tool | Version | Download |
|---|---|---|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org) |
| **Go** | 1.22+ | [go.dev/dl](https://go.dev/dl/) |
| **MongoDB** | 7 Community | [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) |
| **Redis** | 5+ (Windows port) | [github.com/tporadowski/redis/releases](https://github.com/tporadowski/redis/releases) |

---

### Step 2 — Install & Start MongoDB

1. Download **MongoDB 7 Community Server** → Windows → `.msi`
2. Run installer → choose **Complete**
3. ✅ Check **"Install MongoDB as a Service"** during setup
4. Finish install — it starts automatically

**Verify MongoDB is running:**
```powershell
mongod --version
# Connect test:
mongosh --eval "db.runCommand({ ping: 1 })"
# Expected: { ok: 1 }
```

If not running, start it manually:
```powershell
net start MongoDB
```

---

### Step 3 — Install & Start Redis

1. Download the latest `.msi` from [github.com/tporadowski/redis/releases](https://github.com/tporadowski/redis/releases)
   - e.g. `Redis-x64-5.0.14.1.msi`
2. Run installer → ✅ Check **"Add Redis to PATH"**
3. Redis installs as a Windows service and starts automatically

**Verify Redis is running:**
```powershell
redis-cli ping
# Expected: PONG
```

If not running, start it manually:
```powershell
net start Redis
```

---

### Step 4 — Configure Environment

```bash
# From the root Bumbleo/ folder
cp .env.example .env
```

Open `.env` and fill in:

```env
# Required — generate a strong random secret
JWT_SECRET=your-random-secret-min-32-chars

# Required — your Resend (or Gmail) credentials
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_your_api_key
SMTP_FROM=onboarding@resend.dev

# Leave everything else as-is for local development
```

> **Generate JWT_SECRET (PowerShell):**
> ```powershell
> -join ((65..90)+(97..122)+(48..57) | Get-Random -Count 48 | ForEach-Object {[char]$_})
> ```

---

### Step 5 — Run the Backend

```powershell
cd backend
go mod tidy
go run ./cmd/server
```

**Expected output:**
```
✅  MongoDB connected: bumbleo
✅  Redis connected: localhost:6379
🚀  Bumbleo server running on :8080 (env: development)
```

---

### Step 6 — Run the Frontend

Open a **new terminal**:

```powershell
cd frontend
npm install
npm run dev
```

**Expected output:**
```
▲ Next.js 15.x
- Local: http://localhost:3000
```

---

### Step 7 — Open the App

| Service | URL |
|---|---|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8080 |
| **Health check** | http://localhost:8080/health |

---

### Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `MongoDB ping error: connection refused :27017` | MongoDB service not running | `net start MongoDB` |
| `Redis connect error: connection refused :6379` | Redis service not running | `net start Redis` |
| `go: command not found` | Go not in PATH | Restart terminal after Go install |
| `npm: not recognized` | Node.js not installed | Install from nodejs.org |
| Frontend shows CORS error | Backend not running | Start Go server first |

---

### All 3 running at once (summary)

```powershell
# Terminal 1 — check services
net start MongoDB
net start Redis

# Terminal 2 — backend
cd C:\path\to\Bumbleo\backend
go run ./cmd/server

# Terminal 3 — frontend
cd C:\path\to\Bumbleo\frontend
npm run dev
```

---

## Environment Variables

See [`.env.example`](.env.example) for full documentation.

**Critical to change in production:**
- `JWT_SECRET` — use a long random string (32+ chars)
- `SMTP_*` — your email provider credentials
- `TURN_PASSWORD` — secure your TURN server

---

## Project Structure

```
Bumbleo/
├── frontend/               # Next.js App Router
│   └── src/
│       ├── app/            # Pages (landing, chat, auth/*)
│       ├── components/     # UI components (landing, chat, ui)
│       ├── hooks/          # useAuth, useWebRTC, useWebSocket
│       ├── store/          # Redux Toolkit slices
│       ├── lib/            # fetch API client, auth utils, WebRTC config
│       └── types/          # Shared TypeScript interfaces
│
├── backend/                # Go signaling server
│   ├── cmd/server/         # Entry point
│   └── internal/
│       ├── auth/           # JWT, email, token management
│       ├── handlers/       # HTTP & WebSocket handlers
│       ├── matchmaking/    # Redis queue matching
│       ├── middleware/     # Auth, rate limiting
│       ├── models/         # MongoDB models
│       ├── signaling/      # WebRTC relay
│       └── session/        # Connected client registry
│
├── coturn/                 # TURN server config
├── docker-compose.yml
└── .env.example
```

---

## 🔴 Redis Architecture

Redis is used for three specific purposes — **all ephemeral data** that doesn't belong in MongoDB.

| Use Case | File | Redis Structure | TTL |
|---|---|---|---|
| 🔐 Refresh tokens | `internal/auth/tokens.go` | String `SET/GET/DEL` | 7 days |
| 🔐 Email verification tokens | `internal/auth/tokens.go` | String `SET/GET/DEL` | 24 h |
| 🔐 Password reset tokens | `internal/auth/tokens.go` | String `SET/GET/DEL` | 1 h |
| 🎲 Matchmaking queue | `internal/matchmaking/queue.go` | List `RPUSH/LPOP` | none |
| 🎲 Active room mapping | `internal/matchmaking/queue.go` | Hash `HSET/HGETALL` | 2 h |
| 🛡️ Rate limiting | `internal/middleware/ratelimit.go` | Counter `INCR/EXPIRE` | 15 min |

### Full key space

```
bumbleo:
├── verify:<hex>       → userID        (24h)    email verification link
├── reset:<hex>        → userID        (1h)     password reset link
├── refresh:<userID>   → jwt-string    (7d)     active refresh token
├── queue              → [sessionID…]  (none)   matchmaking waiting list
├── room:<roomID>      → {peerA,peerB} (2h)     matched room members
└── rl:auth:<ip>       → count         (15min)  rate limit counter
```

> See [`backend/README.md`](./backend/README.md#-redis-architecture) for full implementation details, Redis commands, and code snippets.

---

## 🔌 WebSocket Protocol

```
Client → Server:
  join_queue          Start searching
  next                Skip current stranger
  offer   {sdp}       WebRTC offer
  answer  {sdp}       WebRTC answer
  ice_candidate {…}   ICE candidate
  chat_message {text} Text message
  report  {reason}    Report user

Server → Client:
  connected  {sessionId, userId, username}
  matched    {roomId, role: caller|callee}
  offer / answer / ice_candidate (relayed)
  chat_message {text, from}
  peer_left
  error {message}
```

---

## License

MIT — feel free to fork and build on it.
