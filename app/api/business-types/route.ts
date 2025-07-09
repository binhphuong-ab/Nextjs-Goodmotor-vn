import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import BusinessType, { IBusinessTypeInput } from '@/models/BusinessType'

// GET all business types
export async function GET() {
  try {
    const db = await getDatabase()
    
    const businessTypes = await BusinessType.find({})
      .sort({ name: 1 })
      .select('name customerIds')
    
    return NextResponse.json(businessTypes, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch business types:', error)
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
    
    const businessType = new BusinessType(data)
    await businessType.save()
    
    return NextResponse.json(businessType, { status: 201 })
  } catch (error) {
    console.error('Failed to create business type:', error)
    return NextResponse.json(
      { error: 'Failed to create business type' },
      { status: 500 }
    )
  }
} 