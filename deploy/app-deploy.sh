#!/bin/bash

# Good Motor Website - Application Deployment Script
# This script deploys the Next.js application

echo "🚀 Deploying Good Motor Website..."

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

# MongoDB Atlas Configuration
MONGODB_URI="mongodb+srv://goodmotorvn:L4lfPMzmN5t6VYa8@cluster0.lcv0mgg.mongodb.net/goodmotor?retryWrites=true&w=majority&appName=Cluster0"

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
echo "  • Password: $VPS_PASSWORD"
echo "  • Path: $VPS_PATH"
echo ""

# Set application directory
APP_DIR="/var/www/good-motor"
cd $APP_DIR

# Install dependencies
print_status "📦 Installing Node.js dependencies..."
npm install --production

# Build the Next.js application
print_status "🔨 Building Next.js application..."
npm run build

# Create PM2 ecosystem file
print_status "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Using MongoDB Atlas instead of local MongoDB
      // The actual MongoDB_URI is in the .env file
    },
    error_file: "/var/log/pm2/$APP_NAME-error.log",
    out_file: "/var/log/pm2/$APP_NAME-out.log",
    log_file: "/var/log/pm2/$APP_NAME.log"
  }]
};
EOF

# Ensure .env file exists with MongoDB URI
print_status "🔑 Ensuring MongoDB Atlas connection is configured..."
if [ ! -f "$APP_DIR/.env" ] || ! grep -q "MONGODB_URI" "$APP_DIR/.env"; then
    print_status "Creating/updating .env file with MongoDB Atlas URI..."
    echo "MONGODB_URI=$MONGODB_URI" > "$APP_DIR/.env"
    echo "NODE_ENV=production" >> "$APP_DIR/.env"
fi

# Stop existing PM2 processes
print_status "🔄 Managing PM2 processes..."
pm2 delete $APP_NAME 2>/dev/null || true

# Start the application with PM2
print_status "🎬 Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup systemd -u $USER --hp $HOME

print_status "✅ Application deployed successfully!"
print_status "📊 Application status:"
pm2 status
echo ""
print_status "🌐 Application is running on port 3000"
print_status "🔗 Next step: Configure Nginx reverse proxy" 