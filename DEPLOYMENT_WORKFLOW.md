# Good Motor - Safe Deployment Workflow

This guide ensures error-free deployments from local development to VPS production.

## 🔄 Development to Production Workflow

### 1. **Local Development Phase**

#### Before Making Changes:
```bash
# Always start with latest code
git pull origin main

# Create a new feature branch
git checkout -b feature/your-feature-name

# Install any new dependencies
npm install
```

#### During Development:
```bash
# Test locally first
npm run dev

# Check for TypeScript errors
npm run build

# Test the production build locally
npm start
```

### 2. **Pre-Deployment Checklist**

#### ✅ **Code Quality Checks**
```bash
# 1. TypeScript compilation check
npm run build

# 2. Check for unused dependencies
npm audit

# 3. Test all API endpoints locally
# Visit: http://localhost:3000/api/products
# Visit: http://localhost:3000/api/projects
# Visit: http://localhost:3000/admin
```

#### ✅ **Environment Variables Check**
- Ensure `.env.local` has all required variables
- Verify MongoDB connection strings
- Check all API keys and secrets

#### ✅ **Dependencies Check**
```bash
# Check if package.json and package-lock.json are in sync
npm ci

# Verify all dependencies are properly installed
npm list --depth=0
```

### 3. **Safe Git Workflow**

```bash
# 1. Add changes
git add .

# 2. Commit with descriptive message
git commit -m "feat: add new feature description

- Specific change 1
- Specific change 2
- Any breaking changes or new dependencies"

# 3. Push to GitHub first (backup)
git push origin feature/your-feature-name

# 4. Merge to main branch
git checkout main
git merge feature/your-feature-name
git push origin main
```

### 4. **VPS Deployment Process**

#### Option A: **Automated Deployment Script** (Recommended)
```bash
# Run the safe deployment script
./deploy-safe.sh
```

#### Option B: **Manual Deployment** (Step by Step)
```bash
# 1. Connect to VPS
ssh root@103.72.96.189 -p 24700

# 2. Navigate to project directory
cd /var/www/good-motor-website

# 3. Stop the application
pm2 stop good-motor

# 4. Backup current version
cp -r /var/www/good-motor-website /var/www/good-motor-website-backup-$(date +%Y%m%d-%H%M%S)

# 5. Pull latest changes
git pull origin main

# 6. Install/update dependencies
npm ci --production

# 7. Build the application
npm run build

# 8. Start the application
pm2 start good-motor
pm2 save

# 9. Check if it's running
pm2 status
curl http://localhost:3000/api/products
```

## 🛡️ Error Prevention Strategies

### **Common Errors and Solutions**

#### 1. **TypeScript Build Errors**
**Prevention:**
```bash
# Always check TypeScript before deployment
npm run build

# Fix type errors locally first
npm run type-check
```

#### 2. **Missing Dependencies**
**Prevention:**
```bash
# Use exact package versions
npm install package-name --save-exact

# Always commit package-lock.json
git add package-lock.json
```

#### 3. **Database Connection Issues**
**Prevention:**
- Test database connection locally first
- Verify environment variables on VPS
- Check MongoDB service status

#### 4. **API Route Errors**
**Prevention:**
```bash
# Test all API endpoints locally
curl http://localhost:3000/api/products
curl http://localhost:3000/api/projects
curl http://localhost:3000/api/admin/products
```

### **Rollback Strategy**

If deployment fails:
```bash
# 1. Stop current application
pm2 stop good-motor

# 2. Restore from backup
rm -rf /var/www/good-motor-website
mv /var/www/good-motor-website-backup-YYYYMMDD-HHMMSS /var/www/good-motor-website

# 3. Restart application
cd /var/www/good-motor-website
pm2 start good-motor
```

## 🚀 Recommended Deployment Flow

### **For Minor Changes (UI, content, bug fixes):**
1. Test locally → Git commit → GitHub push → Deploy to VPS

### **For Major Changes (new features, dependencies):**
1. Feature branch → Local testing → TypeScript check → 
2. GitHub PR → Merge to main → Deploy to VPS

### **For Database Changes:**
1. Test with local database → Backup VPS database → 
2. Deploy code → Update VPS database → Verify

## 📋 Quick Deployment Commands

### **Local Pre-flight Check:**
```bash
# Run this before every deployment
npm run build && npm start
```

### **VPS Health Check:**
```bash
# Run this after every deployment
ssh root@103.72.96.189 -p 24700 "cd /var/www/good-motor-website && pm2 status && curl -f http://localhost:3000/api/products"
```

## 🔧 Environment-Specific Settings

### **Local Development:**
- `.env.local` with local MongoDB
- Development dependencies installed
- Hot reload enabled

### **VPS Production:**
- Environment variables in PM2 config
- Production dependencies only
- Optimized build

## 📞 Emergency Contacts

- **VPS Provider**: [Your VPS provider support]
- **Domain**: goodmotor.vn
- **MongoDB**: [Your MongoDB provider]
- **Backup Location**: `/var/www/good-motor-website-backup-*` 