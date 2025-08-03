import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Industry from '@/models/Industry'
import Customer from '@/models/Customer'
import connectToDatabase from '@/lib/mongoose'

// GET /api/industries/[id]/customers - Get customers for a specific industry
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // active, inactive, etc.
    const businessType = searchParams.get('businessType')
    const limit = parseInt(searchParams.get('limit') || '0')
    const page = parseInt(searchParams.get('page') || '1')
    
    // First, verify the industry exists
    const industry = await Industry.findById(params.id)
    if (!industry) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      )
    }
    
    // Build query for customers
    let query: any = { industry: params.id }
    
    if (status) {
      query.customerStatus = status
    }
    
    if (businessType) {
      query.businessType = businessType
    }
    
    // Execute query with pagination
    let customerQuery = Customer.find(query)
      .populate('industry', 'name slug category')
      .sort({ name: 1 })
    
    if (limit > 0) {
      const skip = (page - 1) * limit
      customerQuery = customerQuery.skip(skip).limit(limit)
    }
    
    const customers = await customerQuery
    
    // Get total count for pagination
    const totalCount = await Customer.countDocuments(query)
    
    // Prepare response
    const response: any = {
      customers,
      industry: {
        _id: industry._id,
        name: industry.name,
        slug: industry.slug,
        category: industry.category
      },
      pagination: {
        total: totalCount,
        page,
        limit: limit || totalCount,
        pages: limit > 0 ? Math.ceil(totalCount / limit) : 1
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching customers for industry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers for industry' },
      { status: 500 }
    )
  }
} 