# Bumbleo — Backend

A Go-based REST + WebSocket backend for the Bumbleo real-time matching platform.  
Built with **Chi**, **MongoDB**, and **Redis**.

---

## 📦 Go Package Structure

> **How Go packages work in this project:**  
> Every **directory** is its own package. Every `.go` file inside that directory declares the **same package name** at the top. All files that share a folder are part of one cohesive package — they can freely access each other's types and functions without any import.

```
backend/
├── cmd/
│   └── server/          # package main  ← entry point, wires everything together
│       └── main.go
│
├── internal/            # private packages — not importable outside this module
│   ├── auth/            # package auth   ← JWT, email sending, token management
│   │   ├── email.go
│   │   ├── jwt.go
│   │   └── tokens.go
│   │
│   ├── config/          # package config ← loads env vars into a Config struct
│   │   └── config.go
│   │
│   ├── db/              # package db     ← MongoDB & Redis connection helpers
│   │   ├── mongo.go
│   │   └── redis.go
│   │
│   ├── handlers/        # package handlers ← HTTP handler functions (routes)
│   │   ├── auth.go      #   auth routes (register, login, logout, me…)
│   │   ├── health.go    #   /health & /api/stats
│   │   └── ws.go        #   WebSocket upgrade handler
│   │
│   ├── matchmaking/     # package matchmaking ← real-time user queue via Redis
│   │   └── queue.go
│   │
│   ├── middleware/      # package middleware ← HTTP middleware chain
│   │   ├── authmw.go    #   JWT auth guard (RequireAuth)
│   │   ├── logger.go    #   request logger
│   │   └── ratelimit.go #   Redis-backed rate limiter
│   │
│   ├── models/          # package models ← MongoDB document structs
│   │   ├── user.go
│   │   └── report.go
│   │
│   ├── session/         # package session ← active WebSocket session registry
│   │   └── manager.go
│   │
│   └── signaling/       # package signaling ← WebRTC signaling relay logic
│       └── relay.go
│
├── Dockerfile
├── go.mod               # module: github.com/sharafath/bumbleo
└── go.sum
```

### Why each file in the same folder shares a package name

| Folder | `package` declaration | What all files in it share |
|---|---|---|
| `cmd/server/` | `package main` | The `main()` entry point lives here |
| `internal/auth/` | `package auth` | `email.go`, `jwt.go`, `tokens.go` all expose auth helpers to the rest of the app |
| `internal/handlers/` | `package handlers` | `auth.go`, `health.go`, `ws.go` all define HTTP handlers registered in `main.go` |
| `internal/middleware/` | `package middleware` | `authmw.go`, `logger.go`, `ratelimit.go` all build on the same Chi middleware interface |
| `internal/db/` | `package db` | `mongo.go` and `redis.go` both export shared client variables (`db.RedisClient`, etc.) |
| `internal/models/` | `package models` | `user.go` and `report.go` define MongoDB document types used across packages |

---

## 🛣️ API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | ✗ | Health check |
| `GET` | `/api/stats` | ✗ | Server stats |
| `POST` | `/api/auth/register` | ✗ | Create account (rate-limited) |
| `GET` | `/api/auth/verify` | ✗ | Email verification |
| `POST` | `/api/auth/login` | ✗ | Login (rate-limited) |
| `POST` | `/api/auth/refresh` | ✗ | Refresh JWT |
| `POST` | `/api/auth/forgot-password` | ✗ | Send reset email (rate-limited) |
| `POST` | `/api/auth/reset-password` | ✗ | Reset password (rate-limited) |
| `POST` | `/api/auth/logout` | ✔ | Logout |
| `GET` | `/api/auth/me` | ✔ | Get current user |
| `GET` | `/ws` | ✔ (query token) | WebSocket upgrade |

---

## ⚙️ Environment Variables

Create a `.env` file in the **project root** (one level above `backend/`):

```env
# Server
PORT=8080
ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bumbleo

# Redis (Upstash or local)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@bumbleo.app
```

---

## 🚀 Running Locally

```bash
# From the backend/ directory
go run ./cmd/server
```

Or build and run the binary:

```bash
go build -o server.exe ./cmd/server
./server.exe
```

---

## 🐳 Docker

```bash
# Build image
docker build -t bumbleo-backend .

# Run container
docker run -p 8080:8080 --env-file ../.env bumbleo-backend
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| HTTP Router | [Chi v5](https://github.com/go-chi/chi) |
| WebSocket | [gorilla/websocket](https://github.com/gorilla/websocket) |
| Database | [MongoDB](https://www.mongodb.com/) via official driver |
| Cache / Queue | [Redis](https://redis.io/) via go-redis v9 |
| Auth | JWT ([golang-jwt/jwt v5](https://github.com/golang-jwt/jwt)) |
| Password Hashing | bcrypt (`golang.org/x/crypto`) |
| Config | [godotenv](https://github.com/joho/godotenv) |
| IDs | [google/uuid](https://github.com/google/uuid) |
