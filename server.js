require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { login } = require("./auth");
const { setServo } = require("./blynk");
const { canAct, getLockState, setLock, unlock } = require("./loto");
const requireAuth = require("./middleware/requireAuth");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ✅ Serve frontend
app.use(express.static("public"));

// ✅ Health check
app.get("/health", (req, res) => {
  res.send("ok");
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const token = await login(req.body.username, req.body.password);
    res.json({ token });
  } catch (e) {
    res.status(401).json({ error: e });
  }
});

// SERVO CONTROL
app.post("/servo", requireAuth, async (req, res) => {
  const { angle } = req.body;
  const lock = await getLockState();

  if (!canAct(req.user.role, lock)) {
    return res.status(403).json({ error: "Locked by higher role" });
  }

  await setServo(angle);

  if (angle === 90) await setLock(req.user.username, req.user.role);
  if (angle === 0) {
    const ok = await unlock(req.user.role);
    if (!ok) return res.status(403).json({ error: "Cannot unlock higher lock" });
  }

  res.json({ success: true });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
