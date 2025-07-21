import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import BusinessType from '@/models/BusinessType'

export async function GET() {
  try {
    const db = await getDatabase()
    
    const businessTypes = await BusinessType.find({})
      .populate({
        path: 'customers',
        select: 'name slug'
      })
      .select('name')
    
    return NextResponse.json(businessTypes)
  } catch (error) {
    console.error('Error fetching business types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business types' },
      { status: 500 }
    )
  }
} 