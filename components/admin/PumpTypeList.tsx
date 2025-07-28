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
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {pumpType.pumpType}
                  </h3>
                  {pumpType.productUsage && pumpType.productUsage.length > 0 && (
                    <span 
                      className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-green-600 rounded-full"
                      title={`Used by ${pumpType.productUsage.length} product(s): ${pumpType.productUsage.join(', ')}`}
                    >
                      {pumpType.productUsage.length}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Created: {new Date(pumpType.createdAt).toLocaleDateString()}
                  {pumpType.updatedAt !== pumpType.createdAt && (
                    <span className="ml-2">
                      Updated: {new Date(pumpType.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
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
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Pump Types:</span> {pumpTypes.length}
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
    </div>
  )
} 