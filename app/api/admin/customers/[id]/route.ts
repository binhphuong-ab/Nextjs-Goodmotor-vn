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

// GET /api/admin/customers/[id] - Fetch single customer
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const customer = await Customer.findById(params.id)
    
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

// PUT /api/admin/customers/[id] - Update customer
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    const body: ICustomerInput = await request.json()
    
    // Check if slug already exists for a different customer
    const existingCustomer = await Customer.findOne({ 
      slug: body.slug, 
      _id: { $ne: params.id } 
    })
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer slug already exists' },
        { status: 400 }
      )
    }
    
    const customer = await Customer.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate([
      { path: 'businessType', select: 'name' },
      { path: 'industry', select: 'name slug' }
    ])

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Detailed error updating customer:', error)
    
    // Handle specific mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message)
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationErrors,
          full_error: error.message
        },
        { status: 400 }
      )
    }
    
    // Handle cast errors (invalid ObjectId)
    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        { 
          error: 'Invalid data format', 
          details: error.message
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update customer',
        details: error instanceof Error ? error.message : 'Unknown error',
        error_name: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/customers/[id] - Delete customer
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    // Check if customer exists
    const customer = await Customer.findById(params.id)
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    // Delete the customer (virtual field automatically handles relationship cleanup)
    await Customer.findByIdAndDelete(params.id)
    
    return NextResponse.json({ 
      message: 'Customer deleted successfully',
      deletedCustomer: customer.name
    })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
} 