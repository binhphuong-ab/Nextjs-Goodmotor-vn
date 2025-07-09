'use client'

import { useState } from 'react'

interface Industry {
  _id?: string
  name: string
  slug: string
  description?: string
  category?: string
  characteristics?: {
    typicalVacuumRequirements: string[]
    commonApplications: string[]
    regulatoryRequirements?: string[]
    standardCertifications?: string[]
  }
  marketInfo?: {
    marketSize?: string
    growthRate?: string
    keyDrivers?: string[]
    challenges?: string[]
  }
  keywords?: string[]
  isActive: boolean
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
    characteristics: {
      typicalVacuumRequirements: industry?.characteristics?.typicalVacuumRequirements || [],
      commonApplications: industry?.characteristics?.commonApplications || [],
      regulatoryRequirements: industry?.characteristics?.regulatoryRequirements || [],
      standardCertifications: industry?.characteristics?.standardCertifications || []
    },
    marketInfo: {
      marketSize: industry?.marketInfo?.marketSize || '',
      growthRate: industry?.marketInfo?.growthRate || '',
      keyDrivers: industry?.marketInfo?.keyDrivers || [],
      challenges: industry?.marketInfo?.challenges || []
    },
    keywords: industry?.keywords || [],
    isActive: industry?.isActive ?? true,
    displayOrder: industry?.displayOrder || 0
  })

  const [activeTab, setActiveTab] = useState<'basic' | 'characteristics' | 'market' | 'seo'>('basic')

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any || {}),
        [field]: value
      }
    }))
  }

  const handleArrayInputChange = (section: string | null, field: string, value: string[]) => {
    if (section) {
      handleNestedInputChange(section, field, value)
    } else {
      handleInputChange(field, value)
    }
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

  const renderArrayInput = (label: string, section: string | null, field: string, placeholder: string) => {
    const value = section 
      ? (formData[section as keyof typeof formData] as any)?.[field] || []
      : formData[field as keyof typeof formData] || []

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="space-y-2">
          {value.map((item: string, index: number) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newArray = [...value]
                  newArray[index] = e.target.value
                  handleArrayInputChange(section, field, newArray)
                }}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={placeholder}
              />
              <button
                type="button"
                onClick={() => {
                  const newArray = value.filter((_: any, i: number) => i !== index)
                  handleArrayInputChange(section, field, newArray)
                }}
                className="px-3 py-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              handleArrayInputChange(section, field, [...value, ''])
            }}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            + Add {label.slice(0, -1)}
          </button>
        </div>
      </div>
    )
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
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'basic', label: 'Basic Info' },
            { key: 'characteristics', label: 'Characteristics' },
            { key: 'market', label: 'Market Info' },
            { key: 'seo', label: 'SEO & Settings' }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
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

          <div className="grid grid-cols-2 gap-4">
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
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Characteristics Tab */}
      {activeTab === 'characteristics' && (
        <div className="space-y-6">
          {renderArrayInput(
            'Typical Vacuum Requirements',
            'characteristics',
            'typicalVacuumRequirements',
            'e.g., High vacuum (10^-3 to 10^-6 mbar)'
          )}
          
          {renderArrayInput(
            'Common Applications',
            'characteristics',
            'commonApplications',
            'e.g., Freeze drying, Packaging, etc.'
          )}
          
          {renderArrayInput(
            'Regulatory Requirements',
            'characteristics',
            'regulatoryRequirements',
            'e.g., FDA compliance, HACCP, etc.'
          )}
          
          {renderArrayInput(
            'Standard Certifications',
            'characteristics',
            'standardCertifications',
            'e.g., ISO 9001, NSF International, etc.'
          )}
        </div>
      )}

      {/* Market Info Tab */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Market Size
              </label>
              <input
                type="text"
                value={formData.marketInfo?.marketSize}
                onChange={(e) => handleNestedInputChange('marketInfo', 'marketSize', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., $500B+ globally"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Growth Rate
              </label>
              <input
                type="text"
                value={formData.marketInfo?.growthRate}
                onChange={(e) => handleNestedInputChange('marketInfo', 'growthRate', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 8-12% annually"
              />
            </div>
          </div>

          {renderArrayInput(
            'Key Market Drivers',
            'marketInfo',
            'keyDrivers',
            'e.g., Aging population, Technology advancement'
          )}
          
          {renderArrayInput(
            'Market Challenges',
            'marketInfo',
            'challenges',
            'e.g., Regulatory complexity, Cost pressures'
          )}
        </div>
      )}

      {/* SEO & Settings Tab */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          {renderArrayInput(
            'SEO Keywords',
            null,
            'keywords',
            'e.g., pharmaceutical, drug manufacturing'
          )}
        </div>
      )}

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