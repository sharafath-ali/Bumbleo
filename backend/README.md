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

## 🔒 Dependency Management (`go.mod` & `go.sum`)

Go uses two files to manage dependencies — `go.mod` defines **what** you need, and `go.sum` guarantees **exactly what you got**.

### `go.mod` — The Dependency Declaration

`go.mod` lists every direct dependency your project needs, pinned to an exact version:

```go
module github.com/sharafath/bumbleo

go 1.22

require (
    github.com/go-chi/chi/v5        v5.0.12
    github.com/gorilla/websocket    v1.5.3
    github.com/golang-jwt/jwt/v5    v5.2.1
    github.com/redis/go-redis/v9    v9.5.1
    go.mongodb.org/mongo-driver     v1.15.0
    golang.org/x/crypto             v0.22.0
    // ...
)
```

You **edit** `go.mod` when you add (`go get`) or remove (`go mod tidy`) a dependency.

---

### `go.sum` — The Cryptographic Lock File

`go.sum` is the **tamper-proof record** of every dependency version ever downloaded for this project.  
You **never edit it manually** — Go maintains it automatically.

#### Anatomy of a `go.sum` entry

Each dependency appears as **two lines**:

```
github.com/go-chi/chi/v5 v5.0.12 h1:9euLV5sTrTNTRUU9POmDUvfxyj6LAABLUcEWO+JJb4s=
github.com/go-chi/chi/v5 v5.0.12/go.mod h1:DslCQbL2OYiznFReuXYUmQ2hGd1aDpCnlMNITLSKoi8=
```

| Part | Meaning |
|---|---|
| `github.com/go-chi/chi/v5` | Import path of the dependency |
| `v5.0.12` | Exact version locked — no ambiguity |
| `h1:9euLV5...` | SHA-256 hash of the **source zip** — verifies the code itself |
| `v5.0.12/go.mod h1:DslCQ...` | SHA-256 hash of the **`go.mod` file** — verifies the module metadata |

> **`h1:` prefix** — Go's hash algorithm identifier. `h1` means it hashes the directory tree of the module zip using SHA-256. Future-proof: if Go ever changes the algorithm, the prefix changes too (e.g. `h2:`).

#### Real examples from this project

```
# Chi router — HTTP layer
github.com/go-chi/chi/v5 v5.0.12 h1:9euLV5sTrTNTRUU9POmDUvfxyj6LAABLUcEWO+JJb4s=
github.com/go-chi/chi/v5 v5.0.12/go.mod h1:DslCQbL2OYiznFReuXYUmQ2hGd1aDpCnlMNITLSKoi8=

# WebSocket
github.com/gorilla/websocket v1.5.3 h1:saDtZ6Pbx/0u+bgYQ3q96pZgCzfhKXGPqt7kZ72aNNg=
github.com/gorilla/websocket v1.5.3/go.mod h1:YR8l580nyteQvAITg2hZ9XVh4b55+EU/adAjf1fMHhE=

# JWT
github.com/golang-jwt/jwt/v5 v5.2.1 h1:OuVbFODueb089Lh128TAcimifWaLhJwVflnrgM17wHk=
github.com/golang-jwt/jwt/v5 v5.2.1/go.mod h1:pqrtFR0X4osieyHYxtmOUWsAWrfe1Q5UVIyoH402zdk=

# Redis client
github.com/redis/go-redis/v9 v9.5.1 h1:H1X4D3yHPaYrkL5X06Wh6xNVM/pX0Ft4RV0vMGvLBh8=
github.com/redis/go-redis/v9 v9.5.1/go.mod h1:hdY0cQFCN4fnSYT6TkisLufl/4W5UIXyv0b/CLO2V2M=

# MongoDB driver
go.mongodb.org/mongo-driver v1.15.0 h1:rJCKC8eEliewXjZGf0ddURtl7tTVy1TK3bfl0gkUSLc=
go.mongodb.org/mongo-driver v1.15.0/go.mod h1:Vzb0Mk/pa7e6cWw85R4F/endUC3u0U9jGcNU603k65c=
```

#### Why this matters

| Without `go.sum` | With `go.sum` |
|---|---|
| Same version tag could point to different code if a maintainer force-pushes a tag | Impossible — hash mismatch causes `go build` to fail |
| "Works on my machine" dependency drift | Every developer and every CI build fetches **byte-for-byte identical** code |
| Supply-chain attack possible (tampered package) | Go refuses to use any code whose hash doesn't match |

#### Common commands

```bash
# Add a new dependency (updates both go.mod and go.sum)
go get github.com/some/package@v1.2.3

# Remove unused dependencies and re-sync go.sum
go mod tidy

# Download all deps into the local module cache
go mod download

# Verify all cached modules match their go.sum hashes
go mod verify
```

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
