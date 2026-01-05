// const fetch = require("node-fetch");
require("dotenv").config();

const BLYNK_TOKEN = process.env.BLYNK_TOKEN;
const BLYNK_BASE = "https://fra1.blynk.cloud/external/api";

async function setServo(angle) {
  const url = `${BLYNK_BASE}/update?token=${BLYNK_TOKEN}&V3=${angle}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Blynk setServo failed: ${res.statusText}`);
  console.log(`[BLYNK] V3 set to ${angle}`);
}

async function getServoAngle() {
  const url = `${BLYNK_BASE}/get?token=${BLYNK_TOKEN}&V3`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Blynk getServoAngle failed: ${res.statusText}`);
  const data = await res.json();
  return parseInt(data[0], 10);
}

module.exports = { setServo, getServoAngle };
