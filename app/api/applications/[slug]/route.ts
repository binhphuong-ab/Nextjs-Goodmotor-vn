import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Application from '@/models/Application'
import connectToDatabase from '@/lib/mongoose'

// GET /api/applications/[slug] - Get application by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase()
    
    const { slug } = params
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      )
    }
    
    const application = await Application.findOne({ 
      slug: slug, 
      isActive: true  // Only return active applications for public viewing
    })
    .populate('recommendedIndustries', 'name slug')  // Populate industry references
    .lean()
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(application)
  } catch (error: any) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}
