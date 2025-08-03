import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Industry from '@/models/Industry'
import connectToDatabase from '@/lib/mongoose'

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