import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Industry from '@/models/Industry'
import Customer from '@/models/Customer'
import Application from '@/models/Application'
import connectToDatabase from '@/lib/mongoose'

// GET /api/industries - Fetch all industries
export async function GET(request: Request) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const includeCustomers = searchParams.get('includeCustomers') === 'true'
    const includeApplications = searchParams.get('includeApplications') === 'true'
    const updateStats = searchParams.get('updateStats') === 'true'
    
    let query: any = {}
    
    if (category && category !== 'all') {
      query.category = category
    }
    
    let industriesQuery = Industry.find(query)
    
    // Optionally populate customers
    if (includeCustomers) {
      industriesQuery = industriesQuery.populate({
        path: 'customers',
        select: 'name slug businessType customerStatus',
        populate: {
          path: 'businessType',
          select: 'name'
        }
      })
    }
    
    // Optionally populate applications
    if (includeApplications) {
      industriesQuery = industriesQuery.populate('applications', 'name slug category')
    }
    
    const industries = await industriesQuery.sort({ displayOrder: 1, name: 1 })
    
    // Optionally update customer and application counts in stats
    if (updateStats) {
      try {
        await Promise.all(
          industries.map(async (industry: any) => {
            try {
              await industry.updateCustomerCount()
              await industry.updateApplicationCount()
            } catch (err) {
              console.error(`Error updating stats for industry ${industry.name}:`, err)
              // Continue with other industries even if one fails
            }
          })
        )
        // Refetch with updated stats
        let refetchQuery = Industry.find(query)
        if (includeCustomers) {
          refetchQuery = refetchQuery.populate({
            path: 'customers',
            select: 'name slug businessType customerStatus',
            populate: {
              path: 'businessType',
              select: 'name'
            }
          })
        }
        if (includeApplications) {
          refetchQuery = refetchQuery.populate('applications', 'name slug category')
        }
        return NextResponse.json(
          await refetchQuery.sort({ displayOrder: 1, name: 1 })
        )
      } catch (error) {
        console.error('Error updating industry stats:', error)
        // If stats update fails, return industries without updated stats
        return NextResponse.json(industries)
      }
    }
    
    return NextResponse.json(industries)
  } catch (error) {
    console.error('Error fetching industries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch industries' },
      { status: 500 }
    )
  }
}

// POST /api/industries - Create new industry
export async function POST(request: Request) {
  try {
    await connectToDatabase()
    
    const industryData = await request.json()
    
    // Generate slug if not provided
    if (!industryData.slug && industryData.name) {
      industryData.slug = industryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }
    
    const industry = new Industry(industryData)
    await industry.save()
    
    return NextResponse.json(industry, { status: 201 })
  } catch (error) {
    console.error('Error creating industry:', error)
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Industry name or slug already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create industry' },
      { status: 500 }
    )
  }
} 