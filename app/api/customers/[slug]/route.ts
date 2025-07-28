import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Customer from '@/models/Customer'

// Connect to MongoDB using Mongoose
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return
  }
  
  await mongoose.connect(process.env.MONGODB_URI as string)
}

// GET /api/customers/[slug] - Fetch individual customer by slug
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase()
    
    const customer = await Customer.findOne({ 
      slug: params.slug,
      isActive: true 
    })
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
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
} 