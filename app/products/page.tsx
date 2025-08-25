'use client'

import { useState, useEffect, CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IProduct } from '@/models/Product'

// Extended interface for populated product
interface PopulatedProduct extends Omit<IProduct, 'brand'> {
  brand?: {
    _id: string
    name: string
    country?: string
    productLines?: Array<{
      _id: string
      name: string
      description?: string
      isActive: boolean
      displayOrder: number
    }>
  }
}



export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [products, setProducts] = useState<PopulatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getPrimaryImageUrl = (product: PopulatedProduct) => {
    if (product.images && product.images.length > 0) {
      // Find primary image first
      const primaryImage = product.images.find((img: any) => img.isPrimary)
      if (primaryImage) return primaryImage.url
      
      // If no primary image, use first image
      return product.images[0].url
    }
    
    return null
  }

  const getPrimaryImageAlt = (product: PopulatedProduct) => {
    if (product.images && product.images.length > 0) {
      // Find primary image first
      const primaryImage = product.images.find((img: any) => img.isPrimary)
      if (primaryImage && primaryImage.alt) return primaryImage.alt
      
      // If no primary image or alt, use first image alt or product name
      return product.images[0].alt || product.name
    }
    
    // Fallback to product name
    return product.name
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/products')
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || data)
      } else {
        setError('Failed to load products from server')
        setProducts([])
      }
    } catch (error) {
      console.error('API error:', error)
      setError('Unable to connect to server')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'rotary-vane', label: 'Rotary Vane Pumps' },
    { value: 'scroll', label: 'Scroll Pumps' },
    { value: 'diaphragm', label: 'Diaphragm Pumps' },
    { value: 'turbomolecular', label: 'Turbomolecular Pumps' },
  ]

  // Note: Products don't currently have categories in the model
  const filteredProducts = products

  if (loading) {
    return (
      <div className="section-padding">
        <div className="container-custom">
          <div className="text-center">
            <div className="text-xl">Loading products...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our Vacuum Pump Products
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-2">
            Discover our comprehensive range of high-performance vacuum pumps designed for various industrial applications.
          </p>

        </div>

        {/* Category Filter - Disabled until categories are added to Product model */}
        {/* 
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  selectedCategory === category.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        */}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative flex flex-col h-full">
              <Image
                src={getPrimaryImageUrl(product) || '/images/placeholder-product.jpg'}
                alt={getPrimaryImageAlt(product)}
                width={400}
                height={250}
                className="w-full h-60 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/placeholder-product.jpg'
                }}
              />
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                
                {/* Brand and Product Line Info */}
                {(product.brand || product.productLineId) && (
                  <div className="mb-3">
                    {product.brand && (
                      <div className="text-sm text-blue-600 font-medium">
                        {product.brand.name}
                        {product.brand.country && ` (${product.brand.country})`}
                      </div>
                    )}
                    {product.productLineId && product.brand?.productLines && (
                      <div className="text-sm text-gray-500">
                        {(() => {
                          const productLine = product.brand.productLines.find(line => line._id === product.productLineId)
                          return productLine ? productLine.name : 'Product Line'
                        })()}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Specifications */}
                {(product.specifications?.equipment || product.specifications?.country || product.specifications?.power || product.specifications?.flowRate || product.specifications?.vacuumLevel) && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Specifications:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {product.specifications?.equipment && <div>Equipment Type: {product.specifications.equipment}</div>}
                      {product.specifications?.country && <div>Country of Origin: {product.specifications.country}</div>}
                      {product.specifications?.power && <div>Power: {product.specifications.power}</div>}
                      {product.specifications?.flowRate && <div>Flow Rate: {product.specifications.flowRate}</div>}
                      {product.specifications?.vacuumLevel && <div>Vacuum Level: {product.specifications.vacuumLevel}</div>}
                    </div>
                  </div>
                )}

                {/* Price */}
                {(product.price && product.price > 0) && (
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {product.price.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                )}

                {/* Button with margin-top: auto */}
                <div className="space-y-3 mt-auto">
                  <Link 
                                          href={`/products/${product.slug}`}
                    className="btn-primary w-full block text-center"
                  >
                    View Details
                  </Link>
                  <button 
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Request Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-red-800 mb-4">Unable to Load Products</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchProducts}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* No products found */}
        {!error && filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">No products found</h3>
            <p className="text-gray-600">
              No products are available. Please check back later or contact us for assistance.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}