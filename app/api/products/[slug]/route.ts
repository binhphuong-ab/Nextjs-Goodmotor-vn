import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Product from '@/models/Product'
import Brand from '@/models/Brand'
import PumpType from '@/models/PumpType'
import connectToDatabase from '@/lib/mongoose'

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
    
    // Ensure models are registered for population
    // This fixes the MissingSchemaError by forcing model registration
    Brand.modelName // Access Brand model to ensure it's registered
    PumpType.modelName // Access PumpType model to ensure it's registered
    
    // Try to get product with brand and pumpType population
    let product
    try {
      product = await Product.findOne({ slug })
        .populate('brand', 'name country productLines')
        .populate('pumpType', 'pumpType slug')
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