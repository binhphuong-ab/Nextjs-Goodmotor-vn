'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Phone, Mail, Check, Star } from 'lucide-react'
import { Product } from '@/models/Product'



export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string)
    }
  }, [params.slug])

  const fetchProduct = async (slug: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/products/${slug}`)
      
      if (response.ok) {
        const productData = await response.json()
        setProduct(productData)
      } else if (response.status === 404) {
        setError('Product not found')
        setProduct(null)
      } else {
        setError('Failed to load product')
        setProduct(null)
      }
    } catch (error) {
      console.error('API error:', error)
      setError('Unable to connect to server')
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Liên hệ để biết giá'
    return `${price.toLocaleString('vi-VN')} VNĐ`
  }

  const handleRequestQuote = () => {
    // Scroll to contact form or navigate to contact page with product info
    router.push(`/contact?product=${encodeURIComponent(product?.name || '')}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Product not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error === 'Product not found' 
                ? 'The product you are looking for does not exist or may have been removed.'
                : 'We are unable to load the product details at this time.'}
            </p>
            <div className="space-y-3">
              <Link 
                href="/products" 
                className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse All Products
              </Link>
              {error && error !== 'Product not found' && (
                <button
                  onClick={() => fetchProduct(params.slug as string)}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mock additional images for carousel (you can extend the Product model to include multiple images)
  const productImages = [
    product.image,
    // Add more images here when you extend the model
  ]

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-blue-600">Products</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Back Button */}
        <Link 
          href="/products" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image thumbnails (if multiple images) */}
            {productImages.length > 1 && (
              <div className="flex space-x-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4">
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {product.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.inStock 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.inStock ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      In Stock
                    </>
                  ) : (
                    'Out of Stock'
                  )}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatPrice(product.price)}
              </div>
              <p className="text-gray-600 text-sm">
                Contact us for volume pricing and financing options
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            {/* Key Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRequestQuote}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Request Quote
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/contact"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Us
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Flow Rate</dt>
                <dd className="text-lg font-semibold text-gray-900">{product.specifications.flowRate}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Vacuum Level</dt>
                <dd className="text-lg font-semibold text-gray-900">{product.specifications.vacuumLevel}</dd>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Power</dt>
                <dd className="text-lg font-semibold text-gray-900">{product.specifications.power}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Inlet Size</dt>
                <dd className="text-lg font-semibold text-gray-900">{product.specifications.inletSize}</dd>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Weight</dt>
                <dd className="text-lg font-semibold text-gray-900">{product.specifications.weight}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Applications */}
        {product.applications && product.applications.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.applications.map((application, index) => (
                <div key={index} className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-3" />
                  <span className="text-gray-700">{application}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-blue-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Contact our experts today to discuss your specific requirements and get a customized quote for the {product.name}.
          </p>
          <button
            onClick={handleRequestQuote}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Your Custom Quote
          </button>
        </div>
      </div>
    </div>
  )
} 