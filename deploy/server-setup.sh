#!/bin/bash

# Good Motor Website - VPS Setup Script for Debian 12
# This script installs all necessary software on your VPS

echo "🚀 Setting up Good Motor Website on VPS..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
sudo apt install -y curl wget git build-essential software-properties-common

# Install Node.js 18 (LTS)
echo "📥 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install MongoDB
echo "🗄️ Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
echo "🔄 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/good-motor
sudo chown -R $USER:$USER /var/www/good-motor

# Install UFW firewall
echo "🔒 Setting up firewall..."
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 24700/tcp  # SSH port
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw --force enable

echo "✅ Server setup completed!"
echo "🎯 Next steps:"
echo "1. Upload your application files to /var/www/good-motor"
echo "2. Run the application deployment script"
echo "3. Configure Nginx reverse proxy" 