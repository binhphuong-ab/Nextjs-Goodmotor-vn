'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/models/Product'
import Notification from '@/components/Notification'
import ConfirmDialog from '@/components/ConfirmDialog'

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}

interface NotificationState {
  type: 'success' | 'error' | 'info'
  message: string
  visible: boolean
}

export default function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  const [notification, setNotification] = useState<NotificationState | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    product: Product | null
  }>({
    isOpen: false,
    product: null
  })

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, visible: true })
  }

  const hideNotification = () => {
    setNotification(null)
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('vi-VN')} VNĐ`
  }

  const handleEdit = (product: Product) => {
    onEdit(product)
    showNotification('info', `Editing product: ${product.name}`)
  }

  const handleDelete = (product: Product) => {
    setConfirmDialog({
      isOpen: true,
      product
    })
  }

  const handleConfirmDelete = () => {
    if (confirmDialog.product) {
      onDelete(confirmDialog.product._id || '')
      setConfirmDialog({ isOpen: false, product: null })
    }
  }

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, product: null })
  }

  // Safely access nested properties
  const getPumpTypeName = (product: Product) => {
    if (!product.pumpType) return null
    return typeof product.pumpType === 'object' && 'pumpType' in product.pumpType 
      ? (product.pumpType as any).pumpType 
      : 'Pump Type Selected'
  }

  const getBrandName = (product: Product) => {
    if (!product.brand) return null
    return typeof product.brand === 'object' && 'name' in product.brand 
      ? (product.brand as any).name 
      : 'Brand Selected'
  }

  const getProductLineName = (product: Product) => {
    if (!product.productLineId || !product.brand) return null
    
    // Check if brand is populated with productLines
    if (typeof product.brand === 'object' && 'productLines' in product.brand) {
      const brand = product.brand as any
      if (brand.productLines && Array.isArray(brand.productLines)) {
        const productLine = brand.productLines.find((line: any) => line._id === product.productLineId)
        return productLine ? productLine.name : null
      }
    }
    return null
  }

  const getPrimaryImageUrl = (product: Product) => {
    if (product.images && product.images.length > 0) {
      // Find primary image first
      const primaryImage = product.images.find(img => img.isPrimary)
      if (primaryImage) return primaryImage.url
      
      // If no primary image, use first image
      return product.images[0].url
    }
    
    return null
  }

  const getPrimaryImageAlt = (product: Product) => {
    if (product.images && product.images.length > 0) {
      // Find primary image first
      const primaryImage = product.images.find(img => img.isPrimary)
      if (primaryImage && primaryImage.alt) return primaryImage.alt
      
      // If no primary image or alt, use first image alt or product name
      return product.images[0].alt || product.name
    }
    
    // Fallback to product name
    return product.name
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pump Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Line
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <Image
                        className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                        src={getPrimaryImageUrl(product) || '/images/placeholder-product.jpg'}
                        alt={getPrimaryImageAlt(product)}
                        width={48}
                        height={48}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/images/placeholder-product.jpg'
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs">
                        {product.description ? (
                          <div 
                            className="truncate"
                            dangerouslySetInnerHTML={{ 
                              __html: product.description.replace(/<[^>]*>/g, '').substring(0, 60) + '...' 
                            }}
                          />
                        ) : (
                          <span className="text-gray-400 italic">No description</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getPumpTypeName(product) ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getPumpTypeName(product)}
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                      No pump type
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getBrandName(product) ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {getBrandName(product)}
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                      No brand
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getProductLineName(product) ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {getProductLineName(product)}
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                      No product line
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {product.specifications?.country ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      {product.specifications.country}
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                      No country
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {product.specifications?.equipment ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      {product.specifications.equipment}
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                      No equipment
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.price ? (
                    <span className="font-medium">{formatPrice(product.price)}</span>
                  ) : (
                    <span className="text-gray-400 italic">N/A</span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg mt-4">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Add your first product to get started.</p>
          </div>
        )}
      </div>

      {/* Auto-closing Notification */}
      {notification && notification.visible && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
          autoClose={true}
          duration={3000}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${confirmDialog.product?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger={true}
      />
    </>
  )
} 