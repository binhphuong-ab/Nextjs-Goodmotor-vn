'use client'

import { useState } from 'react'
import { generateSlug } from '@/lib/utils'

interface Industry {
  _id?: string
  name: string
  slug: string
  description?: string
  category?: string
  displayOrder?: number
}

interface IndustryFormProps {
  industry?: Industry
  onSubmit: (industryData: Omit<Industry, '_id'>) => void
  onCancel: () => void
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void
}

const categoryOptions = [
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'processing', label: 'Processing' },
  { value: 'research', label: 'Research' },
  { value: 'energy', label: 'Energy' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'technology', label: 'Technology' },
  { value: 'other', label: 'Other' }
]



export default function IndustryForm({ industry, onSubmit, onCancel, onShowNotification }: IndustryFormProps) {
  const [formData, setFormData] = useState<Omit<Industry, '_id'>>({
    name: industry?.name || '',
    slug: industry?.slug || '',
    description: industry?.description || '',
    category: industry?.category || 'other',
    displayOrder: industry?.displayOrder || 0
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNameChange = (value: string) => {
    handleInputChange('name', value)
    if (!industry?._id) {
      handleInputChange('slug', generateSlug(value))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-screen overflow-y-auto w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-900">
              {industry ? 'Edit Industry' : 'Add New Industry'}
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
                form="industry-form"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {industry?._id ? 'Update' : 'Create'} Industry
              </button>
            </div>
          </div>

          <form id="industry-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    pattern="^[a-z0-9-]+$"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('slug', generateSlug(formData.name))}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Auto-generate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  URL: /industries/{formData.slug}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                      size={5}
                    >
                      {categoryOptions.map(option => (
                        <option 
                          key={option.value} 
                          value={option.value}
                          className="py-2 px-2 hover:bg-blue-50 cursor-pointer"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div>Select the industry category</div>
                      {formData.category && (
                        <div className="mt-1 text-blue-600 font-medium">
                          {categoryOptions.find(option => option.value === formData.category)?.label} selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Detailed description of the industry and its vacuum pump applications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used for ordering industries in lists (0 = default order)
                </p>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
} 