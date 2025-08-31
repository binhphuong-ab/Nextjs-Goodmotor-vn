'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IProduct } from '@/models/Product'
import { BuildingOfficeIcon, CogIcon, BoltIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline'

// Extended interface for populated product
interface PopulatedProduct extends Omit<IProduct, 'brand' | 'pumpType'> {
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
  pumpType?: {
    _id: string
    pumpType: string
    description?: string
  }
}



export default function ProductsPage() {
  const [products, setProducts] = useState<PopulatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterByBrand, setFilterByBrand] = useState<string>('all')
  const [filterByPumpType, setFilterByPumpType] = useState<string>('all')
  const [filterByEquipment, setFilterByEquipment] = useState<string>('all')
  const [filterByPower, setFilterByPower] = useState<string>('all')

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

  // Extract unique filter options from products
  const brands = Array.from(new Set(products.map(p => p.brand?.name).filter(Boolean))) as string[]
  const pumpTypes = Array.from(new Set(products.map(p => p.pumpType?.pumpType).filter(Boolean))) as string[]
  const powerLevels = Array.from(new Set(products.map(p => p.specifications?.power).filter(Boolean))) as string[]

  // Equipment types (hardcoded as per Product model enum)
  const equipmentTypes = ['Bơm chân không', 'Phụ tùng bơm', 'Thiết bị chân không']

  // Power levels in correct order
  const orderedPowerLevels = ['<400W', '400W', '550W', '0.75Kw', '1.1Kw', '1.5kw', '2.2Kw', '3Kw', '3.7Kw', '5.5Kw', '7.5Kw', '9Kw', '11Kw', '15Kw', '22Kw', '>22Kw']
  const sortedPowerLevels = orderedPowerLevels.filter(power => powerLevels.includes(power))

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    const brandMatch = filterByBrand === 'all' || product.brand?.name === filterByBrand
    const pumpTypeMatch = filterByPumpType === 'all' || product.pumpType?.pumpType === filterByPumpType
    const equipmentMatch = filterByEquipment === 'all' || product.specifications?.equipment === filterByEquipment
    const powerMatch = filterByPower === 'all' || product.specifications?.power === filterByPower
    return brandMatch && pumpTypeMatch && equipmentMatch && powerMatch
  })

  if (loading) {
    return (
      <div className="section-padding">
        <div className="container-custom">
          {/* Header Skeleton */}
          <div className="text-center mb-16">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-300 rounded-lg w-96 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto"></div>
            </div>
          </div>

          {/* Enhanced Filters Section Skeleton */}
          <div className="bg-white shadow-sm border-b mb-12">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="animate-pulse space-y-8">
                
                {/* Brand Filter Skeleton */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-300 rounded-lg">
                      <div className="h-5 w-5 bg-gray-400 rounded"></div>
                    </div>
                    <div>
                      <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>

                {/* Pump Type Filter Skeleton */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-300 rounded-lg">
                      <div className="h-5 w-5 bg-gray-400 rounded"></div>
                    </div>
                    <div>
                      <div className="h-6 bg-gray-300 rounded w-20 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-40"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>

                {/* Equipment Type Filter Skeleton */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-300 rounded-lg">
                      <div className="h-5 w-5 bg-gray-400 rounded"></div>
                    </div>
                    <div>
                      <div className="h-6 bg-gray-300 rounded w-28 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-44"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>

                {/* Power Filter Skeleton */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-300 rounded-lg">
                      <div className="h-5 w-5 bg-gray-400 rounded"></div>
                    </div>
                    <div>
                      <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-36"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {Array(8).fill(0).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results Summary Skeleton */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-48"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="w-full h-60 bg-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/5"></div>
                    </div>
                    <div className="h-10 bg-gray-300 rounded w-full mt-4"></div>
                  </div>
                </div>
              </div>
            ))}
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
            Sản Phẩm Bơm Chân Không
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-2">
            Khám phá dòng sản phẩm bơm chân không hiệu suất cao được thiết kế cho các ứng dụng công nghiệp đa dạng.
          </p>

        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white shadow-sm border-b mb-12">
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="space-y-8">
              
              {/* Brand Filter */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Thương Hiệu</h3>
                    <p className="text-sm text-gray-600">Lọc theo thương hiệu bơm chân không</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  <button
                    onClick={() => setFilterByBrand('all')}
                    className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      filterByBrand === 'all'
                        ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-200'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">Tất Cả Thương Hiệu</div>
                      <div className="text-xs opacity-75">{products.length} sản phẩm</div>
                    </div>
                  </button>
                  
                  {brands.map(brand => (
                    <button
                      key={brand}
                      onClick={() => setFilterByBrand(brand)}
                      className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        filterByBrand === brand
                          ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-200'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium">{brand}</div>
                        <div className="text-xs opacity-75">
                          {products.filter(p => p.brand?.name === brand).length} sản phẩm
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pump Type Filter */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <CogIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Loại Bơm</h3>
                    <p className="text-sm text-gray-600">Lọc theo công nghệ bơm</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  <button
                    onClick={() => setFilterByPumpType('all')}
                    className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      filterByPumpType === 'all'
                        ? 'bg-orange-600 text-white shadow-lg ring-2 ring-orange-200'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">Tất Cả Loại Bơm</div>
                      <div className="text-xs opacity-75">{products.length} sản phẩm</div>
                    </div>
                  </button>
                  
                  {pumpTypes.map(pumpType => (
                    <button
                      key={pumpType}
                      onClick={() => setFilterByPumpType(pumpType)}
                      className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        filterByPumpType === pumpType
                          ? 'bg-orange-600 text-white shadow-lg ring-2 ring-orange-200'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium">{pumpType}</div>
                        <div className="text-xs opacity-75">
                          {products.filter(p => p.pumpType?.pumpType === pumpType).length} sản phẩm
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment Type Filter */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Loại Thiết Bị</h3>
                    <p className="text-sm text-gray-600">Lọc theo danh mục thiết bị</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  <button
                    onClick={() => setFilterByEquipment('all')}
                    className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      filterByEquipment === 'all'
                        ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-200'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">Tất Cả Thiết Bị</div>
                      <div className="text-xs opacity-75">{products.length} sản phẩm</div>
                    </div>
                  </button>
                  
                  {equipmentTypes.map(equipment => (
                    <button
                      key={equipment}
                      onClick={() => setFilterByEquipment(equipment)}
                      className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        filterByEquipment === equipment
                          ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-200'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium">{equipment}</div>
                        <div className="text-xs opacity-75">
                          {products.filter(p => p.specifications?.equipment === equipment).length} sản phẩm
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Power Filter */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <BoltIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Mức Công Suất</h3>
                    <p className="text-sm text-gray-600">Lọc theo công suất động cơ</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                  <button
                    onClick={() => setFilterByPower('all')}
                    className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      filterByPower === 'all'
                        ? 'bg-yellow-600 text-white shadow-lg ring-2 ring-yellow-200'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">Tất Cả</div>
                      <div className="text-xs opacity-75">{products.length} sản phẩm</div>
                    </div>
                  </button>
                  
                  {sortedPowerLevels.map(power => (
                    <button
                      key={power}
                      onClick={() => setFilterByPower(power)}
                      className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        filterByPower === power
                          ? 'bg-yellow-600 text-white shadow-lg ring-2 ring-yellow-200'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium">{power}</div>
                        <div className="text-xs opacity-75">
                          {products.filter(p => p.specifications?.power === power).length} sản phẩm
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">
                    Hiển thị {filteredProducts.length} trong tổng số {products.length} sản phẩm
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setFilterByBrand('all')
                    setFilterByPumpType('all')
                    setFilterByEquipment('all')
                    setFilterByPower('all')
                  }}
                  className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                    (filterByBrand !== 'all' || filterByPumpType !== 'all' || filterByEquipment !== 'all' || filterByPower !== 'all')
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 opacity-100 cursor-pointer'
                      : 'bg-transparent text-transparent cursor-default opacity-0 pointer-events-none'
                  }`}
                >
                  Xóa Tất Cả Bộ Lọc
                </button>
              </div>
            </div>
          </div>
        </div>

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
                
                {/* Brand, Pump Type and Product Line Info */}
                {(product.brand || product.pumpType || product.productLineId) && (
                  <div className="mb-3 space-y-1">
                    {product.brand && (
                      <div className="text-sm text-blue-600 font-medium">
                        {product.brand.name}
                        {product.brand.country && ` (${product.brand.country})`}
                      </div>
                    )}
                    {product.pumpType && (
                      <div className="text-sm text-gray-600">
                        Loại: {product.pumpType.pumpType}
                      </div>
                    )}
                    {product.productLineId && product.brand?.productLines && (
                      <div className="text-sm text-gray-500">
                        {(() => {
                          const productLine = product.brand.productLines.find(line => line._id === product.productLineId)
                          return productLine ? `Dòng: ${productLine.name}` : 'Dòng Sản Phẩm'
                        })()}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Specifications */}
                {(product.specifications?.equipment || product.specifications?.country || product.specifications?.power || product.specifications?.flowRate || product.specifications?.vacuumLevel) && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Thông Số Kỹ Thuật:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {product.specifications?.equipment && <div>Loại Thiết Bị: {product.specifications.equipment}</div>}
                      {product.specifications?.country && <div>Xuất Xứ: {product.specifications.country}</div>}
                      {product.specifications?.power && <div>Công Suất: {product.specifications.power}</div>}
                      {product.specifications?.flowRate && <div>Lưu Lượng: {product.specifications.flowRate}</div>}
                      {product.specifications?.vacuumLevel && <div>Mức Chân Không: {product.specifications.vacuumLevel}</div>}
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
                <div className="mt-auto">
                  <Link 
                                          href={`/products/${product.slug}`}
                    className="btn-primary w-full block text-center"
                  >
                    Xem Chi Tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-red-800 mb-4">Không Thể Tải Sản Phẩm</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchProducts}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Thử Lại
              </button>
            </div>
          </div>
        )}

        {/* No products found */}
        {!error && filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <CogIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-600 mb-6">
              {products.length === 0 
                ? "Hiện tại không có sản phẩm nào. Vui lòng quay lại sau hoặc liên hệ với chúng tôi để được hỗ trợ."
                : "Không có sản phẩm nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh tiêu chí tìm kiếm."}
            </p>
            <div className="h-10"> {/* Fixed height container to reserve space */}
              {products.length > 0 && (
                <button
                  onClick={() => {
                    setFilterByBrand('all')
                    setFilterByPumpType('all')
                    setFilterByEquipment('all')
                    setFilterByPower('all')
                  }}
                  className={`px-6 py-2 rounded-lg transition-all ${
                    (filterByBrand !== 'all' || filterByPumpType !== 'all' || filterByEquipment !== 'all' || filterByPower !== 'all')
                      ? 'bg-blue-600 text-white hover:bg-blue-700 opacity-100 cursor-pointer'
                      : 'bg-transparent text-transparent cursor-default opacity-0 pointer-events-none'
                  }`}
                >
                  Xóa Tất Cả Bộ Lọc
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}