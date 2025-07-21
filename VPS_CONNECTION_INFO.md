# VPS Connection Information

This document contains essential information for connecting to and managing the VPS server for the Good Motor website.

## Server Details

- **Host**: 103.72.96.189
- **Port**: 24700
- **Username**: root
- **Password**: (*W4dd#qao8k%iwlb)%R

## Connection Methods

### Method 1: Using SSH Command

Connect to the VPS directly using SSH with the following command:

```bash
ssh -p 24700 root@103.72.96.189
```

When prompted, enter the password: `(*W4dd#qao8k%iwlb)%R`

### Method 2: Using connect-vps.sh Script

For easier connection, use the provided connection script:

```bash
./connect-vps.sh
```

This script will automate the SSH connection process for you.

## Deployment

The application is deployed at: `/var/www/good-motor`

To deploy updates:
```bash
./deploy-safe.sh
```

For quick deployment without database setup:
```bash
./deploy/quick-deploy.sh
```

## Database Information

We use MongoDB Atlas for the database backend. Connection details:

- **Type**: MongoDB Atlas
- **Connection String**: mongodb+srv://goodmotorvn:L4lfPMzmN5t6VYa8@cluster0.lcv0mgg.mongodb.net/goodmotor?retryWrites=true&w=majority&appName=Cluster0
- **User**: goodmotorvn
- **Password**: L4lfPMzmN5t6VYa8
- **Database Name**: goodmotor

This connection is configured in the `.env` file on the VPS and automatically used by the application.

### Database Management

To run database seeding/migration scripts:

```bash
cd /var/www/good-motor
npm run seed
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
```

## Server Specifications

- **Operating System**: Ubuntu 20.04 LTS
- **RAM**: 2GB
- **Disk Space**: 20GB
- **Web Server**: Nginx (serving as reverse proxy)
- **Node Version**: 18.x
- **Process Manager**: PM2 (running in cluster mode)

## Troubleshooting

If you encounter connection issues:
1. Verify the server is running
2. Check that the SSH port (24700) is open
3. Ensure your IP is allowed if there's a firewall
4. Try connecting with verbose logging: `ssh -vvv -p 24700 root@103.72.96.189` 