import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Product from '@/models/Product'

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
    const product = await Product.findOne({ slug })
    
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