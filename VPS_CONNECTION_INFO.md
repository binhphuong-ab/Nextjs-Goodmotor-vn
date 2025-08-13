# VPS Connection Information

This document contains essential information for connecting to and managing the VPS server for the Good Motor website.

## Server Details

- **Host**: 103.72.96.189
- **Port**: 24700
- **Username**: root
- **Password**: (*W4dd#qao8k%iwlb)%R

## Connection Methods

### Direct SSH Connection

Connect to the VPS directly using SSH with the following command:

```bash
ssh -p 24700 root@103.72.96.189
```

When prompted, enter the password: `(*W4dd#qao8k%iwlb)%R`

**Note**: Passwordless SSH connection is already set up, so you may not need to enter the password.

## Deployment

The application is deployed at: `/var/www/good-motor`

### Method 1: Manual Deployment (Recommended)

To deploy updates manually:

```bash
# Connect to VPS
ssh -p 24700 root@103.72.96.189

# Navigate to application directory
cd /var/www/good-motor

# Pull latest changes from GitHub
git pull origin main

# Install dependencies (if needed)
npm install

# Build the application
npm run build

# Restart the application
pm2 restart good-motor
```

### Method 2: Using connect-vps.sh Script

For easier connection, use the provided connection script:

```bash
./connect-vps.sh
```

This script will automatically connect you to the VPS, then you can run the deployment commands manually.

## Database Information

We use MongoDB Atlas for the database backend. Connection details:

- **Type**: MongoDB Atlas
- **Connection String**: mongodb+srv://goodmotorvn:L4lfPMzmN5t6VYa8@cluster0.lcv0mgg.mongodb.net/goodmotor?retryWrites=true&w=majority&appName=Cluster0
- **User**: goodmotorvn
- **Password**: L4lfPMzmN5t6VYa8
- **Database Name**: goodmotor

This connection is configured in the `.env` file on the VPS and automatically used by the application.

### Database Management

The database is hosted on MongoDB Atlas and is managed automatically. No manual seeding is typically required as the database is already set up and populated.

If you need to run any database operations:

```bash
# Connect to VPS and navigate to app directory
cd /var/www/good-motor

# Connect to MongoDB Atlas using mongosh (if needed)
mongosh "mongodb+srv://goodmotorvn:L4lfPMzmN5t6VYa8@cluster0.lcv0mgg.mongodb.net/goodmotor?retryWrites=true&w=majority&appName=Cluster0"
```

## Application Management

The application runs using PM2 as a process manager:

```bash
# Check application status
pm2 status

# View application logs
pm2 logs good-motor

# Restart the application
pm2 restart good-motor

# Stop the application
pm2 stop good-motor

# View real-time logs
pm2 logs good-motor --lines 50
```

### Quick Deployment Reference

1. **Connect**: `ssh -p 24700 root@103.72.96.189`
2. **Navigate**: `cd /var/www/good-motor`
3. **Update**: `git pull origin main`
4. **Build**: `npm run build`
5. **Restart**: `pm2 restart good-motor`

## Server Specifications

- **Operating System**: Debian GNU/Linux 6.1.0-37-cloud-amd64
- **RAM**: 2GB
- **Disk Space**: 20GB
- **Web Server**: Nginx (serving as reverse proxy)
- **Node Version**: 18.x
- **Process Manager**: PM2 (running in cluster mode)
- **Database**: MongoDB Atlas (cloud-hosted)

## Troubleshooting

If you encounter connection issues:
1. Verify the server is running
2. Check that the SSH port (24700) is open
3. Ensure your IP is allowed if there's a firewall
4. Try connecting with verbose logging: `ssh -vvv -p 24700 root@103.72.96.189` 