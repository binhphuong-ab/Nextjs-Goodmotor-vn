import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Industry from '@/models/Industry'
import Customer from '@/models/Customer'

// Connect to MongoDB using Mongoose
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return
  }
  
  await mongoose.connect(process.env.MONGODB_URI as string)
}

export async function GET() {
  try {
    await connectToDatabase()
    
    // Test basic operations
    const industryCount = await Industry.countDocuments()
    const customerCount = await Customer.countDocuments()
    
    // Test if we can fetch industries (needed for customer form)
    const industries = await Industry.find({ isActive: true }).limit(5)
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      mongodb_uri: process.env.MONGODB_URI ? 'configured' : 'missing',
      collections: {
        industries: industryCount,
        customers: customerCount
      },
      sample_industries: industries.map(i => ({ id: i._id, name: i.name })),
      mongoose_state: mongoose.connections[0].readyState,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        mongodb_uri: process.env.MONGODB_URI ? 'configured' : 'missing'
      },
      { status: 500 }
    )
  }
} 