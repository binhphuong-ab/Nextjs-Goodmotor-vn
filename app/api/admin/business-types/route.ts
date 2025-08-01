import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import BusinessType, { IBusinessTypeInput } from '@/models/BusinessType'
// Import Customer model to ensure it's registered
import Customer from '@/models/Customer'

// GET all business types with customer information
export async function GET() {
  try {
    await connectToDatabase()
    console.log('[API] GET business-types: Database connected successfully')
    
    // Get business types without trying to populate customers for now
    const businessTypes = await BusinessType.find({})
      .sort({ name: 1 })
    
    console.log(`[API] GET business-types: Found ${businessTypes.length} business types`)
    
    // Add customer count to each business type (simplified for now)
    const businessTypesWithCount = businessTypes.map(bt => ({
      _id: bt._id,
      name: bt.name,
      customers: [], // TODO: Fix customer population after Customer model is properly registered
      customerCount: 0, // TODO: Calculate actual customer count
      createdAt: bt.createdAt,
      updatedAt: bt.updatedAt
    }))
    
    return NextResponse.json(businessTypesWithCount)
  } catch (error) {
    console.error('Error fetching business types:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch business types', details: errorMessage },
      { status: 500 }
    )
  }
}

// POST new business type
export async function POST(request: NextRequest) {
  console.log('[API] POST business-types: Received request to create business type')
  try {
    console.log('[API] POST business-types: Connecting to database...')
    await connectToDatabase()
    console.log('[API] POST business-types: Database connected successfully')

    const data: IBusinessTypeInput = await request.json()
    console.log('[API] POST business-types: Request body:', data)
    
    // Validate required fields
    if (!data.name || !data.name.trim()) {
      console.log('[API] POST business-types: Validation failed - name is required')
      return NextResponse.json(
        { error: 'Business type name is required' },
        { status: 400 }
      )
    }
    
    const trimmedName = data.name.trim()
    console.log(`[API] POST business-types: Checking for existing business type with name: "${trimmedName}"`)
    
    // Check if name already exists (case insensitive)
    const existingBusinessType = await BusinessType.findOne({ 
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    })
    
    if (existingBusinessType) {
      console.log('[API] POST business-types: Business type with this name already exists')
      return NextResponse.json(
        { error: 'Business type with this name already exists' },
        { status: 409 }
      )
    }
    
    console.log('[API] POST business-types: No existing business type found. Creating new one...')
    
    const businessType = new BusinessType({
      name: trimmedName
    })
    
    console.log('[API] POST business-types: New BusinessType instance created:', businessType.toObject())
    console.log('[API] POST business-types: Saving to database...')
    
    await businessType.save()
    console.log('[API] POST business-types: Business type saved successfully with ID:', businessType._id)
    
    // Return response without trying to populate customers (which causes the error)
    const response = {
      _id: businessType._id,
      name: businessType.name,
      customers: [], // Empty array since it's a new business type
      customerCount: 0,
      createdAt: businessType.createdAt,
      updatedAt: businessType.updatedAt
    }
    
    console.log('[API] POST business-types: Returning success response:', response)
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('[API] POST business-types: Error creating business type:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create business type', details: errorMessage },
      { status: 500 }
    )
  }
}

// PUT update business type
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()
    console.log('[API] PUT business-types: Database connected successfully')
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const data: IBusinessTypeInput = await request.json()
    
    console.log(`[API] PUT business-types: Updating business type ${id} with data:`, data)
    
    if (!id) {
      return NextResponse.json(
        { error: 'Business type ID is required' },
        { status: 400 }
      )
    }
    
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: 'Business type name is required' },
        { status: 400 }
      )
    }
    
    const trimmedName = data.name.trim()
    
    // Check if name already exists (excluding current business type)
    const existingBusinessType = await BusinessType.findOne({ 
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      _id: { $ne: id }
    })
    
    if (existingBusinessType) {
      return NextResponse.json(
        { error: 'Business type with this name already exists' },
        { status: 409 }
      )
    }
    
    const businessType = await BusinessType.findByIdAndUpdate(
      id,
      { name: trimmedName },
      { new: true, runValidators: true }
    ).populate({
      path: 'customers',
      select: 'name slug customerStatus'
    })
    
    if (!businessType) {
      return NextResponse.json(
        { error: 'Business type not found' },
        { status: 404 }
      )
    }
    
    console.log('[API] PUT business-types: Business type updated successfully')
    
    return NextResponse.json({
      _id: businessType._id,
      name: businessType.name,
      customers: businessType.customers || [],
      customerCount: businessType.customers ? businessType.customers.length : 0,
      createdAt: businessType.createdAt,
      updatedAt: businessType.updatedAt
    })
  } catch (error) {
    console.error('[API] PUT business-types: Error updating business type:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to update business type', details: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE business type
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()
    console.log('[API] DELETE business-types: Database connected successfully')
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    console.log(`[API] DELETE business-types: Attempting to delete business type ${id}`)
    
    if (!id) {
      return NextResponse.json(
        { error: 'Business type ID is required' },
        { status: 400 }
      )
    }
    
    // Check if business type has associated customers using virtual field
    const businessType = await BusinessType.findById(id).populate({
      path: 'customers',
      select: 'name'
    })
    
    if (!businessType) {
      return NextResponse.json(
        { error: 'Business type not found' },
        { status: 404 }
      )
    }
    
    if (businessType.customers && businessType.customers.length > 0) {
      const customerCount = businessType.customers.length
      const customerNames = (businessType.customers as any[]).map(c => c.name).join(', ')
      console.log(`[API] DELETE business-types: Cannot delete - business type has ${customerCount} customers`)
      return NextResponse.json(
        { 
          error: `Cannot delete business type. It is currently assigned to ${customerCount} customer(s): ${customerNames}` 
        },
        { status: 400 }
      )
    }
    
    await BusinessType.findByIdAndDelete(id)
    console.log('[API] DELETE business-types: Business type deleted successfully')
    
    return NextResponse.json({ 
      message: 'Business type deleted successfully',
      deletedBusinessType: businessType.name
    })
  } catch (error) {
    console.error('[API] DELETE business-types: Error deleting business type:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to delete business type', details: errorMessage },
      { status: 500 }
    )
  }
} 