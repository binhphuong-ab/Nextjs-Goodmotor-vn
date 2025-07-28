import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Customer from '@/models/Customer'
import BusinessType from '@/models/BusinessType' // Ensure BusinessType model is registered

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
    
    // Only fetch active customers and limit the fields returned for public display
    const customers = await Customer.find(
      { isActive: true },
      {
        name: 1,
        slug: 1,
        businessType: 1,
        industry: 1,
        website: 1,
        logo: 1,
        'addresses.headquarters.city': 1,
        'addresses.headquarters.country': 1,
        customerStatus: 1,
        customerTier: 1,
        'technicalProfile.primaryApplications': 1,
        tags: 1,
        createdAt: 1
      }
    )
    .populate({
      path: 'businessType',
      select: 'name slug',
      strictPopulate: false
    })
    .populate({
      path: 'industry',
      select: 'name slug',
      strictPopulate: false
    })
    .sort({ customerTier: -1, createdAt: -1 }) // Sort by tier (enterprise first) then by newest
    
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
} 