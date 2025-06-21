#!/bin/bash

# Good Motor Website - Application Deployment Script
# This script deploys the Next.js application

echo "🚀 Deploying Good Motor Website..."

# Set application directory
APP_DIR="/var/www/good-motor"
cd $APP_DIR

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install --production

# Build the Next.js application
echo "🔨 Building Next.js application..."
npm run build

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'good-motor-website',
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
      MONGODB_URI: 'mongodb://localhost:27017/goodmotor'
    }
  }]
};
EOF

# Stop existing PM2 processes
echo "🔄 Managing PM2 processes..."
pm2 delete good-motor-website 2>/dev/null || true

# Start the application with PM2
echo "🎬 Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup systemd -u $USER --hp $HOME

echo "✅ Application deployed successfully!"
echo "📊 Application status:"
pm2 status
echo ""
echo "🌐 Application is running on port 3000"
echo "🔗 Next step: Configure Nginx reverse proxy" 