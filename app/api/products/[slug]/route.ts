import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Product from '@/models/Product'
import Brand from '@/models/Brand'
import PumpType from '@/models/PumpType'

// Connect to MongoDB using Mongoose
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return
  }
  
  await mongoose.connect(process.env.MONGODB_URI as string)
}

interface Params {
  slug: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { slug } = params
    
    await connectToDatabase()
    
    // Try to get product with brand and pumpType population
    let product
    try {
      product = await Product.findOne({ slug })
        .populate('brand', 'name country productLines')
        .populate('pumpType', 'pumpType')
    } catch (populateError) {
      console.warn('Population failed for product, fetching without population:', populateError)
      product = await Product.findOne({ slug })
    }
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
} 