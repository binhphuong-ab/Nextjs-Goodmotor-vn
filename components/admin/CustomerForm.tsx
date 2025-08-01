'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { generateSlug } from '@/lib/utils'
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
  category?: string
  displayOrder?: number
}

// Extended interface for populated customer data from API
interface PopulatedCustomer extends Omit<ICustomer, 'industry' | 'businessType'> {
  industry?: (string | { _id: string; name: string; slug: string })[]
  businessType: string | { _id: string; name: string }
}

interface CustomerFormProps {
  customer?: PopulatedCustomer | null
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
    projects: [],
    pumpModelsUsed: [],
    applications: [],
    countryOfOrigin: '',
    equipmentType: '',
    featured: false
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
        setIndustries(industriesData)
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
      // Convert industry data - handle both populated objects and ObjectId strings
      const industryIds = customer.industry?.map(item => {
        // Handle populated objects
        if (typeof item === 'object' && item._id) {
          return item._id.toString()
        }
        // Handle ObjectId strings
        return item.toString()
      }) || []

      setFormData({
        name: customer.name,
        slug: customer.slug,
        legalName: customer.legalName,
        businessType: typeof customer.businessType === 'object' && customer.businessType._id 
          ? customer.businessType._id.toString() 
          : customer.businessType.toString(),
        industry: industryIds,
        website: customer.website,
        logo: customer.logo,
        customerStatus: customer.customerStatus,
        customerTier: customer.customerTier,
        completeDate: customer.completeDate,
        description: customer.description,
        projects: customer.projects || [],
        pumpModelsUsed: customer.pumpModelsUsed || [],
        applications: customer.applications || [],
        countryOfOrigin: customer.countryOfOrigin || '',
        equipmentType: customer.equipmentType || '',
        featured: customer.featured
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

  // Handlers for dynamic array fields
  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), { name: '', url: '' }]
    }))
  }

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects?.filter((_, i) => i !== index) || []
    }))
  }

  const updateProject = (index: number, field: 'name' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects?.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      ) || []
    }))
  }

  const addPumpModel = () => {
    setFormData(prev => ({
      ...prev,
      pumpModelsUsed: [...(prev.pumpModelsUsed || []), { name: '', url: '' }]
    }))
  }

  const removePumpModel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pumpModelsUsed: prev.pumpModelsUsed?.filter((_, i) => i !== index) || []
    }))
  }

  const updatePumpModel = (index: number, field: 'name' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      pumpModelsUsed: prev.pumpModelsUsed?.map((model, i) => 
        i === index ? { ...model, [field]: value } : model
      ) || []
    }))
  }

  const addApplication = () => {
    setFormData(prev => ({
      ...prev,
      applications: [...(prev.applications || []), { name: '', url: '' }]
    }))
  }

  const removeApplication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      applications: prev.applications?.filter((_, i) => i !== index) || []
    }))
  }

  const updateApplication = (index: number, field: 'name' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      applications: prev.applications?.map((app, i) => 
        i === index ? { ...app, [field]: value } : app
      ) || []
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

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh] flex flex-col">
          <div className="p-6 space-y-6 flex-1">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  {loadingBusinessTypes ? (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      Loading business types...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <select
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                          size={5}
                          required
                        >
                          <option value="">Choose a business type...</option>
                          {businessTypes.map(type => (
                            <option 
                              key={type._id} 
                              value={type._id}
                              className="py-2 px-2 hover:bg-blue-50 cursor-pointer"
                            >
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-gray-500">
                        <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <div>Click to select a business type</div>
                          {formData.businessType && (
                            <div className="mt-1 text-blue-600 font-medium">
                              {businessTypes.find(type => type._id === formData.businessType)?.name} selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Industries */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industries <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  {loadingIndustries ? (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      Loading industries...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <select
                          name="industry"
                          multiple
                          value={formData.industry || []}
                          onChange={handleIndustryChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                          size={5}
                        >
                          {industries.map(industry => (
                            <option 
                              key={industry._id} 
                              value={industry._id}
                              className="py-2 px-2 hover:bg-blue-50 cursor-pointer"
                            >
                              {industry.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-gray-500">
                        <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <div>Hold <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">Ctrl</kbd> (Windows) or <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">Cmd</kbd> (Mac) to select multiple industries</div>
                          {formData.industry && formData.industry.length > 0 && (
                            <div className="mt-1 text-blue-600 font-medium">
                              {formData.industry.length} industr{formData.industry.length === 1 ? 'y' : 'ies'} selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Country of Origin and Equipment Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Country of Origin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country of Origin <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        name="countryOfOrigin"
                        value={formData.countryOfOrigin || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                        size={5}
                      >
                        <option value="">Select country of origin...</option>
                        <option value="Germany" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Germany</option>
                        <option value="Japan" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Japan</option>
                        <option value="Korea" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Korea</option>
                        <option value="United States" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">United States</option>
                        <option value="UK" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">UK</option>
                        <option value="France" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">France</option>
                        <option value="China" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">China</option>
                        <option value="Vietnam" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Vietnam</option>
                        <option value="Other" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Other</option>
                      </select>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-gray-500">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div>Select the primary country where equipment originates</div>
                        {formData.countryOfOrigin && (
                          <div className="mt-1 text-blue-600 font-medium">
                            {formData.countryOfOrigin} selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Type <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        name="equipmentType"
                        value={formData.equipmentType || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                        size={5}
                      >
                        <option value="">Select equipment type...</option>
                        <option value="Bơm chân không" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Bơm chân không</option>
                        <option value="Phụ tùng bơm" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Phụ tùng bơm</option>
                        <option value="Thiết bị chân không" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Thiết bị chân không</option>
                      </select>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-gray-500">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div>Choose the primary type of equipment</div>
                        {formData.equipmentType && (
                          <div className="mt-1 text-blue-600 font-medium">
                            {formData.equipmentType} selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Settings
                  </label>
                  <div className="pt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured || false}
                        onChange={handleInputChange}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured Customer</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Featured customers will be highlighted on the homepage and other promotional areas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <div className="mb-4">
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
                      borderRadius: '0.375rem'
                    }}
                  />
                  <style jsx global>{`
                    .ql-container {
                      height: 200px !important;
                    }
                    .ql-editor {
                      min-height: 180px !important;
                      max-height: 180px !important;
                      overflow-y: auto;
                    }
                  `}</style>
                </div>
              </div>
            </div>

            {/* Projects, Pump Models, and Applications */}
            <div className="space-y-6 mt-8">
              {/* Projects */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-900">Projects (Optional)</h4>
                  <button
                    type="button"
                    onClick={addProject}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Project
                  </button>
                </div>
                {formData.projects?.map((project, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-700">Project {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Project Name *
                        </label>
                        <input
                          type="text"
                          value={project.name}
                          onChange={(e) => updateProject(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter project name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Project URL
                        </label>
                        <input
                          type="url"
                          value={project.url || ''}
                          onChange={(e) => updateProject(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/project"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pump Models Used */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-900">Pump Models Used (Optional)</h4>
                  <button
                    type="button"
                    onClick={addPumpModel}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Pump Model
                  </button>
                </div>
                {formData.pumpModelsUsed?.map((model, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-700">Pump Model {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removePumpModel(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pump Model Name *
                        </label>
                        <input
                          type="text"
                          value={model.name}
                          onChange={(e) => updatePumpModel(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter pump model name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pump Model URL
                        </label>
                        <input
                          type="url"
                          value={model.url || ''}
                          onChange={(e) => updatePumpModel(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/pump-model"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Applications */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-900">Applications (Optional)</h4>
                  <button
                    type="button"
                    onClick={addApplication}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Application
                  </button>
                </div>
                {formData.applications?.map((application, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-700">Application {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeApplication(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Application Name *
                        </label>
                        <input
                          type="text"
                          value={application.name}
                          onChange={(e) => updateApplication(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter application name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Application URL
                        </label>
                        <input
                          type="url"
                          value={application.url || ''}
                          onChange={(e) => updateApplication(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/application"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-6 flex justify-end space-x-3">
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