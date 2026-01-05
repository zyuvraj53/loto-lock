const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const db = new sqlite3.Database("./lock.db");

async function createAdmin() {
  const hash = await bcrypt.hash("1234", 10); // password = "1234"

  db.run(
    `INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
    ["admin", hash, 4],
    function(err) {
      if (err) console.error("Error creating admin:", err.message);
      else console.log("Admin user created or already exists");
    }
  );

  // Close after a short delay to ensure write completes
  setTimeout(() => db.close(), 500);
}

createAdmin();
