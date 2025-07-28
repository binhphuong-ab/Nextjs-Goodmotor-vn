import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Industry from '@/models/Industry'

// Connect to MongoDB
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return
  }
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined')
  }
  
  await mongoose.connect(process.env.MONGODB_URI)
}

// GET /api/admin/industries - Get all industries for admin forms
export async function GET() {
  try {
    await connectToDatabase()
    
    const industries = await Industry.find({})
      .select('_id name slug')
      .sort({ displayOrder: 1, name: 1 })
      .lean()
    
    return NextResponse.json({ industries })
  } catch (error) {
    console.error('Error fetching industries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch industries' },
      { status: 500 }
    )
  }
} 