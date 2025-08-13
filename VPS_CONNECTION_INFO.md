# VPS Connection Information

Essential information for the Good Motor website VPS server.

## Server Details

- **Host**: 103.72.96.189
- **Port**: 24700
- **Username**: root
- **Password**: (*W4dd#qao8k%iwlb)%R

## Quick Connection

```bash
ssh -p 24700 root@103.72.96.189
```

**Note**: Passwordless SSH is set up, password may not be required.

## Deployment Process

Application location: `/var/www/good-motor`

### Quick Deploy Steps

```bash
# Connect to VPS
ssh -p 24700 root@103.72.96.189

# Navigate to app directory
cd /var/www/good-motor

# Update code
git pull origin main

# Install/update dependencies
npm install

# Build application
npm run build

# Restart application
pm2 restart good-motor
```

## Database

- **Type**: MongoDB Atlas
- **Connection**: mongodb+srv://goodmotorvn:L4lfPMzmN5t6VYa8@cluster0.lcv0mgg.mongodb.net/goodmotor
- **Database**: goodmotor

## PM2 Management

```bash
# Check status
pm2 status

# View logs (one-time snapshot)
pm2 logs good-motor --lines 10 --nostream

# View logs (continuous streaming)
pm2 logs good-motor --lines 10

# Restart application
pm2 restart good-motor
```

**Note**: The `pm2 logs` command without `--nostream` continuously follows the log output and never exits. Using `--nostream` gives you a quick snapshot and exits immediately.

## Server Info

- **OS**: Debian GNU/Linux
- **RAM**: 2GB
- **Node**: v18.x
- **Process Manager**: PM2
- **Web Server**: Nginx

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