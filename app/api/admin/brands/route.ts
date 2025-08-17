import { NextRequest, NextResponse } from 'next/server'
import Brand, { IBrandInput } from '@/models/Brand'
import mongoose from 'mongoose'
import connectToDatabase from '@/lib/mongoose'

// GET all brands
export async function GET() {
  try {
    // Ensure database connection
    await connectToDatabase()
    
    const brands = await Brand.find({})
      .sort({ name: 1 })
    
    // Add product usage data safely (now using stored usage tracking for better performance)
    const brandsWithUsage = await Promise.all(
      brands.map(async (brand) => {
        try {
          // If stored usage data exists, use it; otherwise fall back to real-time calculation
          let productUsage = brand.productUsage || []
          let productLineUsage: Record<string, string[]> = {}
          
          // Convert Map to object for JSON serialization
          if (brand.productLineUsage && brand.productLineUsage instanceof Map) {
            for (const [key, value] of brand.productLineUsage.entries()) {
              productLineUsage[key] = value
            }
          } else if (brand.productLineUsage) {
            productLineUsage = brand.productLineUsage as Record<string, string[]>
          }
          
          // If no stored usage data, calculate it (fallback for data migration)
          if (!productUsage || productUsage.length === 0) {
            const db = mongoose.connection.db
            if (db) {
              const allBrandProducts = await db.collection('products').find({
                brand: brand._id
              }, { 
                projection: { name: 1, productLineId: 1 } 
              }).toArray()
              
              productUsage = allBrandProducts.map((product: any) => product.name)
              
              // Calculate product line usage
              const lineUsage: Record<string, string[]> = {}
              allBrandProducts.forEach((product: any) => {
                if (product.productLineId) {
                  if (!lineUsage[product.productLineId]) {
                    lineUsage[product.productLineId] = []
                  }
                  lineUsage[product.productLineId].push(product.name)
                }
              })
              productLineUsage = lineUsage
            }
          }
          
          return {
            ...brand.toObject(),
            productLineUsage,
            productUsage
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
    await connectToDatabase()
    const db = mongoose.connection.db
    const data: IBrandInput = await request.json()
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }
    
    if (!data.slug) {
      return NextResponse.json(
        { error: 'Brand slug is required' },
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
    
    // Check if slug already exists
    const existingSlug = await Brand.findOne({ 
      slug: data.slug.trim().toLowerCase()
    })
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Brand slug already exists' },
        { status: 409 }
      )
    }
    
    const brand = new Brand({
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      logo: data.logo?.trim() || undefined,
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
    await connectToDatabase()
    const db = mongoose.connection.db
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
    
    if (!data.slug) {
      return NextResponse.json(
        { error: 'Brand slug is required' },
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
    
    // Check if slug already exists (excluding current brand)
    const existingSlug = await Brand.findOne({ 
      slug: data.slug.trim().toLowerCase(),
      _id: { $ne: id }
    })
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Brand slug already exists' },
        { status: 409 }
      )
    }
    
    const brand = await Brand.findByIdAndUpdate(
      id,
      {
        name: data.name.trim(),
        slug: data.slug.trim().toLowerCase(),
        logo: data.logo?.trim() || undefined,
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
    await connectToDatabase()
    const db = mongoose.connection.db
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