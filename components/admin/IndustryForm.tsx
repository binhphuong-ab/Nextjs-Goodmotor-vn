'use client'

import { useState } from 'react'

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

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function IndustryForm({ industry, onSubmit, onCancel }: IndustryFormProps) {
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
            <h2 className="text-2xl font-bold text-gray-900">
              {industry ? 'Edit Industry' : 'Add New Industry'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {industry?._id ? 'Update' : 'Create'} Industry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 