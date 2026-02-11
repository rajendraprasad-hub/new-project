````markdown
# Infosys Portal - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [x] Dependencies installed (`npm install`)
- [x] `.env` file created with production settings
- [x] `SESSION_SECRET` set to a strong random value (in `.env`)
- [x] `NODE_ENV=production` in `.env`
- [x] Test users created in `backend/users.json`
- [x] Security headers enabled (Helmet, CSP, CSRF protection)

### 🔐 HTTPS & Security
**HTTPS is REQUIRED in production for security!**

**What is HTTPS?**
- HTTPS = HTTP + TLS/SSL encryption
- Encrypts data between browser and server
- Prevents man-in-the-middle attacks
- Required for secure cookie transmission
- Modern browsers warn if HTTPS not used

**Get HTTPS Certificate:**

#### Option 1: Let's Encrypt (RECOMMENDED - Free)
```bash
# 1. Install Certbot
# macOS:
brew install certbot

# Ubuntu/Debian:
sudo apt-get install certbot

# 2. Generate certificate for your domain
sudo certbot certonly --standalone -d yourdomain.com

# 3. Update .env:
HTTPS_ENABLED=true
HTTPS_KEY=/etc/letsencrypt/live/yourdomain.com/privkey.pem
HTTPS_CERT=/etc/letsencrypt/live/yourdomain.com/fullchain.pem

# 4. Auto-renew (Let's Encrypt certs expire in 90 days):
sudo certbot renew --quiet  # Add to crontab for monthly renewal
```

#### Option 2: Self-Signed (For testing only)
```bash
# Run the setup script:
bash setup-https.sh

# Choose option 2 and follow the prompts
```

#### Option 3: Cloud Provider Certificates
If hosting on AWS/GCP/Azure, use their managed SSL/TLS services.

---

## 🚀 Deployment Steps

### 1. Deploy Files to Production Server
```bash
# Clone or upload project to your server
git clone <your-repo> /home/webportal
cd /home/webportal
```

### 2. Install Dependencies
```bash
npm install --production
```

### 3. Setup Environment
```bash
# Copy and customize .env
cp .env.example .env

# Edit .env with production values:
# - SESSION_SECRET: generate strong random secret
# - NODE_ENV: production
# - HTTPS_ENABLED: true (after getting certificate)
# - HTTPS_KEY: path to private key
# - HTTPS_CERT: path to certificate
```

### 4. Setup HTTPS Certificate
```bash
bash setup-https.sh
# Follow the prompts to setup Let's Encrypt or self-signed certs
```

### 5. Test Locally
```bash
npm start
# Visit http://localhost:3000
# Login with test user:
#   Employee ID: 1001
#   Password: (bcrypt hash - check backend/users.json)
```

### 6. Setup Process Manager (Recommended)
Use PM2 to manage the Node.js process in production:

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem config file (ecosystem.config.js):
module.exports = {
  apps: [{
    name: 'infosys-portal',
    script: './backend/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
};

# Start the app with PM2
pm2 start ecosystem.config.js

# Make PM2 start on system reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs infosys-portal
```

### 7. Setup Nginx Reverse Proxy (Recommended)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Security in Production

### Security Features Already Enabled:
✅ Helmet (security headers)
✅ Content-Security-Policy (blocks inline scripts)
✅ CSRF protection (csurf middleware)
✅ Rate limiting (login, admin endpoints)
✅ Input validation & sanitization
✅ Session security (httpOnly, sameSite, secure cookies)
✅ Bcrypt password hashing
✅ File type validation on uploads
✅ Account lockout after 5 failed logins

### Additional Recommendations:
- [ ] Setup firewall rules (allow 80, 443; restrict admin IPs if possible)
- [ ] Enable automated backups of `backend/*.json` files
- [ ] Monitor disk space (file uploads)
- [ ] Rotate logs regularly
- [ ] Setup monitoring/alerting for errors
- [ ] Run security scans: `npm audit`
- [ ] Keep Node.js updated: `nvm install --latest-lts`

---

## 📊 Monitoring & Logs

### Health Check Endpoint
```bash
curl https://yourdomain.com/api/health
# Response: { "status": "OK", "timestamp": "2026-02-05T..." }
```

### View Logs (with PM2)
```bash
pm2 logs infosys-portal
pm2 logs infosys-portal --lines 100  # Last 100 lines
```

### Performance Monitoring
```bash
pm2 monit  # Real-time CPU, memory usage
pm2 show infosys-portal  # Detailed process info
```

---

## 🔄 Maintenance

### Regular Tasks:
1. **SSL Certificate Renewal** (Let's Encrypt - 90 days)
   ```bash
   sudo certbot renew --quiet
   ```

2. **Update Dependencies** (quarterly)
   ```bash
   npm audit
   npm update
   ```

3. **Backup Data**
   ```bash
   tar -czf backup-$(date +%Y%m%d).tar.gz backend/
   ```

4. **Monitor Disk Space**
   ```bash
   df -h  # Check available space
   du -sh docs/uploads  # Check upload folder size
   ```

---

## 🆘 Troubleshooting

### Cannot connect to HTTPS
- Check if certificate files exist at paths in `.env`
- Verify certificate is not expired: `openssl x509 -enddate -noout -in /path/to/cert.crt`
- Check firewall allows port 443

### High Memory Usage
- Restart app: `pm2 restart infosys-portal`
- Increase max memory: Set `max_memory_restart` in PM2 config

### "Cannot find module" Errors
- Run `npm install` again
- Check Node.js version: `node --version` (should be 14+)

### Port Already in Use
- Change PORT in `.env`: `PORT=3001`
- Or kill process: `lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9`

---

## 📞 Support
For issues, check:
1. Application logs: `pm2 logs`
2. Error logs: `backend/activityLogs.json`
3. Node.js console for stack traces

---

**Your portal is ready for production! 🚀**

---

**Troubleshooting & More:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for quick fixes and next-step examples.

***
````