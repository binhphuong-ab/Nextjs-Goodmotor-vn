import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Customer from '@/models/Customer'

import Industry from '@/models/Industry' // Import Industry model to register schema
import connectToDatabase from '@/lib/mongoose'

// GET /api/customers/[slug] - Fetch individual customer by slug
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase()
    console.log(`[API] GET customer: Fetching customer with slug ${params.slug}`)
    
    let customer
    
    try {
      // Try to fetch customer with full population
      customer = await Customer.findOne({ 
        slug: params.slug
      })

      .populate({
        path: 'industry',
        select: 'name slug',
        strictPopulate: false
      })
      
      console.log(`[API] GET customer: Customer found with population: ${customer ? 'Yes' : 'No'}`)
      
    } catch (populateError) {
      console.warn(`[API] GET customer: Population failed for ${params.slug}, fetching without population:`, populateError)
      
      // Fallback: fetch without population if there are schema issues
      customer = await Customer.findOne({ 
        slug: params.slug
      })
      
      console.log(`[API] GET customer: Customer found without population: ${customer ? 'Yes' : 'No'}`)
    }
    
    if (!customer) {
      console.log(`[API] GET customer: Customer ${params.slug} not found`)
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    console.log(`[API] GET customer: Successfully returning customer ${customer.name}`)
    return NextResponse.json(customer)
  } catch (error) {
    console.error(`[API] GET customer: Error fetching customer ${params.slug}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
} 