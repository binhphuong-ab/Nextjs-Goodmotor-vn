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

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params
    
    await connectToDatabase()
    const product = await Product.findById(id)
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params
    const updateData: IProductInput = await request.json()
    
    await connectToDatabase()
    
    // Check if slug already exists for a different product
    if (updateData.slug) {
      const existingProduct = await Product.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: id } 
      })
      if (existingProduct) {
      return NextResponse.json(
          { error: 'Product slug already exists' },
        { status: 400 }
      )
    }
    }
    
    const product = await Product.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params
    
    await connectToDatabase()
    const product = await Product.findByIdAndDelete(id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
} 