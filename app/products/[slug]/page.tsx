'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Phone, Mail, Check, Star, Package, Wrench, Info, ChevronRight, Zap, Shield, Award } from 'lucide-react'
import { IProductPopulated } from '@/models/Product'
import { ProductDescriptionDisplay } from '@/components/MarkdownDisplay'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<IProductPopulated | null>(null)
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
    if (!price || price === 0) return 'Liên hệ để biết giá'
    return `${price.toLocaleString('vi-VN')} VNĐ`
  }

  const handleRequestQuote = () => {
    // Scroll to contact form or navigate to contact page with product info
    router.push(`/contact?product=${encodeURIComponent(product?.name || '')}`)
  }

  const getSelectedImageAlt = (product: IProductPopulated, index: number) => {
    if (product.images && product.images[index] && product.images[index].alt) {
      return product.images[index].alt
    }
    return product.name
  }

  const getSelectedImageCaption = (product: IProductPopulated, index: number) => {
    if (product.images && Array.isArray(product.images) && product.images[index]) {
      return product.images[index].caption
    }
    return null
  }

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'Hàng mới 100%':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Hàng cũ':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Breadcrumb Navigation Skeleton */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="container-custom py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            </nav>
          </div>
        </div>

        <div className="container-custom py-8">
          {/* Back Button Skeleton */}
          <div className="flex items-center mb-8">
            <ArrowLeft className="w-5 h-5 mr-2 text-gray-300" />
            <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Main Product Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Left Column - Product Images Skeleton */}
            <div className="space-y-6">
              {/* Main Image Skeleton */}
              <div className="relative aspect-square bg-gray-200 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200 animate-pulse">
                <div className="absolute inset-0 bg-gray-300"></div>
              </div>
              
              {/* Image Thumbnails Skeleton */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-200 animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Right Column - Product Details Skeleton */}
            <div className="space-y-8">
              {/* Product Header Skeleton */}
              <div className="space-y-4">
                {/* Product Title */}
                <div className="space-y-3">
                  <div className="w-3/4 h-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-1/2 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* Product Badges Skeleton */}
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="w-24 h-8 bg-gray-200 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </div>

              {/* Price Section Skeleton */}
              <div className="bg-gradient-to-r from-gray-100 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <div className="w-48 h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="space-y-4">
                <div className="w-full h-14 bg-gray-200 rounded-xl animate-pulse"></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </div>

              {/* Quick Specifications Skeleton */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <Info className="w-5 h-5 mr-2 text-gray-300" />
                  <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Không tìm thấy sản phẩm'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error === 'Product not found' 
                ? 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'
                : 'Chúng tôi không thể tải thông tin sản phẩm tại thời điểm này.'}
            </p>
            <div className="space-y-3">
              <Link 
                href="/products" 
                className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Xem tất cả sản phẩm
              </Link>
              {error && error !== 'Product not found' && (
                <button
                  onClick={() => fetchProduct(params.slug as string)}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Thử lại
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get product images array
  const productImages = product.images && product.images.length > 0
    ? product.images.map((img: any) => img.url)
    : ['/images/placeholder-product.jpg']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container-custom py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-blue-600 transition-colors">Sản phẩm</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Back Button */}
        <Link 
          href="/products" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Quay lại danh sách sản phẩm</span>
        </Link>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left Column - Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
              <Image
                src={productImages[selectedImage]}
                alt={getSelectedImageAlt(product, selectedImage)}
                fill
                quality={100} // High quality for crisp main product image display
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/placeholder-product.jpg'
                }}
              />
              {/* Overlay gradient for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
            </div>
            
            {/* Image Caption */}
            {getSelectedImageCaption(product, selectedImage) && (
              <div className="text-center text-sm text-gray-600 italic bg-white/60 backdrop-blur-sm rounded-lg p-3">
                {getSelectedImageCaption(product, selectedImage)}
              </div>
            )}
            
            {/* Image Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-blue-500 ring-2 ring-blue-500/30 scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              
              {/* Product Badges */}
              <div className="flex flex-wrap gap-3">
                {product.pumpType && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <Zap className="w-4 h-4 mr-2" />
                    {product.pumpType.pumpType}
                  </span>
                )}
                {product.brand && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    <Award className="w-4 h-4 mr-2" />
                    {product.brand.name}
                  </span>
                )}
                {product.specifications?.status && (
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadgeColor(product.specifications.status)}`}>
                    <Shield className="w-4 h-4 mr-2" />
                    {product.specifications.status}
                  </span>
                )}
                {/* Product Line Display */}
                {product.productLineId && product.brand && product.brand.productLines && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    <Package className="w-4 h-4 mr-2" />
                    {(() => {
                      const productLine = product.brand.productLines?.find((line: any) => line._id === product.productLineId);
                      return productLine ? productLine.name : 'Dòng sản phẩm';
                    })()}
                  </span>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              {(product.price && product.price > 0) ? (
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {formatPrice(product.price)}
                  </div>
                  <p className="text-blue-700 text-sm">
                    Liên hệ để được tư vấn giá và phương thức thanh toán
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-blue-800 mb-2">
                    Liên hệ để biết giá
                  </div>
                  <p className="text-blue-700 text-sm">
                    Vui lòng liên hệ để được báo giá chi tiết và tư vấn
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleRequestQuote}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.02] flex items-center justify-center shadow-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Yêu cầu báo giá
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/contact"
                  className="flex items-center justify-center px-6 py-3 border-2 border-blue-200 rounded-xl text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all font-medium"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Gọi điện
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-center px-6 py-3 border-2 border-blue-200 rounded-xl text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all font-medium"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Link>
              </div>
            </div>

            {/* Quick Specifications */}
            {(product.specifications?.equipment || product.specifications?.country || product.specifications?.power) && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Thông tin nhanh
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {product.specifications?.equipment && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Loại thiết bị</span>
                      <span className="text-gray-900 font-semibold">{product.specifications.equipment}</span>
                    </div>
                  )}
                  {product.specifications?.country && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Xuất xứ</span>
                      <span className="text-gray-900 font-semibold">{product.specifications.country}</span>
                    </div>
                  )}
                  {product.specifications?.power && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">Công suất</span>
                      <span className="text-gray-900 font-semibold">{product.specifications.power}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        {product.description && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Info className="w-7 h-7 mr-3 text-blue-600" />
              Mô tả sản phẩm
            </h2>
            <div className="prose prose-lg prose-blue max-w-none">
              <ProductDescriptionDisplay content={product.description} />
            </div>
          </div>
        )}

        {/* Features Section */}
        {product.features && product.features.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="w-7 h-7 mr-3 text-yellow-500" />
              Tính năng nổi bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-start p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200/50">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-800 font-medium leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Specifications */}
        {(product.specifications?.equipment || product.specifications?.country || product.specifications?.power || product.specifications?.flowRate || product.specifications?.vacuumLevel || product.specifications?.inletSize || product.specifications?.weight) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Zap className="w-7 h-7 mr-3 text-blue-600" />
              Thông số kỹ thuật
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Loại thiết bị', value: product.specifications?.equipment, icon: '🔧' },
                { label: 'Xuất xứ', value: product.specifications?.country, icon: '🌍' },
                { label: 'Tình trạng', value: product.specifications?.status, icon: '📋' },
                { label: 'Công suất', value: product.specifications?.power, icon: '⚡' },
                { label: 'Lưu lượng hút', value: product.specifications?.flowRate, icon: '🌊' },
                { label: 'Độ chân không', value: product.specifications?.vacuumLevel, icon: '📊' },
                { label: 'Kích thước đầu hút', value: product.specifications?.inletSize, icon: '📏' },
                { label: 'Trọng lượng', value: product.specifications?.weight, icon: '⚖️' },
              ].map((spec, index) => 
                spec.value && (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{spec.icon}</span>
                      <h4 className="font-semibold text-gray-900">{spec.label}</h4>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{spec.value}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Applications */}
        {product.applications && product.applications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="w-7 h-7 mr-3 text-yellow-500" />
              Ứng dụng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.applications.map((application, index) => (
                <div key={index} className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <Star className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
                  {application.url ? (
                    <Link 
                      href={application.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {application.name}
                    </Link>
                  ) : (
                    <span className="text-gray-800 font-medium">{application.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Repair Parts */}
        {product.repairParts && product.repairParts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Wrench className="w-7 h-7 mr-3 text-orange-600" />
              Phụ tùng và linh kiện
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.repairParts.map((part, index) => (
                <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200 hover:shadow-lg transition-shadow">
                  {part.image && (
                    <div className="aspect-square bg-white rounded-lg mb-4 overflow-hidden">
                      <Image
                        src={part.image}
                        alt={part.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h4 className="font-semibold text-gray-900 mb-2">{part.name}</h4>
                  {part.url && (
                    <Link 
                      href={part.url}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                    >
                      Xem chi tiết →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-12 text-center text-white shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
            <p className="text-blue-100 mb-8 text-lg leading-relaxed">
              Liên hệ với các chuyên gia của chúng tôi ngay hôm nay để thảo luận về yêu cầu cụ thể của bạn và nhận báo giá tùy chỉnh cho <strong>{product.name}</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRequestQuote}
                className="bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center shadow-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Nhận báo giá tùy chỉnh
              </button>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-900 transition-all flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Liên hệ chuyên gia
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 