#!/bin/bash

# Good Motor Website - VPS Setup Script for Debian 12
# This script installs all necessary software on your VPS

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

print_status "🚀 Setting up Good Motor Website on VPS..."

# Display VPS information
echo ""
print_vps_info "VPS Configuration:"
echo "  • Host: $VPS_HOST"
echo "  • Port: $VPS_PORT" 
echo "  • User: $VPS_USER"
echo "  • Password: $VPS_PASSWORD"
echo "  • Path: $VPS_PATH"
echo ""

# Update system packages
print_status "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "🔧 Installing essential packages..."
sudo apt install -y curl wget git build-essential software-properties-common

# Install Node.js 18 (LTS)
print_status "📥 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
print_status "✅ Node.js version: $(node --version)"
print_status "✅ NPM version: $(npm --version)"

# Install MongoDB
print_status "🗄️ Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
print_status "🔄 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
print_status "🌐 Installing Nginx..."
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create application directory
print_status "📁 Creating application directory..."
sudo mkdir -p /var/www/good-motor
sudo chown -R $USER:$USER /var/www/good-motor

# Install UFW firewall
print_status "🔒 Setting up firewall..."
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow $VPS_PORT/tcp  # SSH port
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw --force enable

print_status "✅ Server setup completed!"
print_status "🎯 Next steps:"
print_status "1. Upload your application files to /var/www/good-motor"
print_status "2. Run the application deployment script"
print_status "3. Configure Nginx reverse proxy" 