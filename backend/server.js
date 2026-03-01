const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const https = require('https');
const fs = require('fs');
const rateLimit = require("express-rate-limit");
const pool = require("./db");

const certPath = path.join(__dirname, '../certs/certificate.crt');
const keyPath = path.join(__dirname, '../certs/private-key.pem');
const httpsEnabled = fs.existsSync(certPath) && fs.existsSync(keyPath);

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiter for sensitive endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later." }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.warn("⚠️  SESSION_SECRET environment variable is not set. Set it to a strong random value in production.");
}
app.use(session({
  secret: sessionSecret || require('crypto').randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: httpsEnabled, sameSite: 'lax' }
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API: Get current logged-in user
app.get("/api/me", (req, res) => {
  if (req.session && req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// API: Login route
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

// API: Announcements
app.get("/api/announcements", apiLimiter, (req, res) => {
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
app.get("/api/knowledge", apiLimiter, (req, res) => {
  try {
    const filePath = path.join(__dirname, "knowledgeUpdates.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (err) {
    console.error("Knowledge error:", err);
    res.status(500).json({ error: "Server error loading updates.", details: err.message });
  }
});

// API: Admin Dashboard Stats
app.get("/api/stats", (req, res) => {
  try {
    res.json({ users: 10, logins: 50, uploads: 5 });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Server error loading stats.", details: err.message });
  }
});

// API: File Upload
app.post("/api/upload", (req, res) => {
  res.status(200).json({ status: "File upload stub. Implement actual upload logic." });
});

// API: Export CSV
app.get("/api/export-csv", (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="export.csv"');
  res.send("id,name,role\n1,Chitti,Admin\n2,Rajendra,User");
});

// Default route - serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start server (HTTPS if certs exist, otherwise HTTP)
if (httpsEnabled) {
  const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
  https.createServer(options, app).listen(PORT, () => {
    console.log(`✅ Portal running at: https://localhost:${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`✅ Portal running at: http://localhost:${PORT}`);
  });
}
