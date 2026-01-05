const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./lock.db");

db.serialize(() => {
  // Users table (optional if using static users)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password_hash TEXT,
      role INTEGER
    )
  `);

  // Lock state table
  db.run(`
    CREATE TABLE IF NOT EXISTS lock_state (
      id INTEGER PRIMARY KEY,
      locked INTEGER,
      locked_by_role INTEGER,
      locked_by_user TEXT,
      locked_at TEXT
    )
  `);
});

module.exports = db;
