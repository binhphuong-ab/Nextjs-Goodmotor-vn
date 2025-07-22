import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Customer, { ICustomerInput } from '@/models/Customer'
import BusinessType from '@/models/BusinessType'

// Connect to MongoDB using Mongoose
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return
  }
  
  await mongoose.connect(process.env.MONGODB_URI as string)
}

// GET /api/admin/customers - Fetch all customers
export async function GET() {
  try {
    await connectToDatabase()
    const customers = await Customer.find({}).sort({ createdAt: -1 })
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// POST /api/admin/customers - Create new customer
export async function POST(request: Request) {
  try {
    await connectToDatabase()
    const body: ICustomerInput = await request.json()
    
    // Check if slug already exists
    const existingCustomer = await Customer.findOne({ slug: body.slug })
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer slug already exists' },
        { status: 400 }
      )
    }
    
    // Create the customer
    const customer = new Customer(body)
    await customer.save()
    
    // Populate references for response
    await customer.populate([
      { path: 'businessType', select: 'name' },
      { path: 'industry', select: 'name slug' }
    ])
    
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
} 