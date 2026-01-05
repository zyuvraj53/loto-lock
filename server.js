require("dotenv").config();
const express = require("express");
const { login } = require("./auth");
const { setServo } = require("./blynk");
const { canAct, getLockState, setLock, unlock } = require("./loto");
const requireAuth = require("./middleware/requireAuth");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const cors = require("cors");
app.use(cors({ origin: "*", methods: ["GET","POST"], allowedHeaders: ["Content-Type","Authorization"] }));

// HEALTH CHECK
// app.get("/", (req, res) => {
//   res.status(200).send("ok");
// });


// LOGIN
app.post("/login", async (req, res) => {
  try {
    const token = await login(req.body.username, req.body.password);
    res.json({ token });
  } catch (e) {
    res.status(401).json({ error: e });
  }
});

// CONTROL SERVO
app.post("/servo", requireAuth, async (req, res) => {
  try {
    const { angle } = req.body;
    const lock = await getLockState();

    // Hierarchy check
    if (!canAct(req.user.role, lock)) {
      return res.status(403).json({ error: "Locked by higher role" });
    }

    await setServo(angle);

    // Lock/unlock
    if (angle === 90) await setLock(req.user.username, req.user.role);
    if (angle === 0) {
      const ok = await unlock(req.user.role);
      if (!ok) return res.status(403).json({ error: "Cannot unlock, higher role lock exists" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
