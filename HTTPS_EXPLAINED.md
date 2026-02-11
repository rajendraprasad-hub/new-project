# 🔒 HTTPS Explained for Infosys Portal

## What is HTTPS?

**HTTPS** = HTTP**S** (Hypertext Transfer Protocol **Secure**)

- **Without HTTPS (HTTP):** Data travels in PLAIN TEXT between your browser and server
- **With HTTPS:** Data is ENCRYPTED using SSL/TLS certificates

### Example:
```
❌ HTTP (Insecure):
   User password: "MyPassword123" → Travels as plain text → Anyone on network can steal it

✅ HTTPS (Secure):
   User password: "MyPassword123" → Encrypted → Only server can decrypt
```

---

## Why HTTPS Matters for Infosys Portal

Your portal handles:
- 🔑 **Login credentials** (Employee ID + Password)
- 📄 **Sensitive documents** (project files, policies)
- 👤 **User data** (names, email, team information)
- 💾 **File uploads** (confidential business documents)

Without HTTPS, anyone on the network (WiFi hacker, ISP, network admin) can intercept and read this data!

---

## How HTTPS Works

### 1. **Certificate** (Proof of Identity)
- Server has a certificate proving it's legitimate
- Like a passport for websites
- Issued by trusted Certificate Authorities (Let's Encrypt, DigiCert, etc.)

### 2. **Encryption** (Scrambling Data)
- Browser receives public key from server
- All data sent is encrypted with this key
- Only server (with private key) can decrypt

### 3. **Connection Flow**
```
User Browser                    Server
    |                             |
    |---- "Hello, who are you?" ---|
    |                             |
    |<--- "Here's my certificate" |
    |                             |
    |---- Data (encrypted) -------|
    |                             |
    |<---- Data (encrypted) ------|
```

---

## Getting HTTPS Certificate for Your Portal

### **Option 1: Let's Encrypt (RECOMMENDED ✅)**

**What:** Free, automated SSL certificates
**Cost:** $0
**Duration:** 90 days (auto-renew)
**Best for:** Production servers

**Steps:**
```bash
# 1. Install Certbot (certificate management tool)
# macOS:
brew install certbot

# Ubuntu/Debian:
sudo apt-get install certbot

# CentOS/RHEL:
sudo yum install certbot

# 2. Generate certificate for your domain
sudo certbot certonly --standalone -d yourdomain.com

# This creates:
# /etc/letsencrypt/live/yourdomain.com/privkey.pem  (private key - keep secret!)
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem (certificate)

# 3. Update .env file:
HTTPS_ENABLED=true
HTTPS_KEY=/etc/letsencrypt/live/yourdomain.com/privkey.pem
HTTPS_CERT=/etc/letsencrypt/live/yourdomain.com/fullchain.pem

# 4. Auto-renewal (certificates expire in 90 days)
# Add to crontab to renew monthly:
0 0 1 * * sudo certbot renew --quiet

# Restart app after renewal
sudo certbot renew --quiet && pm2 restart infosys-portal
```

---

### **Option 2: Self-Signed Certificate (For Testing Only ⚠️)**

**What:** You create your own certificate
**Cost:** $0
**Duration:** Custom (365 days recommended)
**Best for:** Development/testing only

**Why not for production:**
- Browser shows warning ⚠️ "This connection is not private"
- Users will be scared
- Not trusted by browser

**Steps:**
```bash
# 1. Create certificates folder
mkdir -p certs

# 2. Generate self-signed certificate
openssl req -x509 -newkey rsa:2048 \
  -keyout certs/private-key.pem \
  -out certs/certificate.crt \
  -days 365 -nodes \
  -subj "/CN=localhost"

# 3. Update .env:
HTTPS_ENABLED=true
HTTPS_KEY=/full/path/to/certs/private-key.pem
HTTPS_CERT=/full/path/to/certs/certificate.crt

# 4. Start server
npm start

# Access as: https://localhost:3000
# Browser will warn: "Your connection is not private" - This is normal for self-signed certs
```

---

### **Option 3: Cloud Provider Certificates**

If you're hosting on cloud platforms:

**AWS:**
- Use **AWS Certificate Manager** (free)
- Auto-renews, integrated with ELB/ALB
- No manual setup needed

**Google Cloud:**
- Use **Google Managed Certificates**
- Auto-renewal
- Works with Cloud Load Balancer

**Azure:**
- Use **App Service Managed Certificate**
- Automatic renewal
- For App Service domains

**DigitalOcean/Linode:**
- Use **Let's Encrypt** (Certbot)
- Same as Option 1 above

---

## Understanding Certificate Files

### **Private Key** (`privkey.pem`)
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7...
...sensitive data...
-----END PRIVATE KEY-----
```
- **KEEP SECRET!** Don't share or commit to git
- Only server needs this
- Used to decrypt incoming data

### **Certificate** (`fullchain.pem` or `certificate.crt`)
```
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAMfI...
...certificate data...
-----END CERTIFICATE-----
```
- **Safe to share** (public information)
- Proves identity of server
- Browser verifies with Certificate Authority

---

## Enabling HTTPS in Infosys Portal

### **Simple Setup (Your Portal)**

```bash
# 1. Get certificate (Let's Encrypt recommended)
sudo certbot certonly --standalone -d yourdomain.com

# 2. Update .env
cat >> .env << EOF
HTTPS_ENABLED=true
HTTPS_KEY=/etc/letsencrypt/live/yourdomain.com/privkey.pem
HTTPS_CERT=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
EOF

# 3. Start server
npm start

# Server will now:
# ✅ Listen on HTTPS (port 443 or 3000 depending on config)
# ✅ Encrypt all data
# ✅ Show green lock 🔒 in browser
```

---

## Checking HTTPS Status

### **From Browser:**
1. Visit your portal: `https://yourdomain.com`
2. Click the lock icon 🔒 in address bar
3. See certificate details

### **From Command Line:**
```bash
# Check certificate expiration
openssl s_client -connect yourdomain.com:443 2>/dev/null | grep -A 5 "Issuer\|Subject\|Not"

# Check certificate file (if you have the file)
openssl x509 -enddate -noout -in /path/to/certificate.crt
# Output: notAfter=Feb  5 12:00:00 2027 GMT
```

---

## Common HTTPS Issues

### ❌ "Certificate not found"
**Solution:**
```bash
# Verify file paths in .env are correct
ls -la /etc/letsencrypt/live/yourdomain.com/

# Check .env has correct paths
grep HTTPS .env
```

### ❌ "Connection refused"
**Solution:**
```bash
# Make sure app is running on HTTPS port
npm start

# Check if port is available
lsof -i :3000

# Try different port in .env
PORT=3001
```

### ❌ "Certificate expired"
**Solution:**
```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Restart app
pm2 restart infosys-portal
```

### ❌ Browser shows warning "Not Private"
This happens with self-signed certificates. Options:
- Use Let's Encrypt (recommended for production)
- Accept warning in browser (dev/testing only)
- Add certificate to browser's trusted store (advanced)

---

## Security Best Practices

✅ **DO:**
- Use Let's Encrypt for production
- Auto-renew certificates before expiration
- Keep private key secure (never share)
- Use strong SESSION_SECRET in .env
- Enable firewall (only allow 80, 443)
- Monitor certificate expiration
- Redirect HTTP → HTTPS

❌ **DON'T:**
- Use self-signed certificates in production
- Commit `.env` or private keys to git
- Share certificate files
- Use expired certificates
- Run without HTTPS in production
- Store sensitive data in logs

---

## Verification Checklist

After setting up HTTPS:

- [ ] Certificate is valid (not expired)
- [ ] Private key is secure (file permissions 600)
- [ ] .env has correct paths
- [ ] Server starts without errors
- [ ] Browser shows green lock 🔒
- [ ] Data is encrypted (check Network tab in DevTools)
- [ ] Redirect HTTP → HTTPS works
- [ ] Certificate auto-renews (for Let's Encrypt)

---

## Need Help?

Check certificate status:
```bash
# For Let's Encrypt
sudo certbot certificates

# Test connectivity
curl -v https://yourdomain.com

# Check logs
pm2 logs infosys-portal
```

Your portal is now secure! 🔒
