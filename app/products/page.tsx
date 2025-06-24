'use client'

import { useState, useEffect, CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/models/Product'

// Mock data as fallback
const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Rotary Vane Pump RV-2000',
    slug: 'rotary-vane-pump-rv-2000',
    description: 'High-efficiency rotary vane pump designed for continuous operation in demanding industrial applications. Features oil-sealed design for superior vacuum performance.',
    category: 'rotary-vane',
    specifications: {
      flowRate: '2000 CFM',
      vacuumLevel: '0.1 torr',
      power: '15 HP',
      inletSize: '8 inches',
      weight: '450 lbs',
    },
    features: [
      'Oil-sealed design for superior vacuum',
      'Heavy-duty construction for continuous operation',
      'Low noise operation',
      'Easy maintenance and service',
      'Corrosion-resistant materials',
    ],
    applications: [
      'Industrial manufacturing',
      'Chemical processing',
      'Packaging machinery',
      'Material handling',
    ],
    image: 'https://trebles.co.uk/wp-content/uploads/2021/01/Industrial-Pumps.jpg',
    price: 15000,
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2',
    name: 'Scroll Pump SC-1500',
    slug: 'scroll-pump-sc-1500',
    description: 'Oil-free scroll pump providing clean vacuum for sensitive applications. Ideal for laboratories, clean rooms, and pharmaceutical manufacturing.',
    category: 'scroll',
    specifications: {
      flowRate: '1500 CFM',
      vacuumLevel: '0.05 torr',
      power: '12 HP',
      inletSize: '6 inches',
      weight: '380 lbs',
    },
    features: [
      'Oil-free operation for contamination-free vacuum',
      'Quiet operation suitable for laboratory environments',
      'Compact design saves floor space',
      'Minimal maintenance requirements',
      'Digital control panel with diagnostics',
    ],
    applications: [
      'Pharmaceutical manufacturing',
      'Laboratory applications',
      'Clean room environments',
      'Food processing',
    ],
    image: 'https://trebles.co.uk/wp-content/uploads/2021/01/Industrial-Pumps.jpg',
    price: 18000,
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '3',
    name: 'Diaphragm Pump DP-800',
    slug: 'diaphragm-pump-dp-800',
    description: 'Chemical-resistant diaphragm pump designed for corrosive environments. Perfect for aggressive chemical processing and vapor recovery applications.',
    category: 'diaphragm',
    specifications: {
      flowRate: '800 CFM',
      vacuumLevel: '0.2 torr',
      power: '8 HP',
      inletSize: '4 inches',
      weight: '250 lbs',
    },
    features: [
      'PTFE-lined chamber for chemical resistance',
      'Dry operation without oil contamination',
      'Handles condensable vapors',
      'Automatic restart after power failure',
      'Self-draining design',
    ],
    applications: [
      'Chemical processing',
      'Solvent recovery',
      'Vapor handling',
      'Corrosive gas applications',
    ],
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837',
    price: 12000,
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || data)
        setUsingMockData(false)
      } else {
        console.warn('API failed, using mock data')
        setProducts(mockProducts)
        setUsingMockData(true)
      }
    } catch (error) {
      console.warn('API error, using mock data:', error)
      setProducts(mockProducts)
      setUsingMockData(true)
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

        {/* No products found */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">No products found</h3>
            <p className="text-gray-600">No products match the selected category.</p>
          </div>
        )}
      </div>
    </div>
  )
}