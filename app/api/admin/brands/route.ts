import { getDatabase } from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'
import Brand, { IBrandInput } from '@/models/Brand'
import mongoose from 'mongoose'

// GET all brands
export async function GET() {
  try {
    // Ensure database connection
    await getDatabase()
    
    // Ensure mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI not found')
      }
      await mongoose.connect(process.env.MONGODB_URI)
    }
    
    const brands = await Brand.find({})
      .sort({ name: 1 })
    
    // Add product line usage data safely
    const brandsWithUsage = await Promise.all(
      brands.map(async (brand) => {
        try {
          // Query products directly using mongoose
          const db = mongoose.connection.db
          if (!db) {
            throw new Error('Database not available')
          }
          
          // Get products with product line usage
          const productsWithLines = await db.collection('products').find({
            brand: brand._id,
            productLineId: { $exists: true, $ne: '' }
          }, { 
            projection: { productLineId: 1, name: 1 } 
          }).toArray()
          
          // Get all products using this brand
          const allBrandProducts = await db.collection('products').find({
            brand: brand._id
          }, { 
            projection: { name: 1 } 
          }).toArray()
          
          const lineUsage: Record<string, string[]> = {}
          productsWithLines.forEach((product: any) => {
            if (product.productLineId) {
              if (!lineUsage[product.productLineId]) {
                lineUsage[product.productLineId] = []
              }
              lineUsage[product.productLineId].push(product.name)
            }
          })
          
          const brandUsage = allBrandProducts.map((product: any) => product.name)
          
          return {
            ...brand.toObject(),
            productLineUsage: lineUsage,
            productUsage: brandUsage
          }
        } catch (usageError) {
          console.error('Error getting usage for brand:', brand.name, usageError)
          // Return brand without usage data if there's an error
          return {
            ...brand.toObject(),
            productLineUsage: {},
            productUsage: []
          }
        }
      })
    )
    
    return NextResponse.json(brandsWithUsage)
  } catch (error) {
    console.error('Error fetching brands:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch brands', details: errorMessage },
      { status: 500 }
    )
  }
}

// POST new brand
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const data: IBrandInput = await request.json()
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }
    
    // Check if name already exists
    const existingBrand = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') }
    })
    if (existingBrand) {
      return NextResponse.json(
        { error: 'Brand with this name already exists' },
        { status: 409 }
      )
    }
    
    const brand = new Brand({
      name: data.name.trim(),
      country: data.country?.trim() || undefined,
      yearEstablished: data.yearEstablished || undefined,
      revenue: data.revenue?.trim() || undefined,
      description: data.description?.trim() || undefined,
      productLines: data.productLines || []
    })
    
    await brand.save()
    
    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}

// PUT update brand
export async function PUT(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const data: IBrandInput = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }
    
    if (!data.name) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }
    
    // Check if name already exists (excluding current brand)
    const existingBrand = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') },
      _id: { $ne: id }
    })
    if (existingBrand) {
      return NextResponse.json(
        { error: 'Brand with this name already exists' },
        { status: 409 }
      )
    }
    
    const brand = await Brand.findByIdAndUpdate(
      id,
      {
        name: data.name.trim(),
        country: data.country?.trim() || undefined,
        yearEstablished: data.yearEstablished || undefined,
        revenue: data.revenue?.trim() || undefined,
        description: data.description?.trim() || undefined,
        productLines: data.productLines || []
      },
      { new: true, runValidators: true }
    )
    
    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(brand)
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    )
  }
}

// DELETE brand
export async function DELETE(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }
    
    const brand = await Brand.findById(id)
    
    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }
    
    await Brand.findByIdAndDelete(id)
    
    return NextResponse.json({ 
      message: 'Brand deleted successfully',
      deletedBrand: brand.name 
    })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    )
  }
} 