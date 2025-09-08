import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Industry from '@/models/Industry'
import connectToDatabase from '@/lib/mongoose'

// GET /api/admin/industries - Get all industries for admin use
export async function GET() {
  try {
    await connectToDatabase()
    
    const industries = await Industry.find({})
      .select('name slug description isActive displayOrder')
      .sort({ displayOrder: 1, name: 1 })
      .lean()
    
    // Return in the format expected by ApplicationForm: { industries: [...] }
    return NextResponse.json({ industries })
  } catch (error) {
    console.error('Error fetching industries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch industries' },
      { status: 500 }
    )
  }
}

// POST /api/admin/industries - Create new industry
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    
    const industry = new Industry(body)
    const savedIndustry = await industry.save()
    
    return NextResponse.json(savedIndustry, { status: 201 })
  } catch (error: any) {
    console.error('Error creating industry:', error)
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: errorMessages },
        { status: 400 }
      )
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Industry slug already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create industry' },
      { status: 500 }
    )
  }
}