# Good Motor Website - VPS Deployment Guide

## 🎯 Overview
This guide will help you deploy your Good Motor website to your VPS server:
- **IP Address**: 103.72.96.189
- **SSH Port**: 24700
- **OS**: Debian 12
- **Resources**: 1 Core, 2GB RAM, 20GB SSD

## 📋 Prerequisites
- SSH access to your VPS
- Your VPS credentials (username: root)
- Terminal/Command Prompt on your local machine

## 🚀 Step-by-Step Deployment

### Step 1: Connect to Your VPS
```bash
# Connect via SSH (use your actual password when prompted)
ssh -p 24700 root@103.72.96.189
```

### Step 2: Initial Server Setup
```bash
# Upload and run the server setup script
# First, make the script executable
chmod +x server-setup.sh

# Run the server setup script
./server-setup.sh
```

This script will install:
- Node.js 18 (LTS)
- MongoDB 7.0
- PM2 (Process Manager)
- Nginx (Web Server)
- UFW Firewall

### Step 3: Upload Your Application Files

#### Option A: Using SCP (Recommended)
From your local machine:
```bash
# Navigate to your project directory
cd /Users/nguyenbinhphuong/Library/CloudStorage/Dropbox/Cursor%20Code/NextJS

# Create a tar file excluding unnecessary files
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf good-motor-website.tar.gz .

# Upload to VPS
scp -P 24700 good-motor-website.tar.gz root@103.72.96.189:/var/www/good-motor/

# Connect to VPS and extract
ssh -p 24700 root@103.72.96.189
cd /var/www/good-motor
tar -xzf good-motor-website.tar.gz
rm good-motor-website.tar.gz
```

#### Option B: Using Git (Alternative)
```bash
# On your VPS
cd /var/www/good-motor
git clone <your-git-repository-url> .
```

### Step 4: Deploy the Application
```bash
# Make deployment script executable
chmod +x deploy/app-deploy.sh

# Run the deployment script
./deploy/app-deploy.sh
```

### Step 5: Setup Database
```bash
# Make database setup script executable
chmod +x deploy/database-setup.sh

# Run the database setup script
./deploy/database-setup.sh
```

### Step 6: Configure Nginx
```bash
# Copy Nginx configuration
sudo cp deploy/nginx-config /etc/nginx/sites-available/good-motor

# Enable the site
sudo ln -s /etc/nginx/sites-available/good-motor /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 7: Verify Deployment
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs good-motor-website

# Check Nginx status
sudo systemctl status nginx

# Check MongoDB status
sudo systemctl status mongod
```

## 🌐 Access Your Website
Once deployment is complete, your website will be accessible at:
- **HTTP**: http://103.72.96.189

## 🔧 Useful Commands

### Application Management
```bash
# Restart the application
pm2 restart good-motor-website

# View application logs
pm2 logs good-motor-website

# Monitor application
pm2 monit
```

### Nginx Management
```bash
# Restart Nginx
sudo systemctl restart nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### MongoDB Management
```bash
# Connect to MongoDB
mongosh goodmotor

# Check database
mongosh goodmotor --eval "db.products.find().pretty()"

# Restart MongoDB
sudo systemctl restart mongod
```

## 🛡️ Security Considerations

### Firewall Status
```bash
# Check firewall status
sudo ufw status

# The setup script configures:
# - SSH (port 24700): ALLOWED
# - HTTP (port 80): ALLOWED  
# - HTTPS (port 443): ALLOWED
```

### SSL Certificate (Optional - Future Enhancement)
For production, consider adding SSL certificate using Let's Encrypt:
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com
```

## 🚨 Troubleshooting

### If Application Won't Start
```bash
# Check PM2 logs
pm2 logs good-motor-website

# Check if port 3000 is in use
sudo netstat -tlnp | grep :3000

# Restart the application
pm2 restart good-motor-website
```

### If Website Not Accessible
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# Check firewall
sudo ufw status
```

### If Database Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo journalctl -u mongod

# Restart MongoDB
sudo systemctl restart mongod
```

## 📊 Performance Monitoring

### System Resources
```bash
# Check memory usage
free -h

# Check disk usage
df -h

# Check CPU usage
htop
```

### Application Performance
```bash
# PM2 monitoring
pm2 monit

# View detailed stats
pm2 show good-motor-website
```

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes (if using Git)
cd /var/www/good-motor
git pull origin main

# Reinstall dependencies
npm install --production

# Rebuild application
npm run build

# Restart application
pm2 restart good-motor-website
```

### Regular Maintenance
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# PM2 update
npm install -g pm2@latest
pm2 update
```

## 📞 Support
If you encounter any issues during deployment, check the troubleshooting section above or review the application logs for specific error messages. 