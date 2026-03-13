package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/afdalaziz52/to-do-list/config"
	"github.com/afdalaziz52/to-do-list/helpers"
	"github.com/afdalaziz52/to-do-list/models"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// POST /auth/register
func Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": "Format tidak valid"})
		return
	}

	if err := config.Validate.Struct(req); err != nil {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": err.Error()})
		return
	}

	var exists int
	config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE email = $1", req.Email).Scan(&exists)
	if exists > 0 {
		helpers.WriteJSON(w, 409, map[string]any{"status": "error", "message": "Email sudah terdaftar"})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		helpers.WriteJSON(w, 500, map[string]any{"status": "error", "message": "Gagal memproses password"})
		return
	}

	_, err = config.DB.Exec(
		"INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
		req.Name, req.Email, string(hashed))
	if err != nil {
		helpers.WriteJSON(w, 500, map[string]any{"status": "error", "message": "Gagal mendaftarkan user"})
		return
	}

	helpers.WriteJSON(w, 201, map[string]any{"status": "success", "message": "Registrasi berhasil"})
}

// POST /auth/login
func Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": "Format tidak valid"})
		return
	}

	if err := config.Validate.Struct(req); err != nil {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": err.Error()})
		return
	}

	var user models.User
	err := config.DB.QueryRow(
		"SELECT id, name, email, password FROM users WHERE email = $1", req.Email).
		Scan(&user.ID, &user.Name, &user.Email, &user.Password)

	if err == sql.ErrNoRows {
		helpers.WriteJSON(w, 401, map[string]any{"status": "error", "message": "Email atau password salah"})
		return
	}
	if err != nil {
		helpers.WriteJSON(w, 500, map[string]any{"status": "error", "message": "Gagal login"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		helpers.WriteJSON(w, 401, map[string]any{"status": "error", "message": "Email atau password salah"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": user.ID,
		"exp":    time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		helpers.WriteJSON(w, 500, map[string]any{"status": "error", "message": "Gagal membuat token"})
		return
	}

	helpers.WriteJSON(w, 200, map[string]any{
		"status":  "success",
		"message": "Login berhasil",
		"token":   tokenString,
		"user": map[string]any{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

// POST /auth/change-password
func ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

	var req struct {
		NewPassword string `json:"new_password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": "Format tidak valid"})
		return
	}

	if req.NewPassword == "" {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": "Password baru harus diisi"})
		return
	}

	if len(req.NewPassword) < 6 {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": "Password minimal 6 karakter"})
		return
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		helpers.WriteJSON(w, 500, map[string]any{"status": "error", "message": "Gagal memproses password"})
		return
	}

	_, err = config.DB.Exec("UPDATE users SET password = $1 WHERE id = $2", string(newHash), userID)
	if err != nil {
		helpers.WriteJSON(w, 500, map[string]any{"status": "error", "message": "Gagal mengubah password"})
		return
	}

	helpers.WriteJSON(w, 200, map[string]any{"status": "success", "message": "Password berhasil diubah"})
}