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

## 🚨 **Actual Deployment Errors Encountered & Solutions**

### **Error #1: TypeScript Build Failure**
**❌ Error Message:** `Type error: This expression is not callable`  
**📍 Location:** `app/api/admin/products/route.ts`  
**🔍 Root Cause:**
```typescript
// Problematic code that caused the error:
const filter = category ? { category } : {}
// TypeScript couldn't infer the MongoDB filter object type
```
**✅ Solution:**
```typescript
// Fixed code:
const filter: any = category ? { category } : {}
// Explicitly typed the filter as 'any' to resolve type inference issue
```
**📝 Lesson:** Always test TypeScript compilation locally with `npm run build` before deployment.

---

### **Error #2: Missing Dependencies**
**❌ Error Message:** Multiple `Cannot find module` errors  
**📍 Location:** Various components and API routes  
**🔍 Root Cause:** New libraries added locally but not installed on VPS:
- `react-quill` (Rich text editor)
- `lucide-react` (Icons)  
- `mongoose` (MongoDB ODM)
- `mongodb` (Database driver)
- `framer-motion` (Animations)
- `react-multi-carousel` (Carousels)
- `react-responsive-carousel` (Image carousels)
- `@heroicons/react` (Hero icons)
- `next-themes` (Theme switching)

**✅ Solution:**
```bash
# Install all missing dependencies
npm install react-quill lucide-react mongoose mongodb framer-motion react-multi-carousel react-responsive-carousel @heroicons/react next-themes

# Ensure package-lock.json is committed
git add package-lock.json
git commit -m "fix: add missing dependencies"
```
**📝 Lesson:** Always commit both `package.json` AND `package-lock.json` when adding dependencies.

---

### **Error #3: Database Configuration Mismatch**
**❌ Error Message:** Products API returning empty results despite having data  
**📍 Location:** API routes connecting to wrong database  
**🔍 Root Cause:** 
- VPS had two databases: `"good-motor"` (new products) and `"goodmotor"` (old products)
- API was connecting to `"goodmotor"` database (old/empty)
- New products were stored in `"good-motor"` database

**✅ Solution:**
```bash
# Method 1: Copy data to correct database
mongodump --db good-motor --collection products
mongorestore --db goodmotor --collection products dump/good-motor/products.bson

# Method 2: Update connection string to point to correct database
# Update MONGODB_URI to use consistent database name
```
**📝 Lesson:** Maintain consistent database naming between development and production environments.

---

### **Error #4: Build Process Interruption**
**❌ Error Message:** Deployment failed mid-process, application left in broken state  
**📍 Location:** VPS build step  
**🔍 Root Cause:** 
- TypeScript errors caused build to fail
- Process stopped before completing deployment
- PM2 process not restarted properly
- Application stuck in broken state

**✅ Solution:**
```bash
# Emergency recovery steps:
1. ssh root@103.72.96.189 -p 24700
2. cd /var/www/good-motor-website
3. git reset --hard HEAD  # Reset to last working commit
4. npm ci --production     # Clean dependency install
5. npm run build          # Fresh build
6. pm2 restart good-motor # Restart application
```
**📝 Lesson:** Use atomic deployment processes that either fully succeed or fully rollback.

---

### **Error #5: Projects Page Display Issue**
**❌ Error Message:** "Loading projects..." shown instead of actual projects  
**📍 Location:** Frontend projects page  
**🔍 Root Cause:** 
- API was working correctly (returning data)
- Frontend JavaScript not executing properly
- Potential caching issues with old build artifacts
- Build files not properly updated during deployment

**✅ Solution:**
```bash
# Clear build cache and rebuild
rm -rf .next
npm run build

# Clear browser cache
# Force refresh with Ctrl+F5 or Cmd+Shift+R

# Verify API response format
curl http://goodmotor.vn/api/projects
```
**📝 Lesson:** Always verify both API endpoints AND frontend functionality after deployment.

---

### **Error #6: Package Version Conflicts**
**❌ Error Message:** Dependency resolution conflicts during npm install  
**📍 Location:** npm install process  
**🔍 Root Cause:** 
- `package-lock.json` out of sync with `package.json`
- Different Node.js versions between local and VPS
- Conflicting peer dependencies from new packages

**✅ Solution:**
```bash
# Complete dependency reset
rm -rf node_modules package-lock.json
npm install
npm ci --production

# Verify versions match
node --version  # Check Node.js version
npm --version   # Check npm version
```
**📝 Lesson:** Use `npm ci --production` for consistent, reproducible installs on production.

---

### **Error #7: Environment Variables Mismatch**
**❌ Error Message:** MongoDB connection timeouts and failures  
**📍 Location:** Database connection initialization  
**🔍 Root Cause:** 
- Local `.env.local` had different MongoDB URI format
- VPS environment variables not properly configured
- Database authentication credentials mismatch

**✅ Solution:**
```bash
# Verify VPS environment variables
ssh root@103.72.96.189 -p 24700 "pm2 env good-motor"

# Check MongoDB connection
ssh root@103.72.96.189 -p 24700 "mongo --eval 'db.runCommand({connectionStatus: 1})'"

# Update PM2 environment if needed
pm2 set good-motor:MONGODB_URI "mongodb://localhost:27017/goodmotor"
pm2 restart good-motor
```
**📝 Lesson:** Always verify environment variable consistency between development and production.

---

### **Error #8: Frontend Build Cache Issues**
**❌ Error Message:** Old components still showing after deployment  
**📍 Location:** Browser and Next.js build cache  
**🔍 Root Cause:** 
- Next.js build cache not properly cleared
- Browser caching old JavaScript files
- Static assets not updated properly

**✅ Solution:**
```bash
# Clear Next.js build cache
rm -rf .next
npm run build

# Verify static assets are updated
ls -la .next/static/

# Force browser cache refresh
# Add cache-busting headers in next.config.js if needed
```
**📝 Lesson:** Include cache clearing as part of deployment process.

---

## 📊 **Error Summary & Prevention**

| Error Type | Frequency | Impact | Prevention Method |
|------------|-----------|--------|-------------------|
| TypeScript Errors | High | Critical | `./dev-check.sh` |
| Missing Dependencies | High | Critical | Package synchronization |
| Database Issues | Medium | High | Environment validation |
| Build Failures | Medium | Critical | Atomic deployment |
| Cache Issues | Low | Medium | Build cache clearing |
| Environment Config | Low | High | Config verification |

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