import { NextRequest, NextResponse } from 'next/server'
import PumpType, { IPumpTypeInput } from '@/models/PumpType'
import mongoose from 'mongoose'
import connectToDatabase from '@/lib/mongoose'

// GET all pump types
export async function GET() {
  try {
    // Ensure database connection
    await connectToDatabase()
    
    const pumpTypes = await PumpType.find({})
      .sort({ pumpType: 1 })
    
    // Add product usage data safely
    const pumpTypesWithUsage = await Promise.all(
      pumpTypes.map(async (pumpType) => {
        try {
          // Query products using this pump type
          const db = mongoose.connection.db
          if (!db) {
            throw new Error('Database not available')
          }
          
          const products = await db.collection('products').find({
            pumpType: pumpType._id
          }, { 
            projection: { name: 1 } 
          }).toArray()
          
          const productUsage = products.map((product: any) => product.name)
          
          return {
            ...pumpType.toObject(),
            productUsage
          }
        } catch (usageError) {
          console.error('Error getting usage for pump type:', pumpType.pumpType, usageError)
          // Return pump type without usage data if there's an error
          return {
            ...pumpType.toObject(),
            productUsage: []
          }
        }
      })
    )
    
    return NextResponse.json(pumpTypesWithUsage)
  } catch (error) {
    console.error('Error fetching pump types:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch pump types', details: errorMessage },
      { status: 500 }
    )
  }
}

// POST new pump type
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const db = mongoose.connection.db
    const data: IPumpTypeInput = await request.json()
    
    // Validate required fields
    if (!data.pumpType) {
      return NextResponse.json(
        { error: 'Pump type is required' },
        { status: 400 }
      )
    }

    if (!data.slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      )
    }
    
    // Check if pump type already exists
    const existingPumpType = await PumpType.findOne({ 
      pumpType: { $regex: new RegExp(`^${data.pumpType.trim()}$`, 'i') }
    })
    if (existingPumpType) {
      return NextResponse.json(
        { error: 'Pump type with this name already exists' },
        { status: 409 }
      )
    }

    // Check if slug already exists
    const existingSlug = await PumpType.findOne({ 
      slug: data.slug.trim().toLowerCase()
    })
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Pump type with this slug already exists' },
        { status: 409 }
      )
    }
    
    const pumpType = new PumpType({
      pumpType: data.pumpType.trim(),
      slug: data.slug.trim().toLowerCase()
    })
    
    await pumpType.save()
    
    return NextResponse.json(pumpType, { status: 201 })
  } catch (error) {
    console.error('Error creating pump type:', error)
    return NextResponse.json(
      { error: 'Failed to create pump type' },
      { status: 500 }
    )
  }
}

// PUT update pump type
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()
    const db = mongoose.connection.db
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const data: IPumpTypeInput = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Pump type ID is required' },
        { status: 400 }
      )
    }
    
    if (!data.pumpType) {
      return NextResponse.json(
        { error: 'Pump type is required' },
        { status: 400 }
      )
    }

    if (!data.slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      )
    }
    
    // Check if pump type already exists (excluding current pump type)
    const existingPumpType = await PumpType.findOne({ 
      pumpType: { $regex: new RegExp(`^${data.pumpType.trim()}$`, 'i') },
      _id: { $ne: id }
    })
    if (existingPumpType) {
      return NextResponse.json(
        { error: 'Pump type with this name already exists' },
        { status: 409 }
      )
    }

    // Check if slug already exists (excluding current pump type)
    const existingSlug = await PumpType.findOne({ 
      slug: data.slug.trim().toLowerCase(),
      _id: { $ne: id }
    })
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Pump type with this slug already exists' },
        { status: 409 }
      )
    }
    
    const pumpType = await PumpType.findByIdAndUpdate(
      id,
      {
        pumpType: data.pumpType.trim(),
        slug: data.slug.trim().toLowerCase()
      },
      { new: true, runValidators: true }
    )
    
    if (!pumpType) {
      return NextResponse.json(
        { error: 'Pump type not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(pumpType)
  } catch (error) {
    console.error('Error updating pump type:', error)
    return NextResponse.json(
      { error: 'Failed to update pump type' },
      { status: 500 }
    )
  }
}

// DELETE pump type
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()
    const db = mongoose.connection.db
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Pump type ID is required' },
        { status: 400 }
      )
    }
    
    const pumpType = await PumpType.findById(id)
    
    if (!pumpType) {
      return NextResponse.json(
        { error: 'Pump type not found' },
        { status: 404 }
      )
    }
    
    await PumpType.findByIdAndDelete(id)
    
    return NextResponse.json({ 
      message: 'Pump type deleted successfully',
      deletedPumpType: pumpType.pumpType 
    })
  } catch (error) {
    console.error('Error deleting pump type:', error)
    return NextResponse.json(
      { error: 'Failed to delete pump type' },
      { status: 500 }
    )
  }
} 