require('dotenv').config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const fs = require('fs');
const http = require('http');
const https = require('https');
const rateLimit = require("express-rate-limit");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const useSecureCookies = process.env.HTTPS_ENABLED === 'true' || process.env.NODE_ENV === 'production';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: useSecureCookies, sameSite: 'lax' }
}));

// Rate limiter for login endpoint (10 attempts per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Static files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../public")));
app.use("/docs", express.static(path.join(__dirname, "../docs")));

// ── API Routes ────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Get current logged-in user
app.get("/api/me", (req, res) => {
  if (req.session && req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// Login
app.post("/api/login", loginLimiter, async (req, res) => {
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

// Announcements
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

// Knowledge Updates
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

// Admin Dashboard Stats (stub)
app.get("/api/stats", (req, res) => {
  try {
    res.json({ users: 10, logins: 50, uploads: 5 });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Server error loading stats.", details: err.message });
  }
});

// File Upload (stub)
app.post("/api/upload", (req, res) => {
  res.status(200).json({ status: "File upload stub. Implement actual upload logic." });
});

// Export CSV (stub)
app.get("/api/export-csv", (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="export.csv"');
  res.send("id,name,role\n1,Chitti,Admin\n2,Rajendra,User");
});

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ── Start server (HTTPS if certs available, otherwise HTTP) ───────────────────
const defaultCertPath = path.join(__dirname, '../certs/certificate.crt');
const defaultKeyPath = path.join(__dirname, '../certs/private-key.pem');
const keyFile = process.env.HTTPS_KEY || defaultKeyPath;
const certFile = process.env.HTTPS_CERT || defaultCertPath;
const httpsEnabled = process.env.HTTPS_ENABLED === 'true' ||
  (fs.existsSync(keyFile) && fs.existsSync(certFile));

const startHttpMessage = (port) => {
  console.log(`✅ Portal running at: http://localhost:${port}`);
  console.log(`   Open your browser and go to: http://localhost:${port}`);
};

if (httpsEnabled) {
  try {
    const options = {
      key: fs.readFileSync(keyFile),
      cert: fs.readFileSync(certFile)
    };
    https.createServer(options, app).listen(PORT, () => {
      console.log(`✅ Portal running at: https://localhost:${PORT}`);
      console.log(`   Open your browser and go to: https://localhost:${PORT}`);
      console.log(`   (Accept the certificate warning if using a self-signed cert)`);
    });
  } catch (err) {
    console.error('⚠️  HTTPS cert error, falling back to HTTP:', err.message);
    http.createServer(app).listen(PORT, () => startHttpMessage(PORT));
  }
} else {
  http.createServer(app).listen(PORT, () => startHttpMessage(PORT));
}
