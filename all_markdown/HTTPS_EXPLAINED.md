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
