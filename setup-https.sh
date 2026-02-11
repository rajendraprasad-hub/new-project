#!/bin/bash
# Infosys Portal - HTTPS Certificate Setup Script
# This script helps you set up HTTPS certificates for production deployment

echo "================================"
echo "🔒 Infosys Portal - HTTPS Setup"
echo "================================"
echo ""

# Option 1: Using Let's Encrypt (Recommended for production)
echo "Choose a certificate option:"
echo "1) Let's Encrypt (FREE - Recommended for production)"
echo "2) Self-Signed Certificate (For testing only)"
echo "3) Skip (Use HTTP - NOT RECOMMENDED for production)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo ""
    echo "🌐 Let's Encrypt Setup"
    echo "You'll need to install Certbot first:"
    echo "  macOS: brew install certbot"
    echo "  Ubuntu: sudo apt-get install certbot"
    echo "  CentOS: sudo yum install certbot"
    echo ""
    read -p "Have you installed Certbot? (y/n): " certbot_installed
    
    if [ "$certbot_installed" = "y" ] || [ "$certbot_installed" = "Y" ]; then
      read -p "Enter your domain (e.g., myportal.example.com): " domain
      
      echo ""
      echo "Running Certbot for domain: $domain"
      echo "This will generate certificates in /etc/letsencrypt/live/$domain/"
      echo ""
      echo "Run this command:"
      echo "  sudo certbot certonly --standalone -d $domain"
      echo ""
      echo "Then update .env with:"
      echo "  HTTPS_ENABLED=true"
      echo "  HTTPS_KEY=/etc/letsencrypt/live/$domain/privkey.pem"
      echo "  HTTPS_CERT=/etc/letsencrypt/live/$domain/fullchain.pem"
      echo ""
    fi
    ;;
    
  2)
    echo ""
    echo "🔑 Self-Signed Certificate Setup (For Testing Only)"
    echo "Generating a self-signed certificate valid for 365 days..."
    echo ""
    
    mkdir -p ./certs
    openssl req -x509 -newkey rsa:2048 -keyout ./certs/private-key.pem -out ./certs/certificate.crt -days 365 -nodes -subj "/CN=localhost"
    
    echo "✅ Certificate generated:"
    echo "   Key:  ./certs/private-key.pem"
    echo "   Cert: ./certs/certificate.crt"
    echo ""
    echo "Update .env with:"
    echo "  HTTPS_ENABLED=true"
    echo "  HTTPS_KEY=$(pwd)/certs/private-key.pem"
    echo "  HTTPS_CERT=$(pwd)/certs/certificate.crt"
    echo ""
    echo "⚠️  WARNING: Self-signed certificates will trigger browser warnings."
    echo "   Use only for testing/development!"
    ;;
    
  3)
    echo ""
    echo "⚠️  Running without HTTPS in production is NOT RECOMMENDED!"
    echo "Your data will be transmitted in plain text."
    echo "Continue at your own risk."
    ;;
    
  *)
    echo "Invalid choice."
    ;;
esac

echo ""
echo "================================"
echo "✅ Setup guide complete!"
echo "================================"
