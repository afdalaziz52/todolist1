package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/afdalaziz52/to-do-list/config"
	"github.com/afdalaziz52/to-do-list/helpers"
	"github.com/afdalaziz52/to-do-list/models"
	"github.com/gorilla/mux"
)

// GET /tasks
func GetTasks(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

	rows, err := config.DB.Query(
		"SELECT id, user_id, title, category, priority, custom_category, status, deadline, created_at, updated_at FROM tasks WHERE user_id = $1 ORDER BY created_at DESC", userID)
	if err != nil {
		helpers.WriteJSON(w, 500, map[string]any{"status": "error", "message": "Gagal ambil data"})
		return
	}
	defer rows.Close()

	tasks := []models.Task{}
	for rows.Next() {
		var t models.Task
		rows.Scan(&t.ID, &t.UserID, &t.Title, &t.Category, &t.Priority, &t.CustomCategory, &t.Status, &t.Deadline, &t.CreatedAt, &t.UpdatedAt)
		tasks = append(tasks, t)
	}

	helpers.WriteJSON(w, 200, map[string]any{"status": "success", "data": tasks})
}

// GET /tasks/{id}
func GetTaskByID(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	id, _ := strconv.Atoi(mux.Vars(r)["id"])

	var t models.Task
	err := config.DB.QueryRow(
		"SELECT id, user_id, title, category, priority, custom_category, status, deadline, created_at, updated_at FROM tasks WHERE id = $1 AND user_id = $2", id, userID).
		Scan(&t.ID, &t.UserID, &t.Title, &t.Category, &t.Priority, &t.CustomCategory, &t.Status, &t.Deadline, &t.CreatedAt, &t.UpdatedAt)

	if err != nil {
		helpers.WriteJSON(w, 404, map[string]any{"status": "error", "message": "Task tidak ditemukan"})
		return
	}

	helpers.WriteJSON(w, 200, map[string]any{"status": "success", "data": t})
}

// POST /tasks
func CreateTask(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

	var req models.TaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": "Format tidak valid"})
		return
	}

	if err := config.Validate.Struct(req); err != nil {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": err.Error()})
		return
	}

	if req.Category == "other" && req.CustomCategory == nil {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": "Custom category wajib diisi"})
		return
	}
	if req.Category != "other" {
		req.CustomCategory = nil
	}

	priority := req.Priority
	if priority == "" {
		priority = "medium"
	}

	// PostgreSQL pakai RETURNING id, bukan LastInsertId()
	var newID int
	err := config.DB.QueryRow(
		"INSERT INTO tasks (user_id, title, category, priority, custom_category, status, deadline) VALUES ($1, $2, $3, $4, $5, 'pending', $6) RETURNING id",
		userID, req.Title, req.Category, priority, req.CustomCategory, req.Deadline).Scan(&newID)
	if err != nil {
		helpers.WriteJSON(w, 500, map[string]any{"status": "error", "message": "Gagal membuat task"})
		return
	}

	helpers.WriteJSON(w, 201, map[string]any{"status": "success", "message": "Task berhasil dibuat", "id": newID})
}

// PATCH /tasks/{id}
func UpdateTask(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	id, _ := strconv.Atoi(mux.Vars(r)["id"])

	var req models.TaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": "Format tidak valid"})
		return
	}

	if err := config.Validate.Struct(req); err != nil {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": err.Error()})
		return
	}

	if req.Category == "other" && req.CustomCategory == nil {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": "Custom category wajib diisi"})
		return
	}
	if req.Category != "other" {
		req.CustomCategory = nil
	}

	priority := req.Priority
	if priority == "" {
		priority = "medium"
	}

	var exists int
	err := config.DB.QueryRow("SELECT COUNT(*) FROM tasks WHERE id=$1 AND user_id=$2", id, userID).Scan(&exists)
	if err != nil || exists == 0 {
		helpers.WriteJSON(w, 404, map[string]any{"status": "error", "message": "Task tidak ditemukan"})
		return
	}

	_, err = config.DB.Exec(
		"UPDATE tasks SET title=$1, category=$2, priority=$3, custom_category=$4, deadline=$5, updated_at=NOW() WHERE id=$6 AND user_id=$7",
		req.Title, req.Category, priority, req.CustomCategory, req.Deadline, id, userID)
	if err != nil {
		helpers.WriteJSON(w, 500, map[string]any{"status": "error", "message": "Gagal update task"})
		return
	}

	helpers.WriteJSON(w, 200, map[string]any{"status": "success", "message": "Task berhasil diupdate"})
}

// PATCH /tasks/{id}/status
func UpdateStatus(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	id, _ := strconv.Atoi(mux.Vars(r)["id"])

	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": "Format tidak valid"})
		return
	}

	if body.Status != "pending" && body.Status != "done" {
		helpers.WriteJSON(w, 400, map[string]any{"status": "error", "message": "Status harus pending atau done"})
		return
	}

	result, err := config.DB.Exec(
		"UPDATE tasks SET status=$1, updated_at=NOW() WHERE id=$2 AND user_id=$3", body.Status, id, userID)
	if err != nil {
		helpers.WriteJSON(w, 500, map[string]any{"status": "error", "message": "Gagal update status"})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		helpers.WriteJSON(w, 404, map[string]any{"status": "error", "message": "Task tidak ditemukan"})
		return
	}

	helpers.WriteJSON(w, 200, map[string]any{"status": "success", "message": "Status berhasil diupdate"})
}

// DELETE /tasks/{id}
func DeleteTask(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	id, _ := strconv.Atoi(mux.Vars(r)["id"])

	result, err := config.DB.Exec(
		"DELETE FROM tasks WHERE id=$1 AND user_id=$2", id, userID)
	if err != nil {
		helpers.WriteJSON(w, 500, map[string]any{"status": "error", "message": "Gagal hapus task"})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		helpers.WriteJSON(w, 404, map[string]any{"status": "error", "message": "Task tidak ditemukan"})
		return
	}

	helpers.WriteJSON(w, 200, map[string]any{"status": "success", "message": "Task berhasil dihapus"})
}