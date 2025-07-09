import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import BusinessType, { IBusinessTypeInput } from '@/models/BusinessType'

// GET all business types
export async function GET() {
  try {
    const db = await getDatabase()
    
    const businessTypes = await BusinessType.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .select('name slug description category displayOrder stats')
    
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
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }
    
    // Check if slug already exists
    const existingBusinessType = await BusinessType.findOne({ slug: data.slug })
    if (existingBusinessType) {
      return NextResponse.json(
        { error: 'Business type with this slug already exists' },
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