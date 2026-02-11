# Infosys Internal Web Portal – Manager Summary

## ✅ Project Overview
This is an **Infosys-style Internal Web Portal** built for secure internal usage to access team documents, announcements, and activity tracking.  
The portal follows **Agile + DevOps approach** and supports future CI/CD and Kubernetes integration.

---

## ✅ Main Capabilities
### 🔐 Secure Authentication
- Employee login using **Employee ID + Password**
- Session-based authentication
- Logout supported
- Force password change on first login (if enabled)

### 🧑‍🤝‍🧑 Team-wise Access (MFPM / COE / CMO / CIV / GCM)
- Team-specific document access
- Role-based permissions applied over teams

### ✅ Role-Based Access Control (RBAC)
- **user**: view/download own team files
- **uploader**: upload + view/download own team files
- **viewerAll**: view/download all teams files (manager access)
- **admin**: full access + reports + delete/trash + announcements

### 📤 File Upload (Controlled)
- Upload allowed only for uploader/admin roles
- Max upload size: **30MB**
- Duplicate file name prevention
- Files stored under: `docs/uploads/`

### 📥 Download Tracking
- All downloads are tracked (who downloaded which file + time)
- Activity stored in: `backend/activityLogs.json`

### 🗑️ Safe Delete (Admin Only)
- Admin delete moves files to **Trash**
- Trash retention: **7 days** (auto cleanup)
- Restore supported

### 📢 Announcements
- Admin can post announcements from Reports UI
- Supports:
  - Global announcements (ALL teams)
  - Team-specific announcements

### 📊 Admin Reports + CSV Export
- Daily stats: logins, uploads, downloads
- Activity audit table (LOGIN/UPLOAD/DOWNLOAD/etc.)
- Export full audit logs to CSV

---

## ✅ Technology Stack
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js, Express  
- **Security:** express-session, bcrypt  
- **Uploads:** Multer  
- **Reports Export:** json2csv  

---

## ✅ Summary Outcome
This portal provides a scalable internal foundation for:
✅ team-wise secure document sharing  
✅ controlled uploads  
✅ audit logging & usage tracking  
✅ admin governance & reporting  

Future scope includes CI/CD, Kubernetes deployment, monitoring, and cloud storage.


---

**Troubleshooting & More:** See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) for quick fixes and operational tips.

***