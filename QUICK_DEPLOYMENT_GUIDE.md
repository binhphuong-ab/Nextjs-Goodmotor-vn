# 🚀 Quick Deployment Guide

## **Most Common Workflow (90% of the time)**

```bash
# 1. Check if your code is ready
./dev-check.sh

# 2. Deploy safely to VPS
./deploy-safe.sh
```

That's it! The scripts handle everything automatically.

---

## **Emergency Rollback**

If something goes wrong:

```bash
# Rollback to previous working version
./rollback.sh
```

---

## **Manual Commands (if scripts fail)**

### Local Development
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Test build locally
git add . && git commit -m "Your message"
git push origin main
```

### VPS Deployment
```bash
ssh root@103.72.96.189 -p 24700
cd /var/www/good-motor-website
pm2 stop good-motor
git pull origin main
npm ci --production
npm run build
pm2 start good-motor
```

---

## **Common Error Solutions**

### ❌ TypeScript Errors
```bash
npm run build        # See errors
# Fix the errors in your code
# Test again locally before deploying
```

### ❌ Dependency Issues
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ❌ VPS Connection Issues
```bash
# Test SSH connection
ssh root@103.72.96.189 -p 24700 "echo 'Connected successfully'"
```

### ❌ Database Issues
```bash
# Check if MongoDB is running on VPS
ssh root@103.72.96.189 -p 24700 "systemctl status mongod"
```

---

## **What Each Script Does**

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `./dev-check.sh` | Validates code before deployment | Before every deployment |
| `./deploy-safe.sh` | Safe deployment with backups | For all deployments |
| `./rollback.sh` | Restore previous version | When deployment fails |

---

## **File Locations**

- **Local Project**: `/Users/nguyenbinhphuong/Library/CloudStorage/Dropbox/Cursor Code/NextJS`
- **VPS Project**: `/var/www/good-motor-website`
- **VPS Backups**: `/var/www/good-motor-website-backup-*`
- **GitHub**: `https://github.com/binhphuong-ab/Nextjs-Goodmotor-vn`

---

## **Key Points to Remember**

1. ✅ **Always test locally first** (`npm run dev`, `npm run build`)
2. ✅ **Use the scripts** (they prevent 90% of errors)
3. ✅ **Commit to GitHub first** (backup your code)
4. ✅ **Check the website** after deployment
5. ✅ **Keep backups** (scripts do this automatically)

---

## **Quick Health Check**

After deployment, verify:
- 🌐 Website: http://goodmotor.vn
- 🔧 Admin: http://goodmotor.vn/admin
- 📊 Products: http://goodmotor.vn/api/products
- 📋 Projects: http://goodmotor.vn/api/projects 