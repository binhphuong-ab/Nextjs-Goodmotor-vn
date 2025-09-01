import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import Customer, { ICustomerInput } from '@/models/Customer'

import Industry from '@/models/Industry'

// GET /api/admin/customers/[id] - Fetch single customer
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    console.log(`[API] GET customer: Fetching customer ${params.id}`)
    
    // Ensure models are registered for population
    // This fixes the MissingSchemaError by forcing model registration
    Industry.modelName // Access Industry model to ensure it's registered
    
    const customer = await Customer.findById(params.id)
      .populate('industry', 'name slug')
    
    if (!customer) {
      console.log(`[API] GET customer: Customer ${params.id} not found`)
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    console.log(`[API] GET customer: Found customer ${customer.name}`)
    return NextResponse.json(customer)
  } catch (error) {
    console.error('[API] GET customer: Error fetching customer:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch customer', details: errorMessage },
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
    console.log(`[API] PUT customer: Updating customer ${params.id}`)
    
    const body: ICustomerInput = await request.json()
    console.log('[API] PUT customer: Request body:', body)
    
    // Validate required fields
    if (!body.name || !body.slug || !body.businessType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, and businessType are required' },
        { status: 400 }
      )
    }
    
    // Check if slug already exists for a different customer
    const existingCustomer = await Customer.findOne({ 
      slug: body.slug, 
      _id: { $ne: params.id } 
    })
    if (existingCustomer) {
      console.log('[API] PUT customer: Slug already exists for different customer')
      return NextResponse.json(
        { error: 'Customer slug already exists' },
        { status: 400 }
      )
    }
    
    // Validate businessType enum
    const validBusinessTypes = [
      'Machinary service',
      'Nhà chế tạo máy', 
      'Nhà máy Việt Nam',
      'Nhà máy nước ngoài',
      'Xưởng sản xuất'
    ]
    if (!validBusinessTypes.includes(body.businessType)) {
      return NextResponse.json(
        { error: 'Invalid business type' },
        { status: 400 }
      )
    }
    
    // Verify industry IDs if provided
    if (body.industry && body.industry.length > 0) {
      const industryCount = await Industry.countDocuments({ _id: { $in: body.industry } })
      if (industryCount !== body.industry.length) {
        return NextResponse.json(
          { error: 'One or more invalid industry IDs' },
          { status: 400 }
        )
      }
    }
    
    // Ensure models are registered for population
    // This fixes the MissingSchemaError by forcing model registration
    Industry.modelName // Access Industry model to ensure it's registered
    
    const customer = await Customer.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate([
      { path: 'industry', select: 'name slug' }
    ])
    
    if (!customer) {
      console.log(`[API] PUT customer: Customer ${params.id} not found`)
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    console.log(`[API] PUT customer: Customer ${customer.name} updated successfully`)
    return NextResponse.json(customer)
  } catch (error) {
    console.error('[API] PUT customer: Detailed error updating customer:', error)
    
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
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to update customer',
        details: errorMessage,
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
    console.log(`[API] DELETE customer: Deleting customer ${params.id}`)
    
    // Check if customer exists
    const customer = await Customer.findById(params.id)
    if (!customer) {
      console.log(`[API] DELETE customer: Customer ${params.id} not found`)
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    // Delete the customer
    await Customer.findByIdAndDelete(params.id)
    
    console.log(`[API] DELETE customer: Customer ${customer.name} deleted successfully`)
    return NextResponse.json({ 
      message: 'Customer deleted successfully',
      deletedCustomer: customer.name
    })
  } catch (error) {
    console.error('[API] DELETE customer: Error deleting customer:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to delete customer', details: errorMessage },
      { status: 500 }
    )
  }
} 