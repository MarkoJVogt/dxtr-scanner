import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCodeScan } from "./lib/scanner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/scan", async (req, res) => {
  if (isRateLimited(req.ip)) {
    res.status(429).json({ error: "Zu viele Scans. Bitte in 15 Minuten erneut versuchen." });
    return;
  }

  const { repoUrl } = req.body || {};
  try {
    const result = await runCodeScan(repoUrl);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`dxtr-scanner listening on port ${port}`);
});
