import mongoose from 'mongoose'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Use global variable in development to preserve connection across hot reloads
declare global {
  var mongoose: MongooseCache | undefined
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

/**
 * Unified MongoDB connection using Mongoose
 * Handles connection reuse, error handling, and development hot reload
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Check for environment variable when function is called, not at import time
  if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
  }

  const MONGODB_URI = process.env.MONGODB_URI

  // Return existing connection if available
  if (cached!.conn) {
    return cached!.conn
  }

  // Return existing promise if connection is in progress
  if (!cached!.promise) {
    const opts = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    }

    console.log('[MongoDB] Establishing new connection...')
    
    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('[MongoDB] Connected successfully!')
      return mongoose
    }).catch((error) => {
      console.error('[MongoDB] Connection failed:', error)
      // Reset promise on failure so next attempt can retry
      cached!.promise = null
      throw error
    })
  }

  try {
    cached!.conn = await cached!.promise
    return cached!.conn
  } catch (e) {
    cached!.promise = null
    throw e
  }
}

/**
 * Get current connection status
 */
export function getConnectionStatus(): string {
  const state = mongoose.connection.readyState
  switch (state) {
    case 0: return 'disconnected'
    case 1: return 'connected'
    case 2: return 'connecting'
    case 3: return 'disconnecting'
    default: return 'unknown'
  }
}

/**
 * Gracefully close the database connection
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached!.conn) {
    console.log('[MongoDB] Closing connection...')
    await cached!.conn.disconnect()
    cached!.conn = null
    cached!.promise = null
    console.log('[MongoDB] Connection closed.')
  }
}

// Default export for convenience
export default connectToDatabase