import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Application from '@/models/Application'
import connectToDatabase from '@/lib/mongoose'

// GET /api/admin/applications - Get all applications
export async function GET() {
  try {
    await connectToDatabase()
    
    const applications = await Application.find({})
      .populate('recommendedIndustries', 'name slug')
      .sort({ featured: -1, displayOrder: 1, name: 1 })
      .lean()
    
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST /api/admin/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    
    const application = new Application(body)
    const savedApplication = await application.save()
    
    return NextResponse.json(savedApplication, { status: 201 })
  } catch (error: any) {
    console.error('Error creating application:', error)
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: errorMessages },
        { status: 400 }
      )
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Application slug already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
} 