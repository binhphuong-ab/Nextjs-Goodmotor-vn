# SSH Config Setup for Easy VPS Access

## 🚀 **Quick SSH Access Configuration**

Create easy shortcuts to connect to your VPS servers without typing full commands.

## 📝 **SSH Config File Setup**

Add this configuration to `~/.ssh/config`:

```bash
# Main VPS (Good Motor Website)
Host main-vps
    HostName 103.72.96.189
    Port 24700
    User root
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3

# Digital Ocean Droplet VPS
Host droplet-do
    HostName 134.209.99.219
    Port 22
    User root
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

## 🛠️ **How to Set It Up**

### Option 1: Create/Edit SSH Config Manually
```bash
# Edit or create SSH config file
nano ~/.ssh/config

# Copy the configuration above into the file
# Save and exit (Ctrl+X, then Y, then Enter in nano)

# Set proper permissions
chmod 600 ~/.ssh/config
```

### Option 2: Automated Setup (Run these commands)
```bash
# Create SSH config directory if it doesn't exist
mkdir -p ~/.ssh

# Add main VPS configuration
cat >> ~/.ssh/config << 'EOF'

# Main VPS (Good Motor Website)
Host main-vps
    HostName 103.72.96.189
    Port 24700
    User root
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3

# Digital Ocean Droplet VPS
Host droplet-do
    HostName 134.209.99.219
    Port 22
    User root
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
EOF

# Set proper permissions
chmod 600 ~/.ssh/config
```

## ✨ **Easy Connection Commands**

After setup, connect using simple commands:

### Main VPS (Good Motor Website)
```bash
# Instead of: ssh -p 24700 root@103.72.96.189
ssh main-vps
```

### Digital Ocean Droplet
```bash
# Instead of: ssh root@134.209.99.219
ssh droplet-do
```

## 🔧 **Configuration Options Explained**

- **HostName**: The actual IP address of the server
- **Port**: SSH port (24700 for main VPS, 22 for Droplet)
- **User**: Username (root for both)
- **IdentityFile**: Path to your SSH private key
- **IdentitiesOnly**: Only use specified key, ignore SSH agent
- **ServerAliveInterval**: Send keepalive every 60 seconds
- **ServerAliveCountMax**: Disconnect after 3 failed keepalives

## 🎯 **Benefits**

1. **Easy Commands**: `ssh main-vps` instead of long commands
2. **Consistent Configuration**: Same settings every time
3. **Connection Stability**: Keepalive prevents disconnections
4. **Security**: Uses only specified SSH keys
5. **Organization**: Clear names for different servers

## 📋 **Usage Examples**

### Connect to Main VPS
```bash
ssh main-vps
```

### Connect and run commands
```bash
ssh main-vps "pm2 status"
ssh main-vps "cd /var/www/good-motor && git pull"
```

### Copy files to/from servers
```bash
# Copy to main VPS
scp myfile.txt main-vps:/var/www/good-motor/

# Copy from Droplet
scp droplet-do:/root/backup.tar.gz ./
```

### SSH with port forwarding
```bash
# Forward local port 3000 to main VPS port 3000
ssh -L 3000:localhost:3000 main-vps
```

## 🔍 **Testing Your Configuration**

Test each server connection:
```bash
# Test main VPS
ssh main-vps "echo 'Main VPS connected successfully!'"

# Test Droplet
ssh droplet-do "echo 'Droplet connected successfully!'"
```

## 🚨 **Troubleshooting**

### Permission Issues
```bash
# Fix SSH config permissions
chmod 600 ~/.ssh/config
chmod 700 ~/.ssh
```

### Connection Problems
```bash
# Test with verbose output
ssh -v main-vps
ssh -v droplet-do

# Check SSH config syntax
ssh -F ~/.ssh/config -T main-vps
```

---
*SSH Config created: August 25, 2025*
*Both VPS servers secured with SSH key authentication*
