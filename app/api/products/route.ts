import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Product, ProductInput } from '@/models/Product'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    const db = await getDatabase()
    const collection = db.collection<Product>('products')
    
    const filter: any = category ? { category } : {}
    const products = await collection.find(filter).toArray()
    
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
    const productInput: ProductInput = await request.json()
    
    const db = await getDatabase()
    const collection = db.collection<Product>('products')
    
    const product: Omit<Product, '_id'> = {
      ...productInput,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await collection.insertOne(product)
    
    return NextResponse.json(
      { message: 'Product created successfully', id: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
} 