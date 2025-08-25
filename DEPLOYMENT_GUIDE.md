# Good Motor Website - Deployment Guide

A simple guide to deploy the Next.js Good Motor website to a VPS server.

## 📋 Prerequisites

- VPS server (Ubuntu/Debian)
- Domain/IP address
- MongoDB Atlas connection string
- SSH access to server

## 🚀 Quick Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git, Nginx, PM2
sudo apt install -y git nginx
sudo npm install -g pm2
```

### 2. Clone & Setup Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/your-username/NextJS.git goodmotor
cd goodmotor

# Install dependencies
sudo npm install

# Create environment file
sudo nano .env.local
```

**Add to `.env.local`:**
```
MONGODB_URI=your_mongodb_atlas_connection_string
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://your_server_ip
```

### 3. Build Application

```bash
# Build Next.js app
sudo npm run build

# Set permissions
sudo chown -R www-data:www-data /var/www/goodmotor
```

### 4. PM2 Configuration

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'goodmotor',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/goodmotor',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      MONGODB_URI: 'your_mongodb_atlas_connection_string',
      NEXT_PUBLIC_APP_URL: 'http://your_server_ip'
    },
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### 5. Start Application

```bash
# Start with PM2
sudo pm2 start ecosystem.config.js

# Save PM2 configuration
sudo pm2 save
sudo pm2 startup

# Check status
sudo pm2 status
```

### 6. Nginx Configuration

Create `/etc/nginx/sites-available/goodmotor`:
```nginx
server {
    listen 80;
    server_name your_server_ip_or_domain;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Security headers
        add_header X-Frame-Options "DENY";
        add_header X-Content-Type-Options "nosniff";
        add_header X-XSS-Protection "1; mode=block";
    }

    # Optional: Serve static files directly
    location /_next/static {
        alias /var/www/goodmotor/.next/static;
        expires 30d;
        access_log off;
    }

    location /images {
        alias /var/www/goodmotor/public/images;
        expires 30d;
        access_log off;
    }
}
```

### 7. Enable Nginx Site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/goodmotor /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## ✅ Verification

1. **Check PM2**: `sudo pm2 status`
2. **Check Nginx**: `sudo systemctl status nginx`
3. **Test Website**: Visit `http://your_server_ip`
4. **Check API**: `curl http://your_server_ip/api/products`

## 🔄 Updates

To update the application:
```bash
cd /var/www/goodmotor
sudo git pull origin main
sudo npm install
sudo npm run build
sudo pm2 restart goodmotor
```

## 🛠️ Troubleshooting

- **PM2 Logs**: `sudo pm2 logs goodmotor`
- **Nginx Logs**: `sudo tail -f /var/log/nginx/error.log`
- **Check Ports**: `sudo netstat -tlnp | grep :3000`
- **MongoDB Connection**: Check `.env.local` and PM2 environment variables

## 📝 Notes

- Replace `your_mongodb_atlas_connection_string` with actual MongoDB URI
- Replace `your_server_ip_or_domain` with your actual server details
- Ensure firewall allows HTTP (port 80) and HTTPS (port 443) traffic
- For production, consider setting up SSL/HTTPS with Let's Encrypt

---
**Deployment completed successfully!** 🎉
