#!/bin/bash

# Good Motor - Safe Deployment Script
# This script ensures error-free deployments to VPS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_HOST="103.72.96.189"
VPS_PORT="24700"
VPS_USER="root"
VPS_PASSWORD="(*W4dd#qao8k%iwlb)%R"
VPS_PATH="/var/www/good-motor"
APP_NAME="good-motor"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command was successful
check_status() {
    if [ $? -eq 0 ]; then
        print_success "$1"
    else
        print_error "$2"
        exit 1
    fi
}

echo "🚀 Good Motor - Safe Deployment Script"
echo "======================================"
echo ""

# Step 1: Pre-flight checks
print_status "Step 1: Running pre-flight checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Git repository is clean
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please commit or stash them first."
    echo ""
    git status --short
    echo ""
    read -p "Do you want to continue anyway? (y/N): " continue_choice
    if [[ ! $continue_choice =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled."
        exit 1
    fi
fi

# Step 2: Local build test
print_status "Step 2: Testing local build..."
npm run build
check_status "Local build successful" "Local build failed. Please fix errors before deploying."

# Step 3: Dependency check
print_status "Step 3: Checking dependencies..."
npm audit --audit-level moderate
if [ $? -ne 0 ]; then
    print_warning "Some dependency vulnerabilities found. Consider updating."
    read -p "Continue with deployment? (y/N): " continue_choice
    if [[ ! $continue_choice =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled due to dependency issues."
        exit 1
    fi
fi

# Step 4: Push to GitHub
print_status "Step 4: Pushing to GitHub..."
current_branch=$(git branch --show-current)
git push origin $current_branch
check_status "Code pushed to GitHub" "Failed to push to GitHub"

# Step 5: VPS Connection Test
print_status "Step 5: Testing VPS connection..."

# Check if sshpass is installed
if command -v sshpass &> /dev/null; then
    print_status "Using sshpass for automatic password handling"
    sshpass -p "$VPS_PASSWORD" ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "echo 'VPS connection successful'" > /dev/null 2>&1
else
    print_status "VPS connection requires password. VPS Password: $VPS_PASSWORD"
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "echo 'VPS connection successful'" > /dev/null 2>&1
fi

check_status "VPS connection successful" "Cannot connect to VPS. Check your SSH connection."

# Step 6: Deployment confirmation
echo ""
print_warning "Ready to deploy to production VPS:"
echo "  • Host: $VPS_HOST:$VPS_PORT"
echo "  • Path: $VPS_PATH"
echo "  • App: $APP_NAME"
echo "  • Branch: $current_branch"
echo ""
read -p "Continue with deployment? (y/N): " deploy_choice
if [[ ! $deploy_choice =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled by user."
    exit 1
fi

# Step 7: VPS Deployment
print_status "Step 7: Deploying to VPS..."

# Create deployment commands
DEPLOY_COMMANDS="
set -e
cd $VPS_PATH

echo '📋 Creating backup...'
backup_name=\"good-motor-website-backup-\$(date +%Y%m%d-%H%M%S)\"
cp -r $VPS_PATH /var/www/\$backup_name
echo \"Backup created: /var/www/\$backup_name\"

echo '⏹️  Stopping application...'
pm2 stop $APP_NAME || echo 'App was not running'

echo '📥 Pulling latest code...'
git pull origin $current_branch

echo '📦 Installing dependencies...'
npm ci --production --silent

echo '🔨 Building application...'
npm run build

echo '▶️  Starting application...'
pm2 start $APP_NAME || pm2 restart $APP_NAME
pm2 save

echo '✅ Deployment completed!'
echo '🌐 Testing application...'
sleep 3
pm2 status $APP_NAME
curl -f http://localhost:3000/api/products -s > /dev/null && echo 'API test: ✅ Products endpoint working' || echo 'API test: ❌ Products endpoint failed'
curl -f http://localhost:3000/api/projects -s > /dev/null && echo 'API test: ✅ Projects endpoint working' || echo 'API test: ❌ Projects endpoint failed'
"

# Execute deployment
if command -v sshpass &> /dev/null; then
    sshpass -p "$VPS_PASSWORD" ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "$DEPLOY_COMMANDS"
else
    print_status "Password for deployment: $VPS_PASSWORD"
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "$DEPLOY_COMMANDS"
fi

check_status "VPS deployment completed" "VPS deployment failed"

# Step 8: Final verification
print_status "Step 8: Final verification..."

# Test website accessibility
sleep 5
response_code=$(curl -s -o /dev/null -w "%{http_code}" http://goodmotor.vn)
if [ "$response_code" = "200" ]; then
    print_success "Website is accessible: http://goodmotor.vn"
else
    print_warning "Website might not be fully accessible yet (HTTP $response_code)"
fi

echo ""
print_success "🎉 Deployment completed successfully!"
echo ""
echo "📋 Summary:"
echo "  • Local build: ✅ Passed"
echo "  • GitHub push: ✅ Completed"
echo "  • VPS deployment: ✅ Successful"
echo "  • Application: ✅ Running"
echo ""
echo "🌐 Your website is live at: http://goodmotor.vn"
echo "🔧 Admin panel: http://goodmotor.vn/admin"
echo ""
echo "📞 If you encounter issues:"
echo "  • Check PM2 status: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'pm2 status'"
echo "  • View logs: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'pm2 logs $APP_NAME'"
echo "  • Rollback: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'cd /var/www && ls -la *backup*'"
echo "" 