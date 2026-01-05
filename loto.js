const db = require("./db");

// Define role hierarchy: higher number = higher priority
const HIERARCHY = {
  operator: 1,
  supervisor: 2,
  manager: 3,
  admin: 4
};

// Can the user act on the servo given current lock state?
function canAct(userRole, lock) {
  if (!lock || !lock.locked) return true; // No lock, anyone can act
  const userLevel = HIERARCHY[userRole] || 0;
  const lockLevel = lock.locked_by_role || 0;
  return userLevel >= lockLevel;
}

// Get current lock state
function getLockState() {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM lock_state WHERE id=1", [], (err, row) => {
      if (err) return reject(err);
      resolve(row || { locked: 0 });
    });
  });
}

// Set a lock
function setLock(user, role) {
  return new Promise((resolve, reject) => {
    const roleLevel = HIERARCHY[role];
    db.run(
      `INSERT OR REPLACE INTO lock_state
       (id, locked, locked_by_role, locked_by_user, locked_at)
       VALUES (1, 1, ?, ?, datetime('now'))`,
      [roleLevel, user],
      function (err) {
        if (err) return reject(err);
        console.log(`Lock saved: user=${user}, role=${role}`);
        resolve();
      }
    );
  });
}

// Unlock the servo (respect hierarchy)
async function unlock(userRole) {
  const lock = await getLockState();
  if (!canAct(userRole, lock)) {
    console.log(`User role ${userRole} cannot unlock, higher role lock exists`);
    return false;
  }
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM lock_state WHERE id=1", function (err) {
      if (err) return reject(err);
      console.log("Lock cleared from DB");
      resolve(true);
    });
  });
}

module.exports = { canAct, getLockState, setLock, unlock };
