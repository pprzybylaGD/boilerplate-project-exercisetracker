const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db_name = path.join(__dirname, "data", "exercise_tracker.db");

const db = new sqlite3.Database(db_name, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");

    db.run(
      `CREATE TABLE IF NOT EXISTS users (
          _id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE
        )`,
      (err) => {
        if (err) {
          console.error("Error creating users table:", err.message);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS exercises (
          _id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          description TEXT NOT NULL,
          duration INTEGER NOT NULL,
          date TEXT,
          FOREIGN KEY(user_id) REFERENCES users(_id)
        )`,
      (err) => {
        if (err) {
          console.error("Error creating exercises table:", err.message);
        }
      }
    );
  }
});

module.exports = db;
