import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Product } from '@/models/Product'

interface Params {
  slug: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { slug } = params
    
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid product slug' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const product = await db.collection('products').findOne({ slug: slug })
    
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