import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Product, { IProductInput } from '@/models/Product'

// Connect to MongoDB using Mongoose
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return
  }
  
  await mongoose.connect(process.env.MONGODB_URI as string)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    await connectToDatabase()
    
    const filter: any = category ? { category } : {}
    const products = await Product.find(filter)
      .populate('brand', 'name country productLines')
      .populate('pumpType', 'pumpType')
      .sort({ name: 1 })
    
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const productInput: IProductInput = await request.json()
    
    await connectToDatabase()
    
    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug: productInput.slug })
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product slug already exists' },
        { status: 400 }
      )
    }
    
    const product = new Product(productInput)
    await product.save()
    
    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating product:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
} 