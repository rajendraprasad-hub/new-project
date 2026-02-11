const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
const session = require("express-session");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const csurf = require("csurf");
const cookieParser = require("cookie-parser");
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const dotenv = require("dotenv");
const { Parser } = require("json2csv");

const authMiddleware = require("./auth");
const uploaderOnly = require("./uploaderOnly");
const adminOnly = require("./adminOnly");
const logActivity = require("./logger");

const app = express();
const PORT = process.env.PORT || 3000;

// Load env
dotenv.config();

app.use(express.json());

// Security headers
app.use(helmet());

// Parse cookies (required for csurf cookie mode)
app.use(cookieParser());

// ✅ Allowed teams list (your teams)
const ALLOWED_TEAMS = ["MFPM", "COE", "CMO", "CIV", "GCM"];

// ✅ Session setup (with timeout)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "infosys-portal-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000, // ✅ 1 hour session
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    }
  })
);

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});

// Content-Security-Policy (adjust sources as needed)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"] ,
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"] ,
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"]
    }
  })
);

// CSRF protection (use cookie mode for SPA)
app.use(csurf({ cookie: true }));

// Expose CSRF token for frontend to fetch
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Apply admin rate limiter to admin routes
app.use('/api/admin', adminLimiter);

// Serve frontend from public
app.use(express.static(path.join(__dirname, "../public")));

// Serve docs folder
app.use("/docs", express.static(path.join(__dirname, "../docs")));

const usersPath = path.join(__dirname, "users.json");
const activityLogPath = path.join(__dirname, "activityLogs.json");
const announcementsPath = path.join(__dirname, "announcements.json");
const metadataPath = path.join(__dirname, "fileMetadata.json");
const loginAttemptsPath = path.join(__dirname, "loginAttempts.json");

// ✅ Knowledge base storage file
const knowledgePath = path.join(__dirname, "knowledgeUpdates.json");

// ✅ Ensure needed JSON files exist
function ensureFile(filePath, defaultData) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

ensureFile(activityLogPath, []);
ensureFile(announcementsPath, []);
ensureFile(metadataPath, {});
ensureFile(loginAttemptsPath, {});
ensureFile(knowledgePath, []);

// ✅ Knowledge versions storage (for version-history UI)
const knowledgeVersionsPath = path.join(__dirname, "knowledgeVersions.json");
ensureFile(knowledgeVersionsPath, {});

// ✅ JSON Helpers
function readJSON(filePath, defaultVal) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return defaultVal;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ✅ Helper: today string
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ✅ Helper: clean file name for UI/logs
function cleanFileName(file) {
  return String(file || "").replace("uploads/", "").replace("trash/", "");
}

// ✅ Helper: Check lock
function isLocked(empId) {
  const attempts = readJSON(loginAttemptsPath, {});
  const row = attempts[empId];
  if (!row) return { locked: false };

  if (row.lockedUntil && Date.now() < row.lockedUntil) {
    const minsLeft = Math.ceil((row.lockedUntil - Date.now()) / 60000);
    return { locked: true, minsLeft };
  }
  return { locked: false };
}

// ✅ Helper: record fail attempt (lock after 5)
function recordFail(empId) {
  const attempts = readJSON(loginAttemptsPath, {});
  if (!attempts[empId]) {
    attempts[empId] = { fails: 0, lockedUntil: null };
  }
  attempts[empId].fails += 1;

  if (attempts[empId].fails >= 5) {
    attempts[empId].lockedUntil = Date.now() + 15 * 60 * 1000; // ✅ 15 min
    attempts[empId].fails = 0;
  }

  writeJSON(loginAttemptsPath, attempts);
}

// ✅ Helper: clear fails on success
function clearFail(empId) {
  const attempts = readJSON(loginAttemptsPath, {});
  if (attempts[empId]) {
    delete attempts[empId];
    writeJSON(loginAttemptsPath, attempts);
  }
}

// ================================
// ✅ AUTH APIs
// ================================

// ✅ API: Login (LOCK CHECK + bcrypt + mustChangePassword + TEAM + ROLE)
app.post("/api/login", loginLimiter, [
  body("empId").trim().notEmpty(),
  body("password").notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid input" });
  }
  let { empId, password } = req.body;

  empId = String(empId || "").trim();
  password = String(password || "").trim();

  if (!empId || !password) {
    return res.status(400).json({ message: "Employee ID and Password required" });
  }

  const lockInfo = isLocked(empId);
  if (lockInfo.locked) {
    return res
      .status(403)
      .json({ message: `Account locked. Try again after ${lockInfo.minsLeft} minute(s).` });
  }

  try {
    const users = readJSON(usersPath, []);
    const user = users.find((u) => String(u.empId) === empId);

    if (!user) {
      recordFail(empId);
      return res.status(401).json({ message: "Invalid Employee ID or Password" });
    }

    let ok = false;
    if (user.password && String(user.password).startsWith("$2")) {
      ok = bcrypt.compareSync(password, user.password);
    } else {
      ok = String(user.password) === password;
    }

    if (!ok) {
      recordFail(empId);
      return res.status(401).json({ message: "Invalid Employee ID or Password" });
    }

    clearFail(empId);

    const role = user.role || "user";
    const team = ALLOWED_TEAMS.includes(user.team) ? user.team : "MFPM";

    req.session.user = {
      empId: user.empId,
      name: user.name,
      role,
      team,
      mustChangePassword: user.mustChangePassword === true
    };

    logActivity({
      type: "LOGIN",
      empId: user.empId,
      name: user.name
    });

    return res.json({
      message: "Login success",
      user: req.session.user,
      mustChangePassword: req.session.user.mustChangePassword
    });
  } catch (err) {
    return res.status(500).json({ message: "Users data error. Check users.json" });
  }
});

// ✅ API: Check session
app.get("/api/me", (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  }
  return res.json({ loggedIn: false });
});

// ✅ API: Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    return res.json({ message: "Logged out successfully" });
  });
});

// ✅ Change password
app.post("/api/change-password", authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Old password and new password required" });
  }

  if (String(newPassword).length < 4) {
    return res.status(400).json({ message: "New password too short" });
  }

  const users = readJSON(usersPath, []);
  const idx = users.findIndex((u) => String(u.empId) === String(req.session.user.empId));

  if (idx === -1) return res.status(404).json({ message: "User not found" });

  const user = users[idx];

  let ok = false;
  if (user.password && String(user.password).startsWith("$2")) {
    ok = bcrypt.compareSync(String(oldPassword), user.password);
  } else {
    ok = String(user.password) === String(oldPassword);
  }

  if (!ok) return res.status(401).json({ message: "Old password incorrect" });

  const hashed = bcrypt.hashSync(String(newPassword), 10);
  users[idx].password = hashed;
  users[idx].mustChangePassword = false;

  writeJSON(usersPath, users);

  req.session.user.mustChangePassword = false;

  logActivity({
    type: "PASSWORD_CHANGE",
    empId: req.session.user.empId,
    name: req.session.user.name
  });

  return res.json({ message: "Password updated successfully" });
});

// ================================
// ✅ Upload setup (docs/uploads + limits + duplicates)
// ================================
const uploadDir = path.join(__dirname, "../docs/uploads");
const trashDir = path.join(__dirname, "../docs/trash");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(trashDir)) fs.mkdirSync(trashDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, "_");
    const fullPath = path.join(uploadDir, safeName);

    if (fs.existsSync(fullPath)) {
      return cb(new Error("DUPLICATE_FILE"), safeName);
    }

    cb(null, safeName);
  }
});

const allowedExts = [
  ".pdf",
  ".xlsx",
  ".xls",
  ".pptx",
  ".ppt",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png"
];

const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024 // ✅ 30MB
  },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) return cb(new Error("INVALID_FILE_TYPE"));
    cb(null, true);
  }
});

// ✅ Upload API (uploader/admin only)
app.post("/api/upload", authMiddleware, uploaderOnly, (req, res) => {
  upload.single("file")(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File too large. Max allowed size is 30MB." });
      }
      if (err.message === "DUPLICATE_FILE") {
        return res.status(400).json({ message: "File already exists. Please rename and upload again." });
      }
      return res.status(500).json({ message: "Upload failed. Try again." });
    }

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const meta = readJSON(metadataPath, {});
    meta[`uploads/${req.file.filename}`] = meta[`uploads/${req.file.filename}`] || {
      category: "General",
      tags: [],
      team: req.session.user.team
    };
    writeJSON(metadataPath, meta);

    logActivity({
      type: "UPLOAD",
      empId: req.session.user.empId,
      name: req.session.user.name,
      file: req.file.filename
    });

    return res.json({
      message: "File uploaded successfully",
      fileName: req.file.filename,
      url: `/docs/uploads/${req.file.filename}`
    });
  });
});

// ================================
// ✅ FILE LIST API (TEAM FILTERING + viewerAll)
// ================================
app.get("/api/files", authMiddleware, (req, res) => {
  const docsPath = path.join(__dirname, "../docs");

  fs.readdir(docsPath, (err, files) => {
    if (err) return res.status(500).json({ error: "Unable to read docs folder" });

    const meta = readJSON(metadataPath, {});
    const role = req.session.user.role;
    const team = req.session.user.team;

    let allFiles = files.filter((f) => f !== "uploads" && f !== "trash" && f !== "kb_uploads");

    const uploadsPath = path.join(__dirname, "../docs/uploads");
    if (fs.existsSync(uploadsPath)) {
      const uploadFiles = fs.readdirSync(uploadsPath).map((f) => `uploads/${f}`);
      allFiles = [...uploadFiles, ...allFiles];
    }

    const canViewAll = role === "admin" || role === "viewerAll";

    const filteredFiles = allFiles.filter((file) => {
      if (!file.startsWith("uploads/")) return true;
      if (canViewAll) return true;

      const m = meta[file];
      if (!m || !m.team) return true;

      return String(m.team) === String(team);
    });

    const data = filteredFiles.map((file) => {
      const ext = path.extname(file).toLowerCase().replace(".", "");
      const m = meta[file] || { category: "General", tags: [], team: "ALL" };

      return {
        fileName: file,
        cleanName: cleanFileName(file),
        type: ext,
        category: m.category || "General",
        team: m.team || "ALL",
        tags: m.tags || [],
        url: `/docs/${file}`,
        trackedUrl: `/api/download/${file}`
      };
    });

    res.json(data);
  });
});

// ================================
// ✅ TRACKED DOWNLOAD API
// ================================
app.get("/api/download/:filePath(*)", authMiddleware, (req, res) => {
  const filePath = req.params.filePath;
  const fullPath = path.join(__dirname, "../docs", filePath);

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ message: "File not found" });
  }

  logActivity({
    type: "DOWNLOAD",
    empId: req.session.user.empId,
    name: req.session.user.name,
    file: filePath
  });

  return res.download(fullPath);
});

// ================================
// ✅ Knowledge Base Attachments Setup ✅
// ================================
const kbUploadDir = path.join(__dirname, "../docs/kb_uploads");
if (!fs.existsSync(kbUploadDir)) fs.mkdirSync(kbUploadDir, { recursive: true });

const kbStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, kbUploadDir);
  },
  filename: function (req, file, cb) {
    const safeName = Date.now() + "_" + file.originalname.replace(/\s+/g, "_");
    cb(null, safeName);
  }
});

const kbUpload = multer({
  storage: kbStorage,
  limits: {
    fileSize: 30 * 1024 * 1024 // ✅ 30MB
  },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) return cb(new Error("INVALID_FILE_TYPE"));
    cb(null, true);
  }
});

// ================================
// ✅ KNOWLEDGE BASE APIs ✅
// ================================

// ✅ Add knowledge update (WITH OPTIONAL ATTACHMENT)
app.post("/api/knowledge", authMiddleware, (req, res) => {
  kbUpload.single("file")(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Attachment too large. Max 30MB." });
      }
      return res.status(500).json({ message: "Attachment upload failed." });
    }

    let {
      country,
      carrier,
      project,
      process,
      title,
      details,
      priority,
      status,
      ticketId,
      refLink
    } = req.body;

    country = String(country || "").trim();
    carrier = String(carrier || "").trim();
    project = String(project || "").trim();
    process = String(process || "").trim();
    title = String(title || "").trim();
    details = String(details || "").trim();

    if (!country || !carrier || !project || !process || !title || !details) {
      return res.status(400).json({ message: "Please fill all required fields (*)" });
    }

    // sanitize free-text fields
    title = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
    details = sanitizeHtml(details, { allowedTags: [], allowedAttributes: {} });
    ticketId = sanitizeHtml(String(ticketId || ""), { allowedTags: [], allowedAttributes: {} });
    refLink = sanitizeHtml(String(refLink || ""), { allowedTags: [], allowedAttributes: {} });

    const list = readJSON(knowledgePath, []);

    let attachment = null;
    if (req.file) {
      attachment = {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        url: `/docs/kb_uploads/${req.file.filename}`
      };
    }

    const item = {
      id: Date.now().toString(),
      country: String(country).trim(),
      carrier: String(carrier).trim(),
      project: String(project).trim(),
      process: String(process).trim(),
      title: String(title).trim(),
      details: String(details).trim(),

      priority: priority || "Low",
      status: status || "New",
      ticketId: ticketId || "",
      refLink: refLink || "",

      attachment, // ✅ NEW

      team: req.session.user.team,
      createdAt: new Date().toISOString(),
      createdBy: req.session.user.empId,
      createdByName: req.session.user.name
    };

    list.unshift(item);
    writeJSON(knowledgePath, list);

    // Record initial version for this knowledge item
    try {
      const versions = readJSON(knowledgeVersionsPath, {});
      versions[item.id] = versions[item.id] || [];
      versions[item.id].unshift({
        versionId: Date.now().toString(),
        createdAt: item.createdAt,
        createdBy: item.createdBy,
        createdByName: item.createdByName,
        title: item.title,
        details: item.details,
        attachment: item.attachment || null,
        notes: item.details
      });
      writeJSON(knowledgeVersionsPath, versions);
    } catch (err) {
      console.log('❌ Failed to record KB version:', err.message);
    }

    logActivity({
      type: "KNOWLEDGE_ADD",
      empId: req.session.user.empId,
      name: req.session.user.name,
      file: item.title
    });

    return res.json({ message: "Knowledge update saved", item });
  });
});

// ✅ Get knowledge updates (team filter + viewerAll/admin see all)
app.get("/api/knowledge", authMiddleware, (req, res) => {
  const list = readJSON(knowledgePath, []);
  const role = req.session.user.role;
  const team = req.session.user.team;

  const canViewAll = role === "admin" || role === "viewerAll";
  const filtered = canViewAll ? list : list.filter((x) => x.team === team);

  return res.json(filtered);
});

// ✅ Get version history for a knowledge item (if available)
app.get('/api/knowledge/:id/versions', authMiddleware, (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: 'ID required' });

  try {
    const versions = readJSON(knowledgeVersionsPath, {});
    const list = versions[id] || [];
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Error reading versions' });
  }
});

// ✅ Admin delete knowledge update
app.delete("/api/admin/knowledge/:id", authMiddleware, adminOnly, (req, res) => {
  const id = req.params.id;
  const list = readJSON(knowledgePath, []);

  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ message: "Update not found" });

  const removed = list.splice(idx, 1)[0];
  writeJSON(knowledgePath, list);

  logActivity({
    type: "KNOWLEDGE_DELETE",
    empId: req.session.user.empId,
    name: req.session.user.name,
    file: removed.title
  });

  return res.json({ message: "Knowledge update deleted", removed });
});

// ================================
// ✅ ADMIN: Delete -> Move to Trash (7 days restore)
// ================================
app.delete("/api/admin/delete/:filePath(*)", authMiddleware, adminOnly, (req, res) => {
  const filePath = req.params.filePath;
  const src = path.join(__dirname, "../docs", filePath);

  if (!fs.existsSync(src)) return res.status(404).json({ message: "File not found" });

  const base = path.basename(filePath);
  const dest = path.join(trashDir, base);

  fs.renameSync(src, dest);

  const meta = readJSON(metadataPath, {});
  meta[`trash/${base}`] = meta[filePath] || { category: "General", tags: [], team: "ALL" };
  delete meta[filePath];
  writeJSON(metadataPath, meta);

  logActivity({
    type: "DELETE_TO_TRASH",
    empId: req.session.user.empId,
    name: req.session.user.name,
    file: filePath
  });

  return res.json({ message: "Moved to trash", trashed: `trash/${base}` });
});

app.get("/api/admin/trash", authMiddleware, adminOnly, (req, res) => {
  const files = fs.existsSync(trashDir) ? fs.readdirSync(trashDir) : [];
  return res.json(files.map((f) => `trash/${f}`));
});

app.post("/api/admin/restore", authMiddleware, adminOnly, (req, res) => {
  const { file } = req.body;
  if (!file || !file.startsWith("trash/")) {
    return res.status(400).json({ message: "Invalid file path" });
  }

  const base = path.basename(file);
  const src = path.join(trashDir, base);
  const dest = path.join(uploadDir, base);

  if (!fs.existsSync(src)) return res.status(404).json({ message: "Trash file not found" });
  if (fs.existsSync(dest)) return res.status(400).json({ message: "File already exists in uploads" });

  fs.renameSync(src, dest);

  const meta = readJSON(metadataPath, {});
  meta[`uploads/${base}`] = meta[file] || { category: "General", tags: [], team: "ALL" };
  delete meta[file];
  writeJSON(metadataPath, meta);

  logActivity({
    type: "RESTORE",
    empId: req.session.user.empId,
    name: req.session.user.name,
    file: base
  });

  return res.json({ message: "Restored successfully", file: `uploads/${base}` });
});

// ✅ Auto cleanup trash (older than 7 days) on server start
(function cleanupTrash() {
  try {
    if (!fs.existsSync(trashDir)) return;
    const files = fs.readdirSync(trashDir);

    files.forEach((f) => {
      const full = path.join(trashDir, f);
      const stats = fs.statSync(full);
      const ageDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
      if (ageDays > 7) fs.unlinkSync(full);
    });
  } catch (err) {
    console.log("❌ Trash cleanup error:", err.message);
  }
})();

// ================================
// ✅ Metadata Update (admin)
// ================================
app.post("/api/admin/metadata", authMiddleware, adminOnly, (req, res) => {
  const { file, category, tags } = req.body;

  if (!file) return res.status(400).json({ message: "File required" });

  const meta = readJSON(metadataPath, {});
  meta[file] = meta[file] || { category: "General", tags: [], team: "ALL" };

  if (category) meta[file].category = category;
  if (Array.isArray(tags)) meta[file].tags = tags;

  writeJSON(metadataPath, meta);

  return res.json({ message: "Metadata updated" });
});

// ================================
// ✅ Bulk Delete Files (admin)
// ================================
app.post("/api/admin/bulk-delete-files", authMiddleware, adminOnly, (req, res) => {
  const { files } = req.body;
  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ message: "No files specified" });
  }

  const results = { deleted: [], failed: [] };
  
  files.forEach((filePath) => {
    try {
      const src = path.join(__dirname, "../docs", filePath);
      if (!fs.existsSync(src)) {
        results.failed.push({ file: filePath, reason: "Not found" });
        return;
      }

      const base = path.basename(filePath);
      const dest = path.join(trashDir, base);
      fs.renameSync(src, dest);

      const meta = readJSON(metadataPath, {});
      meta[`trash/${base}`] = meta[filePath] || { category: "General", tags: [], team: "ALL" };
      delete meta[filePath];
      writeJSON(metadataPath, meta);

      logActivity({
        type: "DELETE_TO_TRASH",
        empId: req.session.user.empId,
        name: req.session.user.name,
        file: filePath
      });

      results.deleted.push(filePath);
    } catch (err) {
      results.failed.push({ file: filePath, reason: err.message });
    }
  });

  return res.json({ message: "Bulk delete completed", results });
});

// ================================
// ✅ Bulk Delete Knowledge Items (admin)
// ================================
app.post("/api/admin/bulk-delete-knowledge", authMiddleware, adminOnly, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No IDs specified" });
  }

  const results = { deleted: [], failed: [] };
  const list = readJSON(knowledgePath, []);

  ids.forEach((id) => {
    try {
      const idx = list.findIndex((x) => x.id === id);
      if (idx === -1) {
        results.failed.push({ id, reason: "Not found" });
        return;
      }

      const removed = list.splice(idx, 1)[0];
      logActivity({
        type: "KNOWLEDGE_DELETE",
        empId: req.session.user.empId,
        name: req.session.user.name,
        file: removed.title
      });

      results.deleted.push(id);
    } catch (err) {
      results.failed.push({ id, reason: err.message });
    }
  });

  writeJSON(knowledgePath, list);
  return res.json({ message: "Bulk delete completed", results });
});

// ================================
// ✅ Announcements (TEAM FILTERING)
// ================================
app.get("/api/announcements", authMiddleware, (req, res) => {
  const list = readJSON(announcementsPath, []);
  const role = req.session.user.role;
  const team = req.session.user.team;

  const canViewAll = role === "admin" || role === "viewerAll";

  const filtered = list.filter((a) => {
    if (canViewAll) return true;
    if (!a.team || a.team === "ALL") return true;
    return a.team === team;
  });

  return res.json(filtered);
});

app.post("/api/admin/announcements", authMiddleware, adminOnly, (req, res) => {
  let { title, message, team } = req.body;

  title = String(title || "").trim();
  message = String(message || "").trim();

  if (!title || !message) return res.status(400).json({ message: "Title and message required" });

  // sanitize
  title = sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} });
  message = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });

  const teamValue = team && team !== "" ? team : "ALL";
  if (teamValue !== "ALL" && !ALLOWED_TEAMS.includes(teamValue)) {
    return res.status(400).json({ message: "Invalid team value" });
  }

  const list = readJSON(announcementsPath, []);
  list.unshift({
    title,
    message,
    team: teamValue,
    createdAt: new Date().toISOString(),
    createdBy: req.session.user.empId
  });
  writeJSON(announcementsPath, list);

  return res.json({ message: "Announcement added" });
});

// ================================
// ✅ CONTACT API
// ================================
app.post("/api/contact", authMiddleware, (req, res) => {
  let { name, email, message } = req.body;
  name = sanitizeHtml(String(name || "").trim(), { allowedTags: [], allowedAttributes: {} });
  email = String(email || "").trim();
  message = sanitizeHtml(String(message || "").trim(), { allowedTags: [], allowedAttributes: {} });

  // Minimal validation
  if (!name || !email || !message) return res.status(400).json({ message: "All fields required" });

  // Log only metadata
  console.log("✅ Contact Form Received:", { name, email });

  res.status(200).json({ status: "Message received successfully" });
});

// ================================
// ✅ ADMIN ANALYTICS APIs
// ================================
app.get("/api/admin/activity", authMiddleware, adminOnly, (req, res) => {
  const logs = readJSON(activityLogPath, []);
  return res.json(logs);
});

app.get("/api/admin/stats", authMiddleware, adminOnly, (req, res) => {
  const logs = readJSON(activityLogPath, []);
  const today = todayStr();

  const todayLogins = logs.filter((l) => l.type === "LOGIN" && l.time.startsWith(today)).length;
  const todayUploads = logs.filter((l) => l.type === "UPLOAD" && l.time.startsWith(today)).length;
  const todayDownloads = logs.filter((l) => l.type === "DOWNLOAD" && l.time.startsWith(today)).length;

  return res.json({
    today,
    todayLogins,
    todayUploads,
    todayDownloads,
    totalLogs: logs.length
  });
});

app.get("/api/admin/export", authMiddleware, adminOnly, (req, res) => {
  const logs = readJSON(activityLogPath, []);

  const fields = ["time", "type", "empId", "name", "file"];
  const parser = new Parser({ fields });
  const csv = parser.parse(logs);

  res.header("Content-Type", "text/csv");
  res.attachment("activity_logs.csv");
  return res.send(csv);
});

// ================================
// ✅ PRODUCTION HTTPS SUPPORT
// ================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const useHttps = process.env.NODE_ENV === 'production' && process.env.HTTPS_ENABLED === 'true';

if (useHttps && process.env.HTTPS_KEY && process.env.HTTPS_CERT) {
  try {
    const sslOptions = {
      key: fs.readFileSync(process.env.HTTPS_KEY),
      cert: fs.readFileSync(process.env.HTTPS_CERT)
    };
    https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`✅ Portal running at: https://localhost:${PORT}`);
      console.log(`🔒 HTTPS enabled (production mode)`);
    });
  } catch (err) {
    console.error('❌ HTTPS setup failed:', err.message);
    console.log('Falling back to HTTP...');
    http.createServer(app).listen(PORT, () => {
      console.log(`✅ Portal running at: http://localhost:${PORT}`);
    });
  }
} else {
  http.createServer(app).listen(PORT, () => {
    console.log(`✅ Portal running at: http://localhost:${PORT}`);
    if (process.env.NODE_ENV === 'production') {
      console.log(`⚠️  WARNING: Running in production without HTTPS!`);
      console.log(`   To enable HTTPS: Set HTTPS_ENABLED=true and provide HTTPS_KEY + HTTPS_CERT in .env`);
    }
  });
}

