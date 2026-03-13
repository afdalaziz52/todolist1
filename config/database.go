package config

import (
    "database/sql"
    "fmt"
    "log"
    "os"

    _ "github.com/lib/pq"
    "github.com/go-playground/validator/v10"
)

var DB *sql.DB
var Validate *validator.Validate

func InitDB() {
    var err error
    dsn := os.Getenv("DATABASE_URL")

    DB, err = sql.Open("postgres", dsn)
    if err != nil {
        log.Fatal(err)
    }

    if err = DB.Ping(); err != nil {
        log.Fatal(err)
    }

    Validate = validator.New()

    fmt.Println("✅ Database connected!")
}