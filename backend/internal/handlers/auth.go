package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/sharafath/bumbleo/internal/auth"
	"github.com/sharafath/bumbleo/internal/db"
	"github.com/sharafath/bumbleo/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

// ─── Request/Response types ─────────────────────────────────────────────────

type registerRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type refreshRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type forgotRequest struct {
	Email string `json:"email"`
}

type resetRequest struct {
	Token    string `json:"token"`
	Password string `json:"password"`
}

type tokenResponse struct {
	AccessToken  string             `json:"accessToken"`
	RefreshToken string             `json:"refreshToken"`
	User         models.PublicUser  `json:"user"`
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// ─── Register ─────────────────────────────────────────────────────────────────

func Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Username = strings.TrimSpace(req.Username)

	if req.Email == "" || req.Password == "" || req.Username == "" {
		writeError(w, http.StatusBadRequest, "email, username, and password are required")
		return
	}
	if len(req.Password) < 8 {
		writeError(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	col := db.GetCollection("users")

	// Check duplicate email/username
	count, _ := col.CountDocuments(ctx, bson.M{"$or": bson.A{
		bson.M{"email": req.Email},
		bson.M{"username": req.Username},
	}})
	if count > 0 {
		writeError(w, http.StatusConflict, "email or username already in use")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to hash password")
		return
	}

	now := time.Now()
	user := models.User{
		ID:           primitive.NewObjectID(),
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: string(hash),
		IsVerified:   false,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if _, err := col.InsertOne(ctx, user); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create user")
		return
	}

	token, err := auth.GenerateVerificationToken(ctx, user.ID.Hex())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to generate verification token")
		return
	}

	// Send email in background
	go auth.SendConfirmationEmail(user.Email, token)

	writeJSON(w, http.StatusCreated, map[string]string{
		"message": "Account created. Please check your email to verify your account.",
	})
}

// ─── Verify Email ─────────────────────────────────────────────────────────────

func VerifyEmail(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		writeError(w, http.StatusBadRequest, "missing token")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userID, err := auth.RedeemVerificationToken(ctx, token)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid or expired token")
		return
	}

	objID, _ := primitive.ObjectIDFromHex(userID)
	col := db.GetCollection("users")
	col.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{
		"$set": bson.M{"isVerified": true, "updatedAt": time.Now()},
	})

	writeJSON(w, http.StatusOK, map[string]string{"message": "Email verified successfully"})
}

// ─── Login ────────────────────────────────────────────────────────────────────

func Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	col := db.GetCollection("users")
	var user models.User
	if err := col.FindOne(ctx, bson.M{"email": strings.ToLower(req.Email)}).Decode(&user); err != nil {
		writeError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		writeError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}

	if !user.IsVerified {
		writeError(w, http.StatusForbidden, "please verify your email before logging in")
		return
	}

	userIDHex := user.ID.Hex()
	accessToken, err := auth.GenerateAccessToken(userIDHex, user.Email, user.Username, user.IsVerified)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to generate access token")
		return
	}

	refreshToken, err := auth.GenerateRefreshToken(userIDHex)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to generate refresh token")
		return
	}

	if err := auth.StoreRefreshToken(ctx, userIDHex, refreshToken); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to store refresh token")
		return
	}

	// Set refresh token in httpOnly cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "refreshToken",
		Value:    refreshToken,
		Path:     "/api/auth",
		HttpOnly: true,
		Secure:   false, // set to true in production
		SameSite: http.SameSiteStrictMode,
		MaxAge:   int((7 * 24 * time.Hour).Seconds()),
	})

	writeJSON(w, http.StatusOK, tokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user.ToPublic(),
	})
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

func RefreshToken(w http.ResponseWriter, r *http.Request) {
	// Try cookie first, then body
	refreshToken := ""
	if cookie, err := r.Cookie("refreshToken"); err == nil {
		refreshToken = cookie.Value
	} else {
		var req refreshRequest
		json.NewDecoder(r.Body).Decode(&req)
		refreshToken = req.RefreshToken
	}

	if refreshToken == "" {
		writeError(w, http.StatusUnauthorized, "missing refresh token")
		return
	}

	claims, err := auth.ValidateToken(refreshToken)
	if err != nil || claims.TokenType != "refresh" {
		writeError(w, http.StatusUnauthorized, "invalid refresh token")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Validate stored token matches
	stored, err := auth.GetRefreshToken(ctx, claims.UserID)
	if err == redis.Nil || stored != refreshToken {
		writeError(w, http.StatusUnauthorized, "refresh token revoked")
		return
	}

	// Fetch fresh user data
	col := db.GetCollection("users")
	objID, _ := primitive.ObjectIDFromHex(claims.UserID)
	var user models.User
	if err := col.FindOne(ctx, bson.M{"_id": objID}).Decode(&user); err != nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	// Rotate tokens
	newAccess, _ := auth.GenerateAccessToken(claims.UserID, user.Email, user.Username, user.IsVerified)
	newRefresh, _ := auth.GenerateRefreshToken(claims.UserID)
	auth.StoreRefreshToken(ctx, claims.UserID, newRefresh)

	http.SetCookie(w, &http.Cookie{
		Name:     "refreshToken",
		Value:    newRefresh,
		Path:     "/api/auth",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   int((7 * 24 * time.Hour).Seconds()),
	})

	writeJSON(w, http.StatusOK, map[string]string{
		"accessToken":  newAccess,
		"refreshToken": newRefresh,
	})
}

// ─── Logout ───────────────────────────────────────────────────────────────────

func Logout(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	auth.DeleteRefreshToken(ctx, userID)

	http.SetCookie(w, &http.Cookie{
		Name:   "refreshToken",
		Value:  "",
		Path:   "/api/auth",
		MaxAge: -1,
	})

	writeJSON(w, http.StatusOK, map[string]string{"message": "logged out"})
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

func ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req forgotRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	col := db.GetCollection("users")
	var user models.User
	// Always return success to prevent email enumeration
	if err := col.FindOne(ctx, bson.M{"email": strings.ToLower(req.Email)}).Decode(&user); err == nil {
		token, _ := auth.GenerateResetToken(ctx, user.ID.Hex())
		go auth.SendPasswordResetEmail(user.Email, token)
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "If that email exists, you'll receive a reset link shortly.",
	})
}

// ─── Reset Password ───────────────────────────────────────────────────────────

func ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req resetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.Password) < 8 {
		writeError(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userID, err := auth.RedeemResetToken(ctx, req.Token)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid or expired reset token")
		return
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	objID, _ := primitive.ObjectIDFromHex(userID)
	col := db.GetCollection("users")
	col.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{
		"$set": bson.M{"passwordHash": string(hash), "updatedAt": time.Now()},
	})

	// Invalidate all refresh tokens
	auth.DeleteRefreshToken(ctx, userID)

	writeJSON(w, http.StatusOK, map[string]string{"message": "Password reset successfully. Please log in."})
}

// ─── Get Current User ─────────────────────────────────────────────────────────

func GetMe(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, _ := primitive.ObjectIDFromHex(userID)
	col := db.GetCollection("users")
	var user models.User
	if err := col.FindOne(ctx, bson.M{"_id": objID}).Decode(&user); err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}

	writeJSON(w, http.StatusOK, user.ToPublic())
}
