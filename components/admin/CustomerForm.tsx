'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ICustomer, ICustomerInput } from '@/models/Customer'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

// Import ReactQuill styles
import 'react-quill/dist/quill.snow.css'

interface BusinessType {
  _id: string
  name: string
}

interface Industry {
  _id: string
  name: string
  slug: string
  category: string
  isActive: boolean
}

interface CustomerFormProps {
  customer?: ICustomer | null
  onSave: (customerData: ICustomerInput) => Promise<void>
  onCancel: () => void
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void
}

const customerStatuses = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'partner', label: 'Partner' },
  { value: 'distributor', label: 'Distributor' }
]

const customerTiers = [
  { value: 'standard', label: 'Standard' },
  { value: 'preferred', label: 'Preferred' },
  { value: 'premium', label: 'Premium' },
  { value: 'enterprise', label: 'Enterprise' }
]

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function CustomerForm({ customer, onSave, onCancel, onShowNotification }: CustomerFormProps) {
  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState<ICustomerInput>({
    name: '',
    slug: '',
    businessType: '',
    industry: [], // Optional now
    completeDate: customer ? undefined : new Date(), // Auto-fill with today for new customers
    isActive: true
  })

  const [loading, setLoading] = useState(false)
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [loadingBusinessTypes, setLoadingBusinessTypes] = useState(true)
  const [industries, setIndustries] = useState<Industry[]>([])
  const [loadingIndustries, setLoadingIndustries] = useState(true)

  useEffect(() => {
    fetchBusinessTypes()
    fetchIndustries()
  }, [])

  const fetchBusinessTypes = async () => {
    try {
      const response = await fetch('/api/admin/business-types')
      if (response.ok) {
        const businessTypesData = await response.json()
        setBusinessTypes(businessTypesData)
        
        // Set default business type and complete date if creating new customer
        if (!customer && businessTypesData.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            businessType: businessTypesData[0]._id,
            completeDate: prev.completeDate || new Date() // Ensure complete date is set
          }))
        }
      } else {
        console.error('Failed to fetch business types')
      }
    } catch (error) {
      console.error('Error fetching business types:', error)
    } finally {
      setLoadingBusinessTypes(false)
    }
  }

  const fetchIndustries = async () => {
    try {
      const response = await fetch('/api/industries')
      if (response.ok) {
        const industriesData = await response.json()
        setIndustries(industriesData.filter((industry: Industry) => industry.isActive))
      } else {
        console.error('Failed to fetch industries')
      }
    } catch (error) {
      console.error('Error fetching industries:', error)
    } finally {
      setLoadingIndustries(false)
    }
  }

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        slug: customer.slug,
        legalName: customer.legalName,
        businessType: customer.businessType.toString(),
        industry: customer.industry || [],
        website: customer.website,
        logo: customer.logo,
        customerStatus: customer.customerStatus,
        customerTier: customer.customerTier,
        completeDate: customer.completeDate,
        description: customer.description,
        isActive: customer.isActive
      })
    }
  }, [customer])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: customer ? prev.slug : generateSlug(value)
      }))
    } else if (name === 'completeDate') {
      // Convert date string to Date object
      setFormData(prev => ({
        ...prev,
        completeDate: value ? new Date(value) : undefined
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }))
    }
  }

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
    setFormData(prev => ({
      ...prev,
      industry: selectedOptions
    }))
  }

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }))
  }

  const validateForm = () => {
    const errors = []
    
    // Basic validation
    if (!formData.name) errors.push('Company Name is required')
    if (!formData.slug) errors.push('Slug is required')
    if (!formData.businessType) errors.push('Business Type is required')
    
    // Logo validation
    if (formData.logo && !(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(formData.logo))) {
      errors.push('Logo URL must be a valid HTTP/HTTPS URL ending with an image extension')
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Validate form
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      const errorMessage = 'Please fix the following errors: ' + validationErrors.join(', ')
      onShowNotification?.('error', errorMessage)
      setLoading(false)
      return
    }
    
    try {
      console.log('CustomerForm submitting data:', formData)
      await onSave(formData)
    } catch (error) {
      console.error('Error saving customer:', error)
      const errorMessage = `Error saving customer: ${error instanceof Error ? error.message : 'Unknown error'}`
      onShowNotification?.('error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }))}
                      className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm hover:bg-gray-200"
                    >
                      Auto
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">URL: /customers/{formData.slug}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Legal Name
                </label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type *
                  </label>
                  {loadingBusinessTypes ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                      Loading business types...
                    </div>
                  ) : (
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Business Type</option>
                      {businessTypes.map(type => (
                        <option key={type._id} value={type._id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industries (Optional)
                  </label>
                  {loadingIndustries ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                      Loading industries...
                    </div>
                  ) : (
                    <select
                      name="industry"
                      multiple
                      value={formData.industry || []}
                      onChange={handleIndustryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      size={4}
                    >
                      {industries.map(industry => (
                        <option key={industry._id} value={industry._id}>
                          {industry.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple industries
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Logo URL
                  </label>
                  <input
                    type="url"
                    name="logo"
                    value={formData.logo || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, GIF, WebP, SVG
                  </p>
                  {formData.logo && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(formData.logo) && (
                    <div className="mt-2">
                      <img
                        src={formData.logo}
                        alt="Company Logo Preview"
                        className="h-16 w-auto border border-gray-200 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status & Tier */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Status & Classification</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Status
                  </label>
                  <select
                    name="customerStatus"
                    value={formData.customerStatus || 'prospect'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {customerStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Tier
                  </label>
                  <select
                    name="customerTier"
                    value={formData.customerTier || 'standard'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {customerTiers.map(tier => (
                      <option key={tier.value} value={tier.value}>
                        {tier.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complete Date
                </label>
                <input
                  type="date"
                  name="completeDate"
                  value={formData.completeDate ? new Date(formData.completeDate).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description and Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <div className="border border-gray-300 rounded-md">
                  <ReactQuill
                    value={formData.description || ''}
                    onChange={handleDescriptionChange}
                    placeholder="Add detailed description about this customer..."
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link'],
                        ['clean']
                      ],
                    }}
                    formats={[
                      'header', 'bold', 'italic', 'underline', 'strike',
                      'list', 'bullet', 'link'
                    ]}
                    style={{ 
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      height: '250px'
                    }}
                  />
                </div>
                <style jsx global>{`
                  .ql-editor {
                    min-height: 180px !important;
                  }
                `}</style>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive || false}
                    onChange={handleInputChange}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Customer</span>
                </label>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 