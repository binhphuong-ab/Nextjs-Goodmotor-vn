'use client'

import React, { useState } from 'react'
import { IPumpType } from '@/models/PumpType'
import ConfirmDialog from '@/components/ConfirmDialog'

interface PumpTypeListProps {
  pumpTypes: IPumpType[]
  onEdit: (pumpType: IPumpType) => void
  onDelete: (pumpTypeId: string) => void
}

export default function PumpTypeList({ pumpTypes, onEdit, onDelete }: PumpTypeListProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    pumpType: IPumpType | null
  }>({
    isOpen: false,
    pumpType: null
  })

  const handleDelete = (pumpType: IPumpType) => {
    setConfirmDialog({
      isOpen: true,
      pumpType
    })
  }

  const handleConfirmDelete = () => {
    if (confirmDialog.pumpType) {
      onDelete(confirmDialog.pumpType._id)
    }
    setConfirmDialog({ isOpen: false, pumpType: null })
  }

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, pumpType: null })
  }

  if (pumpTypes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg mb-2">No pump types found</div>
        <p className="text-gray-400">Create your first pump type to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {pumpTypes.map((pumpType) => (
          <li key={pumpType._id} className="px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 flex space-x-4">
                {/* Image Section */}
                {pumpType.image && (
                  <div className="flex-shrink-0">
                    <img
                      src={pumpType.image}
                      alt={`${pumpType.pumpType} image`}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                
                {/* Content Section */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {pumpType.pumpType}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      /{pumpType.slug}
                    </span>
                    {pumpType.productUsage && pumpType.productUsage.length > 0 && (
                      <span 
                        className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-green-600 rounded-full"
                        title={`Used by ${pumpType.productUsage.length} product(s): ${pumpType.productUsage.join(', ')}`}
                      >
                        {pumpType.productUsage.length}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {pumpType.description 
                      ? (
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: pumpType.description.length > 300 
                                ? pumpType.description.substring(0, 300) + '...' 
                                : pumpType.description 
                            }} 
                          />
                        )
                      : <span className="text-gray-400 italic">No description available</span>
                    }
                  </div>

                {/* Sub Pump Types Section */}
                {pumpType.subPumpTypes && pumpType.subPumpTypes.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Sub Pump Types:</h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {pumpType.subPumpTypes.length} total
                      </span>
                      {pumpType.subPumpTypes.filter(subType => subType.isActive).length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {pumpType.subPumpTypes.filter(subType => subType.isActive).length} active
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {pumpType.subPumpTypes
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((subType, index) => {
                          const productCount = pumpType.subPumpTypeUsage?.[subType._id || '']?.length || 0
                          const productNames = pumpType.subPumpTypeUsage?.[subType._id || ''] || []
                          const tooltip = subType.description 
                            ? `${subType.description}${productCount > 0 ? `\n\nUsed by ${productCount} product(s): ${productNames.join(', ')}` : ''}`
                            : productCount > 0 
                              ? `Used by ${productCount} product(s): ${productNames.join(', ')}`
                              : subType.name
                              
                          return (
                            <div
                              key={subType._id || index}
                              className={`flex items-center space-x-2 p-2 rounded-md border ${
                                subType.isActive
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-gray-50 text-gray-500 border-gray-200'
                              }`}
                              title={tooltip}
                            >
                              {/* Sub Pump Type Image */}
                              {subType.image && (
                                <img
                                  src={subType.image}
                                  alt={`${subType.name} image`}
                                  className="w-8 h-8 rounded object-cover border border-gray-200 flex-shrink-0"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                  }}
                                />
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs font-medium truncate">{subType.name}</span>
                                  {productCount > 0 && (
                                    <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-green-600 rounded-full flex-shrink-0">
                                      {productCount}
                                    </span>
                                  )}
                                  {!subType.isActive && (
                                    <span className="text-xs text-gray-400">(inactive)</span>
                                  )}
                                </div>
                                {subType.slug && (
                                  <div className="text-xs text-gray-500 truncate">/{subType.slug}</div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
                
                {/* Show message if no sub pump types */}
                {(!pumpType.subPumpTypes || pumpType.subPumpTypes.length === 0) && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">Sub Pump Types:</h4>
                      <span className="text-xs text-gray-500 italic">No sub pump types defined</span>
                    </div>
                  </div>
                )}
                  <div className="mt-1 text-xs text-gray-500">
                    Created: {new Date(pumpType.createdAt).toLocaleDateString()}
                    {pumpType.updatedAt !== pumpType.createdAt && (
                      <span className="ml-2">
                        Updated: {new Date(pumpType.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2 ml-4">
                <button
                  onClick={() => onEdit(pumpType)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
                {(() => {
                  const productUsage = pumpType.productUsage || []
                  const hasProducts = productUsage.length > 0
                  const tooltipText = hasProducts 
                    ? `Cannot delete: Used by ${productUsage.length} product(s) - ${productUsage.join(', ')}`
                    : 'Delete this pump type'
                  
                  return (
                    <button
                      onClick={() => hasProducts ? null : handleDelete(pumpType)}
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
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Pump Types:</span> {pumpTypes.length}
          </div>
          <div>
            <span className="font-medium">Sub Types:</span> {pumpTypes.reduce((total, pt) => total + (pt.subPumpTypes?.length || 0), 0)}
          </div>
          <div>
            <span className="font-medium">In Use:</span> {pumpTypes.filter(pt => pt.productUsage && pt.productUsage.length > 0).length}
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Pump Type"
        message={`Are you sure you want to delete "${confirmDialog.pumpType?.pumpType}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger={true}
      />
      
      <style jsx global>{`
        /* Prose styling for pump type descriptions */
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