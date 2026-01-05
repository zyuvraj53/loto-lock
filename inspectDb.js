const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./lock.db");

console.log("=== Users Table ===");
db.all("SELECT id, username, role, password_hash FROM users", [], (err, users) => {
  if (err) {
    console.error("Error fetching users:", err);
  } else {
    users.forEach(u => {
      console.log(`ID: ${u.id}, Username: ${u.username}, Role: ${u.role}, Hash: ${u.password_hash}`);
    });
    if (users.length === 0) console.log("No users found in DB.");
  }
});

console.log("\n=== Lock State ===");
db.all("SELECT * FROM lock_state", [], (err, locks) => {
  if (err) {
    console.error("Error fetching lock state:", err);
  } else {
    if (locks.length === 0) {
      console.log("Lock is currently free (unlocked).");
    } else {
      locks.forEach(lock => {
        console.log(`Locked: ${lock.locked}, By User: ${lock.locked_by_user}, Role: ${lock.locked_by_role}, At: ${lock.locked_at}`);
      });
    }
  }
});

// Close DB after a short delay to allow async callbacks
setTimeout(() => db.close(), 500);
