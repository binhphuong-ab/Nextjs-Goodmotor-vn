#!/bin/bash

# Good Motor - Rollback Script
# This script helps you quickly restore a previous version if deployment fails

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# VPS Configuration
VPS_HOST="103.72.96.189"
VPS_PORT="24700"
VPS_USER="root"
VPS_PATH="/var/www/good-motor-website"
APP_NAME="good-motor"

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

echo "🔄 Good Motor - Rollback Script"
echo "==============================="
echo ""

print_warning "This will rollback your VPS to a previous backup."
print_warning "Current live version will be lost!"
echo ""

# Step 1: Get available backups
print_status "Step 1: Checking available backups..."

BACKUP_LIST=$(ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "ls -la /var/www/ | grep good-motor-website-backup" || echo "")

if [ -z "$BACKUP_LIST" ]; then
    print_error "No backups found on VPS."
    echo ""
    print_status "Available options:"
    echo "  1. Check if backups exist in different location"
    echo "  2. Restore from GitHub (latest committed version)"
    echo ""
    read -p "Do you want to restore from GitHub? (y/N): " github_choice
    if [[ $github_choice =~ ^[Yy]$ ]]; then
        print_status "Restoring from GitHub..."
        
        GITHUB_RESTORE="
        set -e
        cd $VPS_PATH
        
        echo '⏹️  Stopping application...'
        pm2 stop $APP_NAME || echo 'App was not running'
        
        echo '🔄 Resetting to latest GitHub version...'
        git reset --hard HEAD
        git pull origin main
        
        echo '📦 Installing dependencies...'
        npm ci --production
        
        echo '🔨 Building application...'
        npm run build
        
        echo '▶️  Starting application...'
        pm2 start $APP_NAME || pm2 restart $APP_NAME
        pm2 save
        
        echo '✅ GitHub restore completed!'
        "
        
        ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "$GITHUB_RESTORE"
        print_success "Restored from GitHub successfully!"
    else
        print_error "Rollback cancelled."
        exit 1
    fi
else
    echo "Available backups:"
    echo "$BACKUP_LIST" | nl -s ") "
    echo ""
    
    # Get backup names
    BACKUP_NAMES=$(echo "$BACKUP_LIST" | awk '{print $NF}' | grep good-motor-website-backup)
    BACKUP_ARRAY=($BACKUP_NAMES)
    
    echo "Select backup to restore:"
    select backup in "${BACKUP_ARRAY[@]}" "Cancel"; do
        case $backup in
            "Cancel")
                print_error "Rollback cancelled."
                exit 1
                ;;
            *)
                if [ -n "$backup" ]; then
                    selected_backup="$backup"
                    break
                else
                    print_error "Invalid selection. Please try again."
                fi
                ;;
        esac
    done
    
    print_warning "You selected: $selected_backup"
    read -p "Are you sure you want to rollback to this version? (y/N): " confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        print_error "Rollback cancelled."
        exit 1
    fi
    
    # Step 2: Perform rollback
    print_status "Step 2: Performing rollback..."
    
    ROLLBACK_COMMANDS="
    set -e
    
    echo '⏹️  Stopping current application...'
    pm2 stop $APP_NAME || echo 'App was not running'
    
    echo '💾 Creating safety backup of current version...'
    safety_backup=\"good-motor-website-current-\$(date +%Y%m%d-%H%M%S)\"
    cp -r $VPS_PATH /var/www/\$safety_backup
    echo \"Safety backup created: /var/www/\$safety_backup\"
    
    echo '🔄 Restoring from backup: $selected_backup'
    rm -rf $VPS_PATH
    cp -r /var/www/$selected_backup $VPS_PATH
    
    echo '📂 Setting correct permissions...'
    cd $VPS_PATH
    chown -R root:root .
    
    echo '📦 Installing dependencies (if needed)...'
    npm ci --production --silent || echo 'Dependencies already installed'
    
    echo '▶️  Starting application...'
    pm2 start $APP_NAME || pm2 restart $APP_NAME
    pm2 save
    
    echo '✅ Rollback completed!'
    pm2 status $APP_NAME
    "
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "$ROLLBACK_COMMANDS"
    
    print_success "Rollback completed successfully!"
fi

# Step 3: Verify rollback
print_status "Step 3: Verifying rollback..."

sleep 5
response_code=$(curl -s -o /dev/null -w "%{http_code}" http://goodmotor.vn)
if [ "$response_code" = "200" ]; then
    print_success "Website is accessible: http://goodmotor.vn"
else
    print_warning "Website might not be fully accessible yet (HTTP $response_code)"
fi

echo ""
print_success "🎉 Rollback completed!"
echo ""
echo "📋 What happened:"
echo "  • Current version backed up"
echo "  • Previous version restored"
echo "  • Application restarted"
echo "  • Website verified"
echo ""
echo "🌐 Your website: http://goodmotor.vn"
echo "🔧 Admin panel: http://goodmotor.vn/admin"
echo ""
echo "📞 Next steps:"
echo "  • Test your website thoroughly"
echo "  • Fix the issues in your local code"
echo "  • Test locally before redeploying"
echo "  • Use ./deploy-safe.sh for next deployment"
echo "" 