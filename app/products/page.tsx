'use client'

import { useState, useEffect, CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/models/Product'



export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory)

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

        {/* Category Filter */}
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative flex flex-col h-full">
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                <div 
                  className="text-gray-600 mb-4"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
                
                {/* Specifications */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Specifications:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Flow Rate: {product.specifications?.flowRate}</div>
                    <div>Vacuum Level: {product.specifications?.vacuumLevel}</div>
                    <div>Power: {product.specifications?.power}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {product.price ? `${product.price.toLocaleString('vi-VN')} VNĐ` : 'Liên hệ'}
                  </span>
                </div>

                {/* Stock Status */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    product.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

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
              {selectedCategory === 'all' 
                ? 'No products are available. Please check back later or contact us for assistance.'
                : 'No products match the selected category.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}