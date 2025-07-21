#!/bin/bash

# Good Motor Website - Quick Deployment Script
# This script automates the entire deployment process

echo "🚀 Good Motor Website - Quick Deployment"
echo "========================================"

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
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_vps_info() {
    echo -e "${BLUE}[VPS INFO]${NC} $1"
}

# Display VPS information
echo ""
print_vps_info "VPS Configuration:"
echo "  • Host: $VPS_HOST"
echo "  • Port: $VPS_PORT" 
echo "  • User: $VPS_USER"
echo "  • Path: $VPS_PATH"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="/var/www/good-motor"

print_status "Starting deployment process..."

# Step 1: Server Setup
print_status "Step 1: Setting up server environment..."
if [ -f "$SCRIPT_DIR/server-setup.sh" ]; then
    chmod +x "$SCRIPT_DIR/server-setup.sh"
    bash "$SCRIPT_DIR/server-setup.sh"
    if [ $? -eq 0 ]; then
        print_status "✅ Server setup completed successfully"
    else
        print_error "❌ Server setup failed"
        exit 1
    fi
else
    print_warning "server-setup.sh not found, skipping server setup"
fi

# Step 2: Database Setup
print_status "Step 2: Setting up MongoDB database..."
if [ -f "$SCRIPT_DIR/database-setup.sh" ]; then
    chmod +x "$SCRIPT_DIR/database-setup.sh"
    bash "$SCRIPT_DIR/database-setup.sh"
    if [ $? -eq 0 ]; then
        print_status "✅ Database setup completed successfully"
    else
        print_error "❌ Database setup failed"
        exit 1
    fi
else
    print_warning "database-setup.sh not found, skipping database setup"
fi

# Step 3: Application Deployment
print_status "Step 3: Deploying Next.js application..."
if [ -f "$SCRIPT_DIR/app-deploy.sh" ]; then
    chmod +x "$SCRIPT_DIR/app-deploy.sh"
    bash "$SCRIPT_DIR/app-deploy.sh"
    if [ $? -eq 0 ]; then
        print_status "✅ Application deployment completed successfully"
    else
        print_error "❌ Application deployment failed"
        exit 1
    fi
else
    print_warning "app-deploy.sh not found, skipping application deployment"
fi

# Step 4: Nginx Configuration
print_status "Step 4: Configuring Nginx reverse proxy..."
if [ -f "$SCRIPT_DIR/nginx-config" ]; then
    # Copy Nginx configuration
    cp "$SCRIPT_DIR/nginx-config" /etc/nginx/sites-available/good-motor
    
    # Enable the site
    ln -sf /etc/nginx/sites-available/good-motor /etc/nginx/sites-enabled/
    
    # Remove default site if it exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    nginx -t
    if [ $? -eq 0 ]; then
        systemctl restart nginx
        print_status "✅ Nginx configuration completed successfully"
    else
        print_error "❌ Nginx configuration test failed"
        exit 1
    fi
else
    print_warning "nginx-config not found, skipping Nginx setup"
fi

# Step 5: Final Verification
print_status "Step 5: Verifying deployment..."

# Check services
services=("nginx" "mongod")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        print_status "✅ $service is running"
    else
        print_error "❌ $service is not running"
    fi
done

# Check PM2 status
print_status "PM2 Application Status:"
pm2 status

print_status "🎉 Deployment completed!"
echo ""
echo "========================================"
echo "🌐 Your website is now accessible at:"
echo "   http://goodmotor.vn"
echo ""
echo "🔧 Useful commands:"
echo "   ssh -p $VPS_PORT $VPS_USER@$VPS_HOST  # Connect to VPS"
echo "   VPS Password: $VPS_PASSWORD"
echo "   pm2 logs good-motor-website  # View application logs"
echo "   pm2 restart good-motor-website  # Restart application"
echo "   systemctl status nginx  # Check Nginx status"
echo "   systemctl status mongod  # Check MongoDB status"
echo ""
echo "📖 For detailed documentation, see: deploy/DEPLOYMENT_GUIDE.md"
echo "========================================" 