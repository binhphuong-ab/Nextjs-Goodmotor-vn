import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Customer from '@/models/Customer'
import BusinessType from '@/models/BusinessType'
import Industry from '@/models/Industry' // Import Industry model to register schema

// Connect to MongoDB using Mongoose
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return
  }
  
  await mongoose.connect(process.env.MONGODB_URI as string)
}

// GET /api/customers - Fetch active customers for public display
export async function GET() {
  try {
    await connectToDatabase()
    console.log('[API] GET customers: Database connected successfully')
    
    let customers
    
    try {
      // Try to fetch customers with full population
      customers = await Customer.find(
        { isActive: true },
        {
          name: 1,
          slug: 1,
          businessType: 1,
          industry: 1,
          website: 1,
          logo: 1,
          customerStatus: 1,
          customerTier: 1,
          completeDate: 1,
          description: 1,
          isActive: 1,
          createdAt: 1
        }
      )
      .populate({
        path: 'businessType',
        select: 'name',
        strictPopulate: false
      })
      .populate({
        path: 'industry',
        select: 'name slug',
        strictPopulate: false
      })
      .sort({ customerTier: -1, createdAt: -1 })
      
      console.log(`[API] GET customers: Found ${customers.length} customers`)
      
    } catch (populateError) {
      console.warn('[API] GET customers: Population failed, fetching without population:', populateError)
      
      // Fallback: fetch without population if there are schema issues
      customers = await Customer.find(
        { isActive: true },
        {
          name: 1,
          slug: 1,
          businessType: 1,
          industry: 1,
          website: 1,
          logo: 1,
          customerStatus: 1,
          customerTier: 1,
          completeDate: 1,
          description: 1,
          isActive: 1,
          createdAt: 1
        }
      )
      .sort({ customerTier: -1, createdAt: -1 })
      
      console.log(`[API] GET customers: Found ${customers.length} customers (without population)`)
    }
    
    return NextResponse.json(customers)
  } catch (error) {
    console.error('[API] GET customers: Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
} 