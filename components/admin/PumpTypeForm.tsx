'use client'

import React, { useState, useEffect } from 'react'
import { IPumpType, IPumpTypeInput } from '@/models/PumpType'
import { generateSlug } from '@/lib/utils'

interface PumpTypeFormProps {
  pumpType?: IPumpType | null
  onSave: (data: IPumpTypeInput) => void
  onCancel: () => void
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void
}

export default function PumpTypeForm({ pumpType, onSave, onCancel, onShowNotification }: PumpTypeFormProps) {
  const [formData, setFormData] = useState<IPumpTypeInput>({
    pumpType: '',
    slug: ''
  })
  
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (pumpType) {
      setFormData({
        pumpType: pumpType.pumpType,
        slug: pumpType.slug
      })
    }
  }, [pumpType])

  // Use centralized generateSlug function from utils (supports Vietnamese)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'pumpType') {
      setFormData(prev => ({
        ...prev,
        pumpType: value,
        // Auto-generate slug when pump type changes (only if creating new or slug is empty)
        slug: (!pumpType || !prev.slug) ? generateSlug(value) : prev.slug
      }))
    } else if (name === 'slug') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
    
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const validateForm = (): boolean => {
    if (!formData.pumpType.trim()) {
      setError('Pump type is required')
      return false
    }

    if (!formData.slug.trim()) {
      setError('Slug is required')
      return false
    }

    // Validate slug format
    const slugPattern = /^[a-z0-9-]+$/
    if (!slugPattern.test(formData.slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens')
      return false
    }

    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave({
        pumpType: formData.pumpType.trim(),
        slug: formData.slug.trim()
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-medium text-gray-900">
            {pumpType ? 'Edit Pump Type' : 'Add New Pump Type'}
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
              form="pump-type-form"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pumpType ? 'Update' : 'Create'} Pump Type
            </button>
          </div>
        </div>
        
        <form id="pump-type-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="pumpType" className="block text-sm font-medium text-gray-700 mb-1">
              Pump Type *
            </label>
            <input
              type="text"
              id="pumpType"
              name="pumpType"
              value={formData.pumpType}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error && error.includes('Pump type') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. Rotary Vane, Screw, Liquid Ring, Diaphragm"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error && (error.includes('Slug') || error.includes('slug')) ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. rotary-vane, screw, liquid-ring, diaphragm"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL-friendly identifier. Auto-generated from pump type, but can be customized.
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

        </form>
      </div>
    </div>
  )
} 