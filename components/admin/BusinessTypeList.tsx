'use client'

import React, { useState } from 'react'
import { IBusinessType } from '@/models/BusinessType'
import ConfirmDialog from '@/components/ConfirmDialog'

interface BusinessTypeWithCount {
  _id: string
  name: string
  customerCount: number
  customers?: Array<{ _id: string; name: string; slug: string }>
  createdAt: Date
  updatedAt: Date
}

interface BusinessTypeListProps {
  businessTypes: BusinessTypeWithCount[]
  onEdit: (businessType: IBusinessType) => void
  onDelete: (businessTypeId: string) => void
}

export default function BusinessTypeList({ businessTypes, onEdit, onDelete }: BusinessTypeListProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    businessType: BusinessTypeWithCount | null
    errorMessage?: string
  }>({
    isOpen: false,
    businessType: null
  })

  const handleDelete = (businessType: BusinessTypeWithCount) => {
    const customerCount = businessType.customerCount || 0
    
    if (customerCount > 0) {
      const customerNames = businessType.customers 
        ? businessType.customers.map((c: any) => c.name).join(', ')
        : 'customers'
      
      setConfirmDialog({
        isOpen: true,
        businessType,
        errorMessage: `Cannot delete "${businessType.name}". It is currently used by ${customerCount} customer${customerCount > 1 ? 's' : ''}: ${customerNames}.\n\nTo delete this business type, first reassign all customers to a different business type.`
      })
      return
    }

    setConfirmDialog({
      isOpen: true,
      businessType
    })
  }

  const handleConfirmDelete = () => {
    if (confirmDialog.businessType && !confirmDialog.errorMessage) {
      onDelete(confirmDialog.businessType._id)
    }
    setConfirmDialog({ isOpen: false, businessType: null })
  }

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, businessType: null })
  }

  if (businessTypes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg mb-2">No business types found</div>
        <p className="text-gray-400">Create your first business type to get started.</p>
      </div>
    )
  }

  const totalCustomers = businessTypes.reduce((sum, bt) => sum + (bt.customerCount || 0), 0)

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {businessTypes.map((businessType) => {
          const customerCount = businessType.customerCount || 0
          const isUsed = customerCount > 0
          
          return (
            <li key={businessType._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {businessType.name}
                    </h3>
                    {isUsed && (
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-help"
                        title={businessType.customers ? 
                          `Used by: ${businessType.customers.map((c: any) => c.name).join(', ')}` : 
                          `Used by ${customerCount} customers`
                        }
                      >
                        {customerCount} customer{customerCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {!isUsed && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Not used
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Created: {new Date(businessType.createdAt).toLocaleDateString()}
                    {isUsed && businessType.customers && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-400">
                          Customers: {businessType.customers.map((c: any) => c.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit({
                      _id: businessType._id,
                      name: businessType.name,
                      customers: businessType.customers || [],
                      createdAt: businessType.createdAt,
                      updatedAt: businessType.updatedAt
                    })}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(businessType)}
                    disabled={isUsed}
                    className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isUsed
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-red-600 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                    }`}
                    title={isUsed ? `Cannot delete - used by ${customerCount} customers` : 'Delete business type'}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Total: {businessTypes.length} business type{businessTypes.length !== 1 ? 's' : ''}
          </span>
          <span>
            Total usage: {totalCustomers} customers
          </span>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.errorMessage ? "Cannot Delete Business Type" : "Delete Business Type"}
        message={confirmDialog.errorMessage || `Are you sure you want to delete "${confirmDialog.businessType?.name}"? This action cannot be undone.`}
        confirmText={confirmDialog.errorMessage ? "OK" : "Delete"}
        cancelText={confirmDialog.errorMessage ? undefined : "Cancel"}
        onConfirm={confirmDialog.errorMessage ? handleCancelDelete : handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger={!confirmDialog.errorMessage}
      />
    </div>
  )
} 