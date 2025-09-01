import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Customer from '@/models/Customer'

import Industry from '@/models/Industry' // Import Industry model to register schema
import connectToDatabase from '@/lib/mongoose'

// GET /api/customers - Fetch all customers for public display (featured customers can be filtered separately)
export async function GET() {
  try {
    await connectToDatabase()
    console.log('[API] GET customers: Database connected successfully')
    
    // Ensure models are registered for population
    // This fixes the MissingSchemaError by forcing model registration
    Industry.modelName // Access Industry model to ensure it's registered
    
    let customers
    
    try {
      // Try to fetch customers with full population
      customers = await Customer.find(
        {},
        {
          name: 1,
          slug: 1,
          businessType: 1,
          industry: 1,
          website: 1,
          logo: 1,
          province: 1,
          nationality: 1,

          description: 1,
          projects: 1,
          pumpModelsUsed: 1,
          applications: 1,
          featured: 1,
          createdAt: 1
        }
      )

      .populate({
        path: 'industry',
        select: 'name slug',
        strictPopulate: false
      })
      .sort({ featured: -1, nationality: -1, createdAt: -1 })
      
      console.log(`[API] GET customers: Found ${customers.length} customers`)
      
    } catch (populateError) {
      console.warn('[API] GET customers: Population failed, fetching without population:', populateError)
      
      // Fallback: fetch without population if there are schema issues
      customers = await Customer.find(
        {},
        {
          name: 1,
          slug: 1,
          businessType: 1,
          industry: 1,
          website: 1,
          logo: 1,
          province: 1,
          nationality: 1,

          description: 1,
          projects: 1,
          pumpModelsUsed: 1,
          applications: 1,
          featured: 1,
          createdAt: 1
        }
      )
      .sort({ featured: -1, nationality: -1, createdAt: -1 })
      
      console.log(`[API] GET customers: Found ${customers.length} customers (without population)`)
    }
    
    return NextResponse.json(customers)
  } catch (error) {
    console.error('[API] GET customers: Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
} 