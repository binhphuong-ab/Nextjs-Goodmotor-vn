import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongoose'
import BusinessType from '@/models/BusinessType'

export async function GET() {
  try {
    await connectToDatabase()
    console.log('[API] GET /api/business-types: Database connected successfully')
    
    const businessTypes = await BusinessType.find({})
      .populate({
        path: 'customers',
        select: 'name slug'
      })
      .select('name')
      .sort({ name: 1 })
    
    console.log(`[API] GET /api/business-types: Found ${businessTypes.length} business types`)
    
    return NextResponse.json(businessTypes)
  } catch (error) {
    console.error('[API] GET /api/business-types: Error fetching business types:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch business types', details: errorMessage },
      { status: 500 }
    )
  }
} 