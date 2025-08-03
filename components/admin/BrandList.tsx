'use client'

import React, { useState } from 'react'
import { IBrand } from '@/models/Brand'
import ConfirmDialog from '@/components/ConfirmDialog'

interface BrandListProps {
  brands: IBrand[]
  onEdit: (brand: IBrand) => void
  onDelete: (brandId: string) => void
}

export default function BrandList({ brands, onEdit, onDelete }: BrandListProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    brand: IBrand | null
  }>({
    isOpen: false,
    brand: null
  })

  const handleDelete = (brand: IBrand) => {
    setConfirmDialog({
      isOpen: true,
      brand
    })
  }

  const handleConfirmDelete = () => {
    if (confirmDialog.brand) {
      onDelete(confirmDialog.brand._id)
    }
    setConfirmDialog({ isOpen: false, brand: null })
  }

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, brand: null })
  }

  if (brands.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg mb-2">No brands found</div>
        <p className="text-gray-400">Create your first brand to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {brands.map((brand) => (
          <li key={brand._id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {brand.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    /{brand.slug}
                  </span>
                  {brand.country && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {brand.country}
                    </span>
                  )}
                  {brand.yearEstablished && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Est. {brand.yearEstablished}
                    </span>
                  )}
                  {brand.revenue && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {brand.revenue}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {brand.description 
                    ? (
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: brand.description.length > 300 
                              ? brand.description.substring(0, 300) + '...' 
                              : brand.description 
                          }} 
                        />
                      )
                    : <span className="text-gray-400 italic">No description available</span>
                  }
                </div>

                {/* Product Lines Section */}
                {brand.productLines && brand.productLines.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Product Lines:</h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {brand.productLines.length} total
                      </span>
                      {brand.productLines.filter(line => line.isActive).length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {brand.productLines.filter(line => line.isActive).length} active
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {brand.productLines
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((line, index) => {
                          const productCount = brand.productLineUsage?.[line._id || '']?.length || 0
                          const productNames = brand.productLineUsage?.[line._id || ''] || []
                          const tooltip = line.description 
                            ? `${line.description}${productCount > 0 ? `\n\nUsed by ${productCount} product(s): ${productNames.join(', ')}` : ''}`
                            : productCount > 0 
                              ? `Used by ${productCount} product(s): ${productNames.join(', ')}`
                              : line.name
                              
                          return (
                            <div
                              key={line._id || index}
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                line.isActive
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-gray-50 text-gray-500 border border-gray-200'
                              }`}
                              title={tooltip}
                            >
                              <span>{line.name}</span>
                              {productCount > 0 && (
                                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-600 rounded-full">
                                  {productCount}
                                </span>
                              )}
                              {!line.isActive && (
                                <span className="ml-1 text-gray-400">(inactive)</span>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
                
                {/* Show message if no product lines */}
                {(!brand.productLines || brand.productLines.length === 0) && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">Product Lines:</h4>
                      <span className="text-xs text-gray-500 italic">No product lines defined</span>
                    </div>
                  </div>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  Created: {new Date(brand.createdAt).toLocaleDateString()}
                  {brand.updatedAt !== brand.createdAt && (
                    <span className="ml-2">
                      Updated: {new Date(brand.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onEdit(brand)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
                {(() => {
                  const productUsage = brand.productUsage || []
                  const hasProducts = productUsage.length > 0
                  const tooltipText = hasProducts 
                    ? `Cannot delete: Used by ${productUsage.length} product(s) - ${productUsage.join(', ')}`
                    : 'Delete this brand'
                  
                  return (
                    <button
                      onClick={() => hasProducts ? null : handleDelete(brand)}
                      disabled={hasProducts}
                      title={tooltipText}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        hasProducts
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-red-600 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                      }`}
                    >
                      Delete
                      {hasProducts && (
                        <span className="ml-1 text-xs">({productUsage.length})</span>
                      )}
                    </button>
                  )
                })()}
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Brands:</span> {brands.length}
          </div>
          <div>
            <span className="font-medium">Countries:</span> {new Set(brands.map(b => b.country).filter(country => country)).size}
          </div>
          <div>
            <span className="font-medium">Product Lines:</span> {brands.reduce((total, brand) => total + (brand.productLines?.length || 0), 0)}
          </div>
          <div>
            <span className="font-medium">Active Lines:</span> {brands.reduce((total, brand) => total + (brand.productLines?.filter(line => line.isActive).length || 0), 0)}
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Brand"
        message={`Are you sure you want to delete "${confirmDialog.brand?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger={true}
      />
      
      <style jsx global>{`
        /* Prose styling for brand descriptions */
        .prose p {
          margin-bottom: 0.5em;
          line-height: 1.5;
          color: #4b5563;
        }
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: #1f2937;
          margin-top: 0.5em;
          margin-bottom: 0.25em;
          font-weight: 600;
        }
        .prose h1 { font-size: 1.1rem; }
        .prose h2 { font-size: 1rem; }
        .prose h3 { font-size: 0.95rem; }
        .prose ul, .prose ol {
          margin-bottom: 0.5em;
          padding-left: 1.25em;
        }
        .prose li {
          margin-bottom: 0.125em;
          color: #4b5563;
        }
        .prose strong {
          font-weight: 600;
          color: #111827;
        }
        .prose a {
          color: #2563eb;
          text-decoration: underline;
        }
        .prose a:hover {
          color: #1d4ed8;
        }
        .prose blockquote {
          border-left: 3px solid #d1d5db;
          padding-left: 0.75em;
          margin: 0.5em 0;
          font-style: italic;
          color: #6b7280;
        }
        .prose code {
          background-color: #f3f4f6;
          padding: 0.125em 0.25em;
          border-radius: 2px;
          font-size: 0.85em;
        }
      `}</style>
    </div>
  )
} 