const express = require("express");
const path = require("path");
const https = require('https');
const fs = require('fs');
const session = require("express-session");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Global rate limiter – max 100 requests per minute per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Middleware
app.use(express.json());

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.warn("⚠️  SESSION_SECRET is not set. Using insecure default – set SESSION_SECRET in production.");
}
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'lax' }
}));

// Serve static files from public/
app.use(express.static(path.join(__dirname, "../public")));

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API: Announcements
app.get("/api/announcements", (req, res) => {
  try {
    const filePath = path.join(__dirname, "announcements.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (err) {
    console.error("Announcements error:", err);
    res.status(500).json({ error: "Server error loading announcements.", details: err.message });
  }
});

// API: Knowledge Updates
app.get("/api/knowledge", (req, res) => {
  try {
    const filePath = path.join(__dirname, "knowledgeUpdates.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (err) {
    console.error("Knowledge error:", err);
    res.status(500).json({ error: "Server error loading updates.", details: err.message });
  }
});

// API: Admin Dashboard Stats (stub)
app.get("/api/stats", (req, res) => {
  try {
    res.json({ users: 10, logins: 50, uploads: 5 });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Server error loading stats.", details: err.message });
  }
});

// API: File Upload (stub)
app.post("/api/upload", (req, res) => {
  res.status(200).json({ status: "File upload stub. Implement actual upload logic." });
});

// API: Export CSV (stub)
app.get("/api/export-csv", (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="export.csv"');
  res.send("id,name,role\n1,Chitti,Admin\n2,Rajendra,User");
});

// API: Get current logged-in user
app.get("/api/me", (req, res) => {
  if (req.session && req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// API: Login route
app.post("/api/login", async (req, res) => {
  const { empId, password } = req.body;
  if (!empId || !password) {
    return res.status(400).json({ error: "Employee ID and password required" });
  }
  try {
    const result = await pool.query(
      "SELECT emp_id, name, password, role, team, must_change_password FROM users WHERE emp_id = $1",
      [empId]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    req.session.user = {
      empId: user.emp_id,
      name: user.name,
      role: user.role,
      team: user.team,
    };
    res.json({
      empId: user.emp_id,
      name: user.name,
      role: user.role,
      team: user.team,
      mustChangePassword: user.must_change_password
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Return 404 JSON for unmatched /api/* paths
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Default route – serve index.html for any unmatched path
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

let options;
try {
  const certPath = path.join(__dirname, '../certs/certificate.crt');
  const keyPath = path.join(__dirname, '../certs/private-key.pem');
  options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
} catch (err) {
  console.error("❌ Failed to load TLS certificates:", err.message);
  process.exit(1);
}

// Start HTTPS server and print URL
https.createServer(options, app).listen(PORT, () => {
  console.log(`✅ Portal running at: https://localhost:${PORT}`);
});
