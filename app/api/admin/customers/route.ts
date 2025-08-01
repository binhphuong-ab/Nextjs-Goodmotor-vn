import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import Customer, { ICustomerInput } from '@/models/Customer'
import BusinessType from '@/models/BusinessType'
import Industry from '@/models/Industry'

// GET /api/admin/customers - Fetch all customers
export async function GET() {
  try {
    await connectToDatabase()
    console.log('[API] GET customers: Database connected successfully')
    
    const customers = await Customer.find({})
      .populate('businessType', 'name')
      .populate('industry', 'name slug')
      .sort({ createdAt: -1 })
    
    console.log(`[API] GET customers: Found ${customers.length} customers`)
    return NextResponse.json(customers)
  } catch (error) {
    console.error('[API] GET customers: Error fetching customers:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch customers', details: errorMessage },
      { status: 500 }
    )
  }
}

// POST /api/admin/customers - Create new customer
export async function POST(request: Request) {
  try {
    await connectToDatabase()
    console.log('[API] POST customers: Database connected successfully')
    
    const body: ICustomerInput = await request.json()
    console.log('[API] POST customers: Request body:', body)
    
    // Validate required fields
    if (!body.name || !body.slug || !body.businessType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, and businessType are required' },
        { status: 400 }
      )
    }
    
    // Check if slug already exists
    const existingCustomer = await Customer.findOne({ slug: body.slug })
    if (existingCustomer) {
      console.log('[API] POST customers: Slug already exists')
      return NextResponse.json(
        { error: 'Customer slug already exists' },
        { status: 400 }
      )
    }
    
    // Verify businessType exists
    const businessType = await BusinessType.findById(body.businessType)
    if (!businessType) {
      return NextResponse.json(
        { error: 'Invalid business type ID' },
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
    
    // Create the customer
    const customer = new Customer(body)
    await customer.save()
    
    console.log('[API] POST customers: Customer created successfully with ID:', customer._id)
    
    // Populate references for response
    await customer.populate([
      { path: 'businessType', select: 'name' },
      { path: 'industry', select: 'name slug' }
    ])
    
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('[API] POST customers: Error creating customer:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create customer', details: errorMessage },
      { status: 500 }
    )
  }
} 