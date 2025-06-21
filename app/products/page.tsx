'use client'

import { useState, useEffect, CSSProperties } from 'react'
import Image from 'next/image'

interface Product {
  _id: string
  name: string
  description: string
  category: string
  specifications: {
    flowRate: string
    vacuumLevel: string
    power: string
    inletSize: string
    weight: string
  }
  features: string[]
  applications: string[]
  image: string
  price: number
  inStock: boolean
}

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const productsData = await response.json()
        setProducts(productsData)
      } else {
        console.error('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
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
          <p className="text-sm text-gray-500 mt-2">
            All buttons use margin-top: auto to stick to the bottom of their container
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
                    ${product.price?.toLocaleString()}
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
                <button 
                  className="btn-primary w-full mt-auto"
                >
                  Request Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}