const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const USERS = {
  admin: {
    hash: process.env.ADMIN_HASH,
    role: "admin"
  },
  operator: {
    hash: process.env.OP1_HASH,
    role: "operator"
  }
};

async function login(username, password) {
  const user = USERS[username];
  if (!user) throw "Invalid credentials";

  const ok = await bcrypt.compare(password, user.hash);
  if (!ok) throw "Invalid credentials";

  return jwt.sign(
    { username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

module.exports = { login };
