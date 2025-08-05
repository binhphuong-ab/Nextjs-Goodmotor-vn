import { Metadata } from 'next'
import mongoose from 'mongoose'
import connectToDatabase from '@/lib/mongoose'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Fetch product data for metadata
    if (!params.slug || typeof params.slug !== 'string') {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
      }
    }

    await connectToDatabase()
    const db = mongoose.connection.db
    
    if (!db) {
      return {
        title: 'Database Error',
        description: 'Database connection failed.',
      }
    }
    
    const product = await db.collection('products').findOne({ slug: params.slug })

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
      }
    }

    const cleanDescription = product.description.replace(/<[^>]*>/g, '').substring(0, 160)

    return {
      title: `${product.name} | Good Motor Vacuum Pumps`,
      description: cleanDescription,
      keywords: [
        product.name,
        product.category,
        'vacuum pump',
        'industrial pump',
        'good motor',
        ...product.features?.slice(0, 3) || [],
        ...product.applications?.slice(0, 3).map((app: any) => app.name) || [],
      ].join(', '),
      openGraph: {
        title: product.name,
        description: cleanDescription,
        images: [
          {
            url: product.image,
            width: 800,
            height: 600,
            alt: product.name,
          }
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: cleanDescription,
        images: [product.image],
      },
      alternates: {
        canonical: `/products/${params.slug}`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Product | Good Motor Vacuum Pumps',
      description: 'High-quality industrial vacuum pumps and solutions.',
    }
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 