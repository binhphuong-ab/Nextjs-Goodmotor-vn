import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    const products = await db.collection('products').find({}).toArray()
    
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
    const productData = await request.json()
    
    // Validate required fields
    if (!productData.name || !productData.description || !productData.category || !productData.price) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, category, price' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    
    // Add timestamp
    const newProduct = {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('products').insertOne(newProduct)
    
    if (result.insertedId) {
      const insertedProduct = await db.collection('products').findOne({ _id: result.insertedId })
      return NextResponse.json(insertedProduct, { status: 201 })
    } else {
      throw new Error('Failed to insert product')
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
} 