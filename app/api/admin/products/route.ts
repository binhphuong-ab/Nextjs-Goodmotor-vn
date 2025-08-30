import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Product, { IProductInput } from '@/models/Product'
import Brand from '@/models/Brand'
import PumpType from '@/models/PumpType'
import connectToDatabase from '@/lib/mongoose'

export async function GET() {
  try {
    await connectToDatabase()
    
    // Ensure models are registered for population
    // This fixes the MissingSchemaError by forcing model registration
    Brand.modelName // Access Brand model to ensure it's registered
    PumpType.modelName // Access PumpType model to ensure it's registered
    
    // First try to get products with brand and pumpType population
    let products
    try {
      products = await Product.find({})
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
      products = await Product.find({}).sort({ name: 1 })
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
    
    // AUTOMATIC USAGE TRACKING UPDATE
    // When a product is created, we need to update the usage tracking
    // for related entities (brands and pump types) to keep counts accurate.
    // This is done automatically and asynchronously to avoid blocking product creation.
    
    // Update pump type usage tracking
    if (productData.pumpType) {
      try {
        const pumpType = await PumpType.findById(productData.pumpType)
        if (pumpType) {
          // Add to productUsage array if not already present
          // This array tracks all product names that use this pump type
          if (!pumpType.productUsage.includes(productData.name)) {
            pumpType.productUsage.push(productData.name)
          }
          
          // Update subPumpTypeUsage if product has a sub pump type
          // This Map tracks which products use each sub pump type
          if (productData.subPumpType) {
            if (!pumpType.subPumpTypeUsage) {
              pumpType.subPumpTypeUsage = new Map()
            }
            const currentUsage = pumpType.subPumpTypeUsage.get(productData.subPumpType) || []
            if (!currentUsage.includes(productData.name)) {
              currentUsage.push(productData.name)
              pumpType.subPumpTypeUsage.set(productData.subPumpType, currentUsage)
            }
          }
          
          await pumpType.save()
        }
      } catch (usageError) {
        console.warn('Failed to update pump type usage tracking:', usageError)
        // Don't fail the product creation if usage tracking fails
        // Usage can be rebuilt later using the sync utility
      }
    }
    
    // Update brand usage tracking
    if (productData.brand) {
      try {
        const brand = await Brand.findById(productData.brand)
        if (brand) {
          // Add to productUsage array if not already present
          // This array tracks all product names that use this brand
          if (!brand.productUsage.includes(productData.name)) {
            brand.productUsage.push(productData.name)
          }
          
          // Update productLineUsage if product has a product line
          // This Map tracks which products use each product line within the brand
          if (productData.productLineId) {
            if (!brand.productLineUsage) {
              brand.productLineUsage = new Map()
            }
            const currentUsage = brand.productLineUsage.get(productData.productLineId) || []
            if (!currentUsage.includes(productData.name)) {
              currentUsage.push(productData.name)
              brand.productLineUsage.set(productData.productLineId, currentUsage)
            }
          }
          
          await brand.save()
        }
      } catch (usageError) {
        console.warn('Failed to update brand usage tracking:', usageError)
        // Don't fail the product creation if usage tracking fails
        // Usage can be rebuilt later using the sync utility
      }
    }
    
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