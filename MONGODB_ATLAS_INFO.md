# MongoDB Atlas Configuration

This project uses MongoDB Atlas as the database backend instead of a local MongoDB instance. This document provides information on the configuration and management of the MongoDB Atlas connection.

## Connection Information

- **Connection String**: `mongodb+srv://goodmotorvn:L4lfPMzmN5t6VYa8@cluster0.lcv0mgg.mongodb.net/goodmotor?retryWrites=true&w=majority&appName=Cluster0`
- **Username**: `goodmotorvn`
- **Password**: `L4lfPMzmN5t6VYa8`
- **Database Name**: `goodmotor`
- **Cluster Name**: `Cluster0`

## Configuration Files

The MongoDB Atlas connection string is configured in the following places:

1. **Local Development**: 
   - In your local `.env` file

2. **Production Deployment**:
   - In the VPS `.env` file at `/var/www/good-motor/.env`
   - The deployment scripts automatically create this file if it doesn't exist

## Deployment Scripts

The following deployment scripts have been updated to work with MongoDB Atlas:

- `deploy/app-deploy.sh`: Updated to create an ecosystem.config.js that doesn't override the MongoDB URI from the .env file
- `deploy/database-setup.sh`: Updated to connect to MongoDB Atlas instead of a local MongoDB instance for seeding data

## Working with MongoDB Atlas

### Accessing the MongoDB Atlas Dashboard

1. Go to https://cloud.mongodb.com/
2. Log in with the account credentials (contact admin for access)

### Running Database Commands

To interact with the MongoDB Atlas database from the VPS:

```bash
# Connect to the MongoDB shell
mongosh "mongodb+srv://goodmotorvn:L4lfPMzmN5t6VYa8@cluster0.lcv0mgg.mongodb.net/goodmotor"

# Run database operations
> show collections
> db.products.find()
```

### Database Operations from Your Application

The application uses the Mongoose connection configured in `lib/mongoose.ts` to connect to the database. This connection is set up to use the MongoDB Atlas URI from the environment variables.

## Migrating Data

If you need to migrate data to MongoDB Atlas:

1. Export data from your source database:
   ```bash
   mongoexport --uri="<source-uri>" --collection=products --out=products.json
   ```

2. Import data to MongoDB Atlas:
   ```bash
   mongoimport --uri="mongodb+srv://goodmotorvn:L4lfPMzmN5t6VYa8@cluster0.lcv0mgg.mongodb.net/goodmotor" --collection=products --file=products.json
   ```

## Common Issues and Solutions

### Connection Issues

If you experience connection problems:

1. Check that the connection string is correct
2. Verify network access is allowed (MongoDB Atlas has IP whitelist)
3. Ensure the credentials are valid
4. Test the connection using the MongoDB shell

### Performance Optimization

For better performance:

1. Create proper indexes for frequent queries
2. Use connection pooling
3. Implement caching for frequently accessed data

## Monitoring

MongoDB Atlas provides built-in monitoring tools:

1. Go to the Atlas dashboard
2. Select your cluster
3. Click on the "Metrics" tab to view performance statistics

You can also set up alerts for various metrics like high CPU usage or connection limits.

## Backup and Recovery

MongoDB Atlas automatically creates backups. To restore data:

1. Navigate to the backup section in the Atlas dashboard
2. Select the point-in-time you want to restore from
3. Follow the restore procedure

For additional custom backups, use `mongodump` and `mongorestore` tools.

## Security Recommendations

1. Keep the connection string secure and never commit it to public repositories
2. Regularly rotate the database password
3. Use IP whitelisting for additional security
4. Set up database users with appropriate permissions 