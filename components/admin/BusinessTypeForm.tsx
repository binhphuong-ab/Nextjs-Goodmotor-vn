'use client'

import React, { useState, useEffect } from 'react'
import { IBusinessType, IBusinessTypeInput } from '@/models/BusinessType'

interface BusinessTypeFormProps {
  businessType?: IBusinessType | null
  onSave: (data: IBusinessTypeInput) => void
  onCancel: () => void
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void
}

export default function BusinessTypeForm({ businessType, onSave, onCancel, onShowNotification }: BusinessTypeFormProps) {
  const [formData, setFormData] = useState<IBusinessTypeInput>({
    name: ''
  })
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (businessType) {
      setFormData({
        name: businessType.name
      })
    }
  }, [businessType])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Business type name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave({
        name: formData.name.trim()
      })
    } else {
      const errorMessages = Object.values(errors).filter(Boolean)
      onShowNotification?.('error', 'Please fix the following errors: ' + errorMessages.join(', '))
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-medium text-gray-900">
            {businessType ? 'Edit Business Type' : 'Add New Business Type'}
          </h2>
          
          {/* Action Buttons in Header */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="business-type-form"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {businessType ? 'Update' : 'Create'} Business Type
            </button>
          </div>
        </div>
        
        <form id="business-type-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Business Type Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. Manufacturing, Pharmaceutical, etc."
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

        </form>
      </div>
    </div>
  )
} 