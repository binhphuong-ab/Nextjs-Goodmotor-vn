import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Product, { IProductInput } from '@/models/Product'
import Brand from '@/models/Brand'
import PumpType from '@/models/PumpType'
import connectToDatabase from '@/lib/mongoose'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get('brand')
    const pumpType = searchParams.get('pumpType')
    
    await connectToDatabase()
    
    // Ensure models are registered for population
    // This fixes the MissingSchemaError by forcing model registration
    Brand.modelName // Access Brand model to ensure it's registered
    PumpType.modelName // Access PumpType model to ensure it's registered
    
    // Build filter object based on available query parameters
    const filter: any = {}
    if (brand) filter.brand = brand
    if (pumpType) filter.pumpType = pumpType
    
    // First try to get products with brand and pumpType population
    let products
    try {
      products = await Product.find(filter)
        .populate('brand', 'name country productLines')
        .populate('pumpType', 'pumpType subPumpTypes')
        .sort({ name: 1 })
      
      // Manually populate subPumpType names
      const enrichedProducts = products.map((product: any) => {
        const productObj = product.toObject()
        
        // If product has a subPumpType ID and populated pumpType, find the sub pump type name
        if (productObj.subPumpType && productObj.pumpType && productObj.pumpType.subPumpTypes) {
          const subPumpType = productObj.pumpType.subPumpTypes.find(
            (st: any) => st._id.toString() === productObj.subPumpType.toString()
          )
          if (subPumpType) {
            productObj.subPumpTypeName = subPumpType.name
          }
        }
        
        return productObj
      })
      
      return NextResponse.json(enrichedProducts)
    } catch (populateError) {
      console.warn('Population failed, fetching without population:', populateError)
      // Fallback: get products without population
      products = await Product.find(filter).sort({ name: 1 })
      return NextResponse.json(products)
    }
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