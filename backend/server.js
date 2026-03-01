const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const pool = require("./db");
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'lax' }
}));

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
    // Return dummy stats for now
    res.json({ users: 10, logins: 50, uploads: 5 });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Server error loading stats.", details: err.message });
  }
});

// API: File Upload (stub)
app.post("/api/upload", (req, res) => {
  // Stub: Accepts file upload, but does not save
  res.status(200).json({ status: "File upload stub. Implement actual upload logic." });
});

// API: Export CSV (stub)
app.get("/api/export-csv", (req, res) => {
  // Stub: Returns dummy CSV content
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="export.csv"');
  res.send("id,name,role\n1,Chitti,Admin\n2,Rajendra,User");
});

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
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
    // Set session
    req.session.user = {
      empId: user.emp_id,
      name: user.name,
      role: user.role,
      team: user.team,
      // ...existing code...
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

// Start HTTP server
app.listen(PORT, () => {
  console.log(`✅ Portal running at: http://localhost:${PORT}`);
});
