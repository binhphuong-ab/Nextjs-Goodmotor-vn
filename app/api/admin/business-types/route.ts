import { getDatabase } from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'
import BusinessType, { IBusinessTypeInput } from '@/models/BusinessType'

// GET all business types with customer information
export async function GET() {
  try {
    const db = await getDatabase()
    
    const businessTypes = await BusinessType.find({})
      .populate({
        path: 'customers',
        select: 'name slug customerStatus'
      })
      .sort({ name: 1 })
    
    // Add customer count to each business type using virtual field
    const businessTypesWithCount = businessTypes.map(bt => ({
      _id: bt._id,
      name: bt.name,
      customers: bt.customers || [],
      customerCount: bt.customers ? bt.customers.length : 0,
      createdAt: bt.createdAt,
      updatedAt: bt.updatedAt
    }))
    
    return NextResponse.json(businessTypesWithCount)
  } catch (error) {
    console.error('Error fetching business types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business types' },
      { status: 500 }
    )
  }
}

// POST new business type
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const data: IBusinessTypeInput = await request.json()
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }
    
    // Check if name already exists
    const existingBusinessType = await BusinessType.findOne({ 
      name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') }
    })
    if (existingBusinessType) {
      return NextResponse.json(
        { error: 'Business type with this name already exists' },
        { status: 409 }
      )
    }
    
    const businessType = new BusinessType({
      name: data.name.trim()
    })
    
    await businessType.save()
    
    // Populate virtual field for response
    await businessType.populate({
      path: 'customers',
      select: 'name slug'
      })
    
    return NextResponse.json({
      _id: businessType._id,
      name: businessType.name,
      customers: businessType.customers || [],
      customerCount: businessType.customers ? businessType.customers.length : 0,
      createdAt: businessType.createdAt,
      updatedAt: businessType.updatedAt
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating business type:', error)
    return NextResponse.json(
      { error: 'Failed to create business type' },
      { status: 500 }
    )
  }
}

// PUT update business type
export async function PUT(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const data: IBusinessTypeInput = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Business type ID is required' },
        { status: 400 }
      )
    }
    
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }
    
    // Check if name already exists (excluding current business type)
    const existingBusinessType = await BusinessType.findOne({ 
      name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') },
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
      { name: data.name.trim() },
      { new: true, runValidators: true }
    ).populate({
      path: 'customers',
      select: 'name slug'
    })
    
    if (!businessType) {
      return NextResponse.json(
        { error: 'Business type not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      _id: businessType._id,
      name: businessType.name,
      customers: businessType.customers || [],
      customerCount: businessType.customers ? businessType.customers.length : 0,
      createdAt: businessType.createdAt,
      updatedAt: businessType.updatedAt
    })
  } catch (error) {
    console.error('Error updating business type:', error)
    return NextResponse.json(
      { error: 'Failed to update business type' },
      { status: 500 }
    )
  }
}

// DELETE business type
export async function DELETE(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
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
      return NextResponse.json(
        { 
          error: `Cannot delete business type. It is currently assigned to ${customerCount} customer(s): ${customerNames}` 
        },
        { status: 400 }
      )
    }
    
    await BusinessType.findByIdAndDelete(id)
    
    return NextResponse.json({ message: 'Business type deleted successfully' })
  } catch (error) {
    console.error('Error deleting business type:', error)
    return NextResponse.json(
      { error: 'Failed to delete business type' },
      { status: 500 }
    )
  }
} 