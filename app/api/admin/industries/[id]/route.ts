import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Industry from '@/models/Industry'
import connectToDatabase from '@/lib/mongoose'

// GET /api/admin/industries/[id] - Get single industry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const industry = await Industry.findById(params.id).lean()
    
    if (!industry) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(industry)
  } catch (error) {
    console.error('Error fetching industry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch industry' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/industries/[id] - Update industry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    
    const updatedIndustry = await Industry.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    )
    
    if (!updatedIndustry) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedIndustry)
  } catch (error: any) {
    console.error('Error updating industry:', error)
    
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
      { error: 'Failed to update industry' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/industries/[id] - Delete industry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const deletedIndustry = await Industry.findByIdAndDelete(params.id)
    
    if (!deletedIndustry) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Industry deleted successfully' })
  } catch (error) {
    console.error('Error deleting industry:', error)
    return NextResponse.json(
      { error: 'Failed to delete industry' },
      { status: 500 }
    )
  }
}
