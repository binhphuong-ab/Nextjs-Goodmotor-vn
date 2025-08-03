import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Brand from '@/models/Brand'
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
    
    // Find brand by slug
    const brand = await Brand.findOne({ slug })
    
    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Add product usage data safely
    try {
      // Query products directly using mongoose
      const db = mongoose.connection.db
      if (db) {
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
        
        return NextResponse.json({
          ...brand.toObject(),
          productLineUsage: lineUsage,
          productUsage: brandUsage
        })
      }
    } catch (usageError) {
      console.warn('Failed to fetch product usage data:', usageError)
      // Return brand without usage data if there's an error
    }

    return NextResponse.json(brand)
  } catch (error) {
    console.error('Error fetching brand by slug:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
      { status: 500 }
    )
  }
}