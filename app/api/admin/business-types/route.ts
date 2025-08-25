import { NextRequest, NextResponse } from 'next/server'
import { BUSINESS_TYPES } from '@/types/customer'
import Customer from '@/models/Customer'
import connectToDatabase from '@/lib/mongoose'

// GET /api/admin/business-types - Get all business types with customer counts
export async function GET() {
  try {
    await connectToDatabase()
    
    // Get business types from constants with customer counts
    const businessTypesWithCounts = await Promise.all(
      BUSINESS_TYPES.map(async (businessType) => {
        const customerCount = await Customer.countDocuments({ 
          businessType: businessType.value 
        })
        
        return {
          _id: businessType.value,
          name: businessType.label,
          value: businessType.value,
          customerCount
        }
      })
    )
    
    return NextResponse.json({ businessTypes: businessTypesWithCounts })
  } catch (error) {
    console.error('Error fetching business types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business types' },
      { status: 500 }
    )
  }
}

// POST /api/admin/business-types - Business types are constants, so this should not be used
// But if needed for compatibility, we can return an error
export async function POST(request: NextRequest) {
  console.log('[API] POST business-types: Received request to create business type')
  
  try {
    const body = await request.json()
    console.log('[API] POST business-types: Request body:', body)
    
    // Check if business type already exists in constants
    const existingBusinessType = BUSINESS_TYPES.find(bt => bt.label === body.name || bt.value === body.name)
    
    if (existingBusinessType) {
      console.log('[API] POST business-types: Business type with this name already exists')
      return NextResponse.json(
        { error: 'Business type already exists in predefined constants' },
        { status: 400 }
      )
    }
    
    console.log('[API] POST business-types: Business types are predefined constants and cannot be created dynamically')
    return NextResponse.json(
      { 
        error: 'Business types are predefined constants. Please update the BUSINESS_TYPES constant in types/customer.ts to add new business types.' 
      },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('[API] POST business-types: Error creating business type:', error)
    return NextResponse.json(
      { error: 'Failed to create business type' },
      { status: 500 }
    )
  }
}
