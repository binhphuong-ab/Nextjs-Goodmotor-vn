# Manual Deployment Guide - Good Motor Website

## 🎯 Quick Manual Deployment
Since automated scripts can sometimes have issues, here's a simple manual approach:

### Step 1: Upload Files to VPS
```bash
# 1. Create archive (run this in your project directory)
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf good-motor-website.tar.gz .

# 2. Upload to VPS (you'll be prompted for password: sxt_Jo1isqMOByQmF6?=)
scp -P 24700 good-motor-website.tar.gz root@103.72.96.189:/tmp/
```

### Step 2: Connect to VPS and Extract Files
```bash
# Connect to VPS (password: sxt_Jo1isqMOByQmF6?=)
ssh -p 24700 root@103.72.96.189

# Once connected to VPS, run these commands:
mkdir -p /var/www/good-motor
cd /var/www/good-motor
tar -xzf /tmp/good-motor-website.tar.gz
rm /tmp/good-motor-website.tar.gz
```

### Step 3: Run the Automated Deployment
```bash
# Still on the VPS, run:
chmod +x deploy/quick-deploy.sh
./deploy/quick-deploy.sh
```

## 🌐 Your Website Will Be Live At:
**http://103.72.96.189**

---

## 🔧 Alternative: Step-by-Step Manual Setup

If the quick deployment script has issues, you can run each step manually:

### 1. Server Setup
```bash
chmod +x deploy/server-setup.sh
./deploy/server-setup.sh
```

### 2. Database Setup
```bash
chmod +x deploy/database-setup.sh
./deploy/database-setup.sh
```

### 3. Application Deployment
```bash
chmod +x deploy/app-deploy.sh
./deploy/app-deploy.sh
```

### 4. Nginx Configuration
```bash
cp deploy/nginx-config /etc/nginx/sites-available/good-motor
ln -s /etc/nginx/sites-available/good-motor /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## 🎉 Verification Commands
```bash
# Check if everything is running
pm2 status
systemctl status nginx
systemctl status mongod

# View logs if needed
pm2 logs good-motor-website
```

## 🚨 If You Encounter Issues:

### MongoDB Won't Start
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Application Won't Start
```bash
cd /var/www/good-motor
npm install --production
npm run build
pm2 restart good-motor-website
```

### Nginx Issues
```bash
sudo nginx -t
sudo systemctl restart nginx
```

Your website should be accessible at **http://103.72.96.189** once deployment is complete! 