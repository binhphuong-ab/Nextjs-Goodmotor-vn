#!/bin/bash

# Good Motor - Connect to VPS script
# This script sets up passwordless SSH connection to the VPS

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VPS Configuration from deploy-safe.sh
VPS_HOST="103.72.96.189"
VPS_PORT="24700"
VPS_USER="root"
VPS_PASSWORD="(*W4dd#qao8k%iwlb)%R"
VPS_PATH="/var/www/good-motor"

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

echo "🔐 Good Motor - VPS Connection Setup"
echo "=================================="
echo ""
print_status "VPS Information:"
echo "  • Host: $VPS_HOST"
echo "  • Port: $VPS_PORT"
echo "  • User: $VPS_USER"
echo "  • Path: $VPS_PATH"
echo ""

# Check if SSH key exists
SSH_KEY="$HOME/.ssh/id_rsa"
if [ -f "$SSH_KEY" ]; then
    print_success "SSH key already exists at $SSH_KEY"
else
    print_status "No SSH key found. Creating new SSH key..."
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY" -N ""
    check_status "SSH key created successfully" "Failed to create SSH key"
fi

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    print_warning "sshpass not installed. You will be prompted for the password."
    print_status "Installing sshpass is recommended for automated password handling."
    print_status "To install on macOS: brew install hudochenkov/sshpass/sshpass"
    print_status "To install on Ubuntu: sudo apt-get install sshpass"
    
    # Check if key is already on server by trying a test connection
    print_status "Testing if passwordless connection is already set up..."
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST -o BatchMode=yes -o ConnectTimeout=5 "echo 'Connection successful'" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "Passwordless connection is already set up!"
        print_status "Connecting to VPS..."
        ssh -p $VPS_PORT $VPS_USER@$VPS_HOST
        exit 0
    fi
    
    print_status "Setting up passwordless connection to VPS..."
    print_status "You will be prompted for the VPS password"
    echo "VPS Password: $VPS_PASSWORD"
    
    # Copy SSH key to server
    ssh-copy-id -p $VPS_PORT $VPS_USER@$VPS_HOST
else
    # Using sshpass for automatic password entry
    print_status "Using sshpass for automatic password handling"
    
    # Check if key is already on server by trying a test connection
    print_status "Testing if passwordless connection is already set up..."
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST -o BatchMode=yes -o ConnectTimeout=5 "echo 'Connection successful'" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "Passwordless connection is already set up!"
        print_status "Connecting to VPS..."
        ssh -p $VPS_PORT $VPS_USER@$VPS_HOST
        exit 0
    fi
    
    print_status "Setting up passwordless connection to VPS..."
    
    # Copy SSH key to server using sshpass
    sshpass -p "$VPS_PASSWORD" ssh-copy-id -p $VPS_PORT $VPS_USER@$VPS_HOST
fi

if [ $? -eq 0 ]; then
    print_success "SSH key copied successfully to the VPS"
    print_status "Connecting to VPS..."
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST
else
    print_error "Failed to copy SSH key to VPS. Please try again."
    print_status "Attempting direct connection with password..."
    
    if command -v sshpass &> /dev/null; then
        sshpass -p "$VPS_PASSWORD" ssh -p $VPS_PORT $VPS_USER@$VPS_HOST
    else
        print_status "Password for VPS: $VPS_PASSWORD"
        ssh -p $VPS_PORT $VPS_USER@$VPS_HOST
    fi
fi 