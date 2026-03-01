require('dotenv').config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const pool = require("./db");
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware must come BEFORE routes
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'lax' }
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// CSRF token endpoint
app.get("/api/csrf-token", (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.json({ csrfToken: req.session.csrfToken });
});

// CSRF validation middleware for state-changing routes
function validateCsrf(req, res, next) {
  const token = req.headers['x-csrf-token'];
  if (!token || !req.session.csrfToken || token !== req.session.csrfToken) {
    return res.status(403).json({ error: "Invalid or missing CSRF token" });
  }
  next();
}

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many login attempts. Please try again later." }
});

// General rate limiter for all API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: "Too many requests. Please try again later." }
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
app.post("/api/login", loginLimiter, validateCsrf, async (req, res) => {
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
    // Set session
    req.session.user = {
      empId: user.emp_id,
      name: user.name,
      role: user.role,
      team: user.team,
      mustChangePassword: user.must_change_password,
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

// Default route
app.get("/", apiLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const certPath = path.join(__dirname, '../certs/certificate.crt');
const keyPath = path.join(__dirname, '../certs/private-key.pem');
const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

// Start HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`✅ Portal running at: https://localhost:${PORT}`);
});
