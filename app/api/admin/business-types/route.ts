import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import BusinessType from '@/models/BusinessType'

export async function GET() {
  try {
    await getDatabase()
    
    const businessTypes = await BusinessType.find({})
      .populate({
        path: 'customerIds',
        select: 'name slug',
        strictPopulate: false
      })
      .sort({ name: 1 })
      .lean()
    
    // Add customer count to each business type and handle missing customerIds
    const businessTypesWithCounts = businessTypes.map(bt => ({
      ...bt,
      customerIds: bt.customerIds || [],
      customerCount: bt.customerIds ? bt.customerIds.length : 0
    }))
    
    console.log('Found business types:', businessTypesWithCounts.length)
    return NextResponse.json(businessTypesWithCounts)
  } catch (error) {
    console.error('Error fetching business types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business types', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    await getDatabase()
    
    // Check if business type with same name already exists
    const existingBusinessType = await BusinessType.findOne({ 
      name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') }
    })
    
    if (existingBusinessType) {
      return NextResponse.json(
        { error: 'Business type with this name already exists' },
        { status: 400 }
      )
    }
    
    const businessType = new BusinessType({
      name: data.name.trim(),
      customerIds: []
    })
    
    await businessType.save()
    
    // Populate and return with customer count
    const populatedBusinessType = await BusinessType.findById(businessType._id)
      .populate({
        path: 'customerIds',
        select: 'name slug',
        strictPopulate: false
      })
      .lean()
    
    return NextResponse.json({
      ...populatedBusinessType,
      customerCount: 0
    })
  } catch (error) {
    console.error('Error creating business type:', error)
    return NextResponse.json(
      { error: 'Failed to create business type', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { _id, ...updateData } = data
    
    if (!_id) {
      return NextResponse.json(
        { error: 'Business type ID is required' },
        { status: 400 }
      )
    }
    
    await getDatabase()
    
    // Check if business type with same name already exists (excluding current one)
    const existingBusinessType = await BusinessType.findOne({ 
      name: { $regex: new RegExp(`^${updateData.name.trim()}$`, 'i') },
      _id: { $ne: _id }
    })
    
    if (existingBusinessType) {
      return NextResponse.json(
        { error: 'Business type with this name already exists' },
        { status: 400 }
      )
    }
    
    const businessType = await BusinessType.findByIdAndUpdate(
      _id,
      { name: updateData.name.trim() },
      { new: true, runValidators: true }
    ).populate({
      path: 'customerIds',
      select: 'name slug',
      strictPopulate: false
    })
    
    if (!businessType) {
      return NextResponse.json(
        { error: 'Business type not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      ...businessType.toObject(),
      customerCount: businessType.customerIds ? businessType.customerIds.length : 0
    })
  } catch (error) {
    console.error('Error updating business type:', error)
    return NextResponse.json(
      { error: 'Failed to update business type', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Business type ID is required' },
        { status: 400 }
      )
    }
    
    await getDatabase()
    
    // Get the business type with customer info
    const businessType = await BusinessType.findById(id).populate({
      path: 'customerIds',
      select: 'name',
      strictPopulate: false
    })
    
    if (!businessType) {
      return NextResponse.json(
        { error: 'Business type not found' },
        { status: 404 }
      )
    }
    
    // Check if any customers are using this business type
    if (businessType.customerIds && businessType.customerIds.length > 0) {
      const customerCount = businessType.customerIds.length
      const customerNames = (businessType.customerIds as any[]).map(c => c.name).join(', ')
      
      return NextResponse.json(
        { 
          error: `Cannot delete business type "${businessType.name}". It is currently used by ${customerCount} customer${customerCount > 1 ? 's' : ''}: ${customerNames}. Please reassign all customers to a different business type before deletion.`,
          customerCount,
          customerNames: customerNames
        },
        { status: 409 }
      )
    }
    
    await BusinessType.findByIdAndDelete(id)
    
    return NextResponse.json({ 
      message: 'Business type deleted successfully',
      deletedBusinessType: businessType.name
    })
  } catch (error) {
    console.error('Error deleting business type:', error)
    return NextResponse.json(
      { error: 'Failed to delete business type', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 