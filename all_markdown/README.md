# ✅ Infosys Internal Web Portal
**Secure Internal Portal with Authentication, Teams, RBAC, Resources Upload, Knowledge Base Updates + Attachments, Announcements, Reports & Tracking**

🚀 **Production-Ready** | 🔒 **Security Hardened** | 📦 **Fully Configured**

---

## 🚀 Quick Start

### For Development
```bash
npm install
npm start
# Visit http://localhost:3000
```

### For Production
```bash
# 1. Install dependencies
npm install

# 2. Setup HTTPS certificate (required)
bash setup-https.sh
# Choose option 1 for Let's Encrypt (recommended)
# OR option 2 for self-signed (testing only)

# 3. Update .env with certificate paths
# HTTPS_KEY=/path/to/private-key.pem
# HTTPS_CERT=/path/to/certificate.crt
# HTTPS_ENABLED=true

# 4. Install process manager
npm install -g pm2

# 5. Start app
pm2 start ecosystem.config.js --env production
pm2 logs
```

**📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production setup**  
**📖 See [HTTPS_EXPLAINED.md](./HTTPS_EXPLAINED.md) for HTTPS certificate options**  
**📖 See [SECURITY.md](./SECURITY.md) for complete security hardening checklist**

---

## 🔐 Security Features (All Implemented ✅)

### Core Security
✅ **Helmet** - Security headers (HSTS, X-Frame-Options, X-Content-Type-Options)  
✅ **CSP (Content-Security-Policy)** - Prevents XSS via inline scripts  
✅ **CSRF Protection** - `csurf` middleware + token validation on all state-changing requests  
✅ **Rate Limiting** - 10 requests/15min on login, 50 requests/15min on admin endpoints  
✅ **Input Validation** - `express-validator` on all user inputs  
✅ **Input Sanitization** - `sanitize-html` prevents stored XSS attacks  

### Session & Authentication
✅ **Secure Sessions** - httpOnly, sameSite=Strict, secure cookies  
✅ **Bcrypt Hashing** - Passwords hashed with bcryptjs (never plain text)  
✅ **Account Lockout** - 5 failed login attempts = 15 min lockout  
✅ **Session Timeout** - Auto-logout on inactivity  

### File & Data Protection
✅ **File Type Validation** - Whitelist only: PDF, Excel, PPT, Images, Word  
✅ **File Size Limit** - Max 30MB per file  
✅ **File Type Validation** - MIME type checking  
✅ **Safe DOM Creation** - `createElement()` + `textContent` (no innerHTML)  
✅ **No Inline Handlers** - All event listeners moved to `script.js` (CSP compliant)  
✅ **No Sensitive Data in Logs** - Logging sanitized

### Network Security
✅ **HTTPS/TLS** - Full encryption support (self-signed or Let's Encrypt)  
✅ **Dual HTTP/HTTPS** - Falls back to HTTP if HTTPS not configured  
✅ **Health Check Endpoint** - `GET /api/health` for monitoring  

### Audit & Tracking
✅ **Activity Logging** - All actions tracked (login, upload, download, delete, restore)  
✅ **Admin Reports** - CSV export of audit logs  
✅ **Timestamp Tracking** - Every action recorded with timestamp  

---

## 📚 Documentation
- [🚀 Deployment Guide](./DEPLOYMENT.md) - Production setup, PM2, Nginx config
- [🔐 HTTPS Explained](./HTTPS_EXPLAINED.md) - 3 certificate setup options (Let's Encrypt, self-signed, cloud)
- [📋 Security Checklist](./SECURITY.md) - Complete security hardening + OWASP coverage
- [✅ Production Ready](./PRODUCTION_READY.md) - Final status confirmation
- [🚀 Quick Reference](./QUICK_REFERENCE.md) - 30-second summary + troubleshooting

---

## ✅ Teams (Team-Wise Filtering)
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

## 🔧 Latest Updates (February 2026)

### 1. Security Hardening Complete ✅
All inline `onclick` handlers removed and replaced with event listeners in `script.js`:

**Why?** Inline handlers violate CSP (Content-Security-Policy). All handlers now in centralized `script.js` for better security & auditability.

### 2. HTTPS Support Enabled ✅

### 3. All Features Verified Working ✅

### 4. Environment Configuration

### 5. Dependencies Added
```bash
npm install helmet csurf express-rate-limit express-validator sanitize-html cookie-parser dotenv
```

All 7 security packages installed and integrated.


## ✅ 4) Roles (RBAC - Role Based Access Control)

---
Updated: 2026-02-10 — see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
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
