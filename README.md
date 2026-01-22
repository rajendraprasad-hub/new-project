# ✅ Infosys Internal KST Web Portal
**Secure Internal Portal with Authentication, Teams, RBAC, Resources Upload, Knowledge Base Updates + Attachments, Announcements, Reports & Tracking**

This portal is built to meet the **KST (Knowledge Support & Tracking)** requirement and is **not a duplicate of DCM**.

✅ **DCM Library** = Document storage only  
✅ **KST Portal** = Country/Carrier/Project/Process updates + searchable team-wise knowledge tracking + audit usage reporting

---

# ✅ Why this Portal? (Manager Criteria Match)
KST portal is required because there are chances we miss important updates when:
1) People leave the organization  
2) People change the team  
3) Updates are missed due to poor memory dependency  

✅ This portal provides a structured place to **type/copy-paste process updates** and search them anytime.

---

# ✅ Key Features Summary

## ✅ 1) Secure Login (Authentication)
- Login using **Employee ID + Password**
- Session-based authentication using `express-session`
- Logout supported
- All portal pages & APIs are protected using session middleware

✅ Security improvements:
- Wrong password lock:
  - After **5 wrong login attempts**, account is locked for **15 minutes**
  - Stored in: `backend/loginAttempts.json`

---

## ✅ 2) Password Management
- Passwords stored using **bcrypt hashing**
- Supports force password change:
  - `mustChangePassword: true` in `users.json`
- Change password screen:
  - `public/change-password.html`

✅ Password update will save hash inside:
- `backend/users.json`

---

## ✅ 3) Teams (Team-Wise Access)
Supported teams:
✅ MFPM  
✅ COE  
✅ CMO  
✅ CIV  
✅ GCM  

Team-wise filtering is applied in:
✅ Uploaded Resources  
✅ Knowledge Base updates  
✅ Announcements  

(Admin/viewerAll users can view everything.)

---

## ✅ 4) Roles (RBAC - Role Based Access Control)
Supported roles:

✅ **user**
- View/download team files
- View team knowledge updates

✅ **uploader**
- Upload files
- View/download team files
- View team knowledge updates

✅ **viewerAll**
- View/download all team files
- View all team knowledge updates

✅ **admin**
- Full access
- Upload + delete + restore
- All teams access
- Admin analytics & reports
- Post announcements

---

# ✅ Modules Implemented

---

## ✅ A) Home Page
File: `public/index.html`

✅ Shows:
- Latest **4 announcements**
- Latest **4 recent files**
- Quick access dashboard for users

---

## ✅ B) Resources Module (Documents Support)
File: `public/resources.html`

✅ Features:
✅ Search documents  
✅ Filter by type (PDF/Excel/PPT/Image)  
✅ View file in browser  
✅ Download file (tracked + logged)  
✅ Upload file (admin/uploader only)  
✅ Delete file (admin only)

✅ Upload rules:
- Upload folder: `docs/uploads/`
- Max file size: **30MB**
- Prevent duplicate file names
- Team auto-assigned based on logged-in user’s team

✅ View vs Download:
- **View** → opens `/docs/...` directly
- **Download** → goes through `/api/download/...` to track activity

---

## ✅ C) Safe Delete + Trash System (Admin Only)
Instead of permanent delete, files are moved to Trash for safety.

✅ Trash folder:
- `docs/trash/`

✅ Restore supported:
- Admin can restore deleted files

✅ Auto cleanup:
- Files older than **7 days** in Trash will be deleted automatically on server start

---

## ✅ D) Knowledge Base Module (Main KST Feature ✅)
File: `public/knowledge.html`

This is the key differentiator from DCM:
✅ KST is for **updates & process knowledge**, not documents only.

✅ Knowledge Update includes:
Required fields:
- Country *
- Carrier *
- Project *
- Process *
- Title *
- Details / Steps *

Optional future-ready fields:
- Priority (Low/Medium/High)
- Status (New/In Progress/Completed)
- Ticket ID (optional)
- Reference Link (optional)

✅ Team-wise visibility enabled:
- Normal users see only their team updates
- Admin/viewerAll see all updates

---

## ✅ Knowledge Attachments (NEW ✅)
Knowledge Base supports optional attachment upload.

✅ Attachment stored in:
- `docs/kb_uploads/`

✅ Attachment metadata saved in:
- `backend/knowledgeUpdates.json`

Example:
```json
"attachment": {
  "fileName": "1700000000000_file.pdf",
  "originalName": "file.pdf",
  "url": "/docs/kb_uploads/1700000000000_file.pdf"
}

✅ Knowledge list shows Attachment button when attachment exists.

⸻

✅ E) Announcements Module (Admin Controlled)

Announcements can be posted from Reports page (admin only).

✅ Admin can send announcement to:
	•	ALL teams
	•	Specific team (MFPM / COE / CMO / CIV / GCM)

✅ Home page shows latest 4 announcements.

Stored in:
	•	backend/announcements.json

⸻

✅ F) Reports Module (Admin Only)

File: public/reports.html

✅ Admin dashboard shows:
	•	Logins Today
	•	Uploads Today
	•	Downloads Today
	•	Total Logs

✅ Recent Activity Logs show:
	•	LOGIN
	•	UPLOAD
	•	DOWNLOAD
	•	PASSWORD_CHANGE
	•	DELETE_TO_TRASH
	•	RESTORE
	•	KNOWLEDGE_ADD
	•	KNOWLEDGE_DELETE

Stored in:
	•	backend/activityLogs.json

✅ Export logs to CSV:
	•	GET /api/admin/export
	•	Downloads: activity_logs.csv

⸻

✅ Activity Tracking (Audit Logs)

All actions are tracked in:
✅ backend/activityLogs.json

Tracked activities:
✅ LOGIN
✅ UPLOAD
✅ DOWNLOAD
✅ PASSWORD_CHANGE
✅ DELETE_TO_TRASH
✅ RESTORE
✅ KNOWLEDGE_ADD
✅ KNOWLEDGE_DELETE

This helps management verify portal usage and effectiveness.

⸻

✅ Architecture Overview

✅ High Level Architecture

User Browser (Frontend)
   |
   |  HTML + CSS + JS (public/)
   |
Node.js Express Backend (backend/server.js)
   |
   |-- users.json            (Login + roles + teams)
   |-- knowledgeUpdates.json (Knowledge base updates)
   |-- announcements.json    (Announcements)
   |-- activityLogs.json     (Audit logs)
   |-- fileMetadata.json     (File metadata + team tagging)
   |-- loginAttempts.json    (Lock system)
   |
Files Stored in docs/
   |-- uploads/     (resources uploads)
   |-- kb_uploads/  (knowledge attachments)
   |-- trash/       (deleted files stored for 7 days)


⸻

✅ DevOps & Automation Scope (Planned / Optional)

✅ This portal is designed to be deployable using DevOps pipeline later.

✅ Version Control
	•	GitHub repository (code backup + collaboration)

✅ CI/CD (Future Ready)

Option 1: Jenkins Pipeline
	•	Build
	•	Test
	•	Docker image build
	•	Push to registry
	•	Deploy to server/Kubernetes

Option 2: GitHub Actions
	•	Build on push
	•	Deploy to AWS server automatically

✅ Dockerization
	•	Containerize backend + frontend
	•	Run with Docker Compose

✅ Kubernetes (Future Scope)
	•	Deploy portal as pods
	•	Rolling updates
	•	Auto scaling
	•	High availability

✅ Monitoring
	•	Prometheus + Grafana for:
	•	pod health
	•	resource usage
	•	availability

⸻

✅ Full Project Folder Structure

infosys-portal/
│
├── backend/
│   ├── server.js                 # Main backend server (Express)
│   ├── auth.js                   # Middleware: protects APIs using session
│   ├── uploaderOnly.js           # Middleware: uploader/admin only
│   ├── adminOnly.js              # Middleware: admin only
│   ├── logger.js                 # Writes audit logs to activityLogs.json
│   │
│   ├── users.json                # Employee list (empId/name/role/team/password)
│   ├── activityLogs.json         # Portal audit log records
│   ├── announcements.json        # Admin announcements storage
│   ├── fileMetadata.json         # Files category/tags/team mapping
│   ├── loginAttempts.json        # Wrong password lock storage
│   └── knowledgeUpdates.json     # Knowledge updates storage
│
├── public/
│   ├── index.html                # Home page (Recent 4 files + Announcements)
│   ├── login.html                # Login page
│   ├── change-password.html      # Change password page
│   ├── resources.html            # Resources module
│   ├── knowledge.html            # Knowledge Base module
│   ├── reports.html              # Reports + Announcements admin posting
│   ├── contact.html              # Contact page
│   │
│   ├── auth-check.js             # Redirect protection script
│   ├── script.js                 # Frontend logic (all modules)
│   ├── style.css                 # Portal UI styles
│   └── assets/                   # Infosys logo + file type icons
│
├── docs/
│   ├── uploads/                  # Uploaded resource files
│   ├── kb_uploads/               # Knowledge base attachments
│   └── trash/                    # Deleted files moved here for 7 days
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md


⸻

✅ File Purpose (Quick Reference)

✅ Backend Files
	•	backend/server.js → Full API logic (auth, files, upload, knowledge, reports)
	•	backend/auth.js → Protect routes (session check)
	•	backend/uploaderOnly.js → Allow uploader/admin only
	•	backend/adminOnly.js → Allow admin only
	•	backend/logger.js → Write activity logs to activityLogs.json
	•	backend/users.json → Manage users, roles, teams
	•	backend/knowledgeUpdates.json → Knowledge base saved records
	•	backend/announcements.json → Admin announcements saved records
	•	backend/activityLogs.json → All portal activities audit log
	•	backend/loginAttempts.json → Wrong password lock system
	•	backend/fileMetadata.json → File team tagging + category data

✅ Frontend Files
	•	public/index.html → Home (recent files + announcements)
	•	public/resources.html → Resources listing + upload
	•	public/knowledge.html → Knowledge updates + attachment upload
	•	public/reports.html → Admin stats + logs + announcements post + export CSV
	•	public/login.html → Employee login page
	•	public/change-password.html → Force password change
	•	public/auth-check.js → Redirect non-logged users to login page
	•	public/script.js → Complete UI + API integration logic

⸻

✅ Setup & Run Instructions

✅ 1) Install dependencies

npm install

✅ 2) Start server

npm start

✅ Portal URL:
http://localhost:3000

⸻

✅ Users Configuration (backend/users.json)

Example format:

[
  {
    "empId": "1001",
    "name": "Rajendra",
    "password": "1234",
    "role": "admin",
    "team": "MFPM",
    "mustChangePassword": false
  },
  {
    "empId": "1002",
    "name": "Arun",
    "password": "abcd",
    "role": "user",
    "team": "COE",
    "mustChangePassword": true
  },
  {
    "empId": "1003",
    "name": "Kumar",
    "password": "1111",
    "role": "uploader",
    "team": "CMO",
    "mustChangePassword": false
  },
  {
    "empId": "1004",
    "name": "ViewerAllUser",
    "password": "1234",
    "role": "viewerAll",
    "team": "CIV",
    "mustChangePassword": false
  }
]

✅ To change team/role, just update users.json
No code change required.

⸻

✅ Notes

✅ View is not tracked
✅ Download is tracked
✅ Admin reports show portal usage proof
✅ Knowledge Base is the primary KST feature
✅ Resources module is secondary support feature

⸻

✅ Future Enhancements (Optional)
	•	Database integration (MongoDB/MySQL)
	•	Admin UI to manage users & reset password
	•	Edit Knowledge updates (update history/versioning)
	•	Delete KB attachment file when KB update is deleted
	•	AWS S3 storage (no dependency on laptop storage)
	•	Docker + Jenkins + Kubernetes production deployment
	•	Monitoring dashboards using Prometheus + Grafana

⸻

✅ Author: Rajendra Prasad
Infosys BPM – Internal KST Web Portal


