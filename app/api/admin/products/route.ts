import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Product, { IProductInput } from '@/models/Product'
import Brand from '@/models/Brand'
import PumpType from '@/models/PumpType'
import connectToDatabase from '@/lib/mongoose'

export async function GET() {
  try {
    await connectToDatabase()
    
    // First try to get products with brand and pumpType population
    let products
    try {
      products = await Product.find({})
        .populate('brand', 'name country productLines')
        .populate('pumpType', 'pumpType')
        .sort({ name: 1 })
    } catch (populateError) {
      console.warn('Population failed, fetching without population:', populateError)
      // Fallback: get products without population
      products = await Product.find({}).sort({ name: 1 })
    }
    
    return NextResponse.json(products)
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
    const productData: IProductInput = await request.json()
    
    // Validate required fields
    if (!productData.name || !productData.slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug: productData.slug })
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product slug already exists' },
        { status: 400 }
      )
    }
    
    const product = new Product(productData)
    await product.save()
    
    return NextResponse.json(product, { status: 201 })
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