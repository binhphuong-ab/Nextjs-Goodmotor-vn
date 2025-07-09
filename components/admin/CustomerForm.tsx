'use client'

import { useState, useEffect } from 'react'
import { ICustomer, ICustomerInput } from '@/models/Customer'

interface Industry {
  _id: string
  name: string
  slug: string
  category: string
  isActive: boolean
}

interface BusinessType {
  _id: string
  name: string
  slug: string
  description?: string
  category: string
  isActive: boolean
  displayOrder: number
}

interface CustomerFormProps {
  customer?: ICustomer | null
  onSave: (customerData: ICustomerInput) => Promise<void>
  onCancel: () => void
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

const departments = [
  { value: 'purchasing', label: 'Purchasing' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'management', label: 'Management' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' }
]

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<ICustomerInput>({
    name: '',
    slug: '',
    businessType: '',
    industry: [],
    contactInfo: {
      primaryEmail: '',
      primaryPhone: ''
    },
    addresses: {
      headquarters: {
        street: '',
        city: '',
        postalCode: '',
        country: ''
      }
    },
    contacts: [],
    financialInfo: {
      currency: 'USD'
    },
    tags: [],
    isActive: true
  })

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'technical' | 'financial'>('basic')
  const [industries, setIndustries] = useState<Industry[]>([])
  const [loadingIndustries, setLoadingIndustries] = useState(true)
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [loadingBusinessTypes, setLoadingBusinessTypes] = useState(true)

  const cleanFormData = (data: ICustomerInput): ICustomerInput => {
    const cleaned = { ...data }
    
    // Clean logo URL - remove if invalid
    if (cleaned.logo && !(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(cleaned.logo))) {
      cleaned.logo = ''
    }
    
    // Clean credit rating - remove if invalid
    if (cleaned.financialInfo?.creditRating && 
        !['excellent', 'good', 'fair', 'poor'].includes(cleaned.financialInfo.creditRating)) {
      cleaned.financialInfo = { ...cleaned.financialInfo, creditRating: undefined }
    }
    
    // Ensure required financialInfo structure
    if (!cleaned.financialInfo) {
      cleaned.financialInfo = { currency: 'USD' }
    }
    
    // Clean businessDetails enum values
    if (cleaned.businessDetails?.annualRevenue && 
        !['under-1m', '1m-10m', '10m-50m', '50m-100m', '100m-500m', '500m+'].includes(cleaned.businessDetails.annualRevenue)) {
      cleaned.businessDetails = { ...cleaned.businessDetails, annualRevenue: undefined }
    }
    
    if (cleaned.businessDetails?.employeeCount && 
        !['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].includes(cleaned.businessDetails.employeeCount)) {
      cleaned.businessDetails = { ...cleaned.businessDetails, employeeCount: undefined }
    }
    
    // Clean technicalProfile enum values
    if (cleaned.technicalProfile?.typicalOrderVolume && 
        !['single-unit', 'small-batch', 'medium-batch', 'large-batch', 'bulk'].includes(cleaned.technicalProfile.typicalOrderVolume)) {
      cleaned.technicalProfile = { ...cleaned.technicalProfile, typicalOrderVolume: undefined }
    }
    
    // Clean preferred pump types
    if (cleaned.technicalProfile?.preferredPumpTypes) {
      const validPumpTypes = ['rotary-vane', 'scroll', 'diaphragm', 'turbomolecular', 'liquid-ring', 'roots-blower', 'claw-pump', 'other']
      cleaned.technicalProfile.preferredPumpTypes = cleaned.technicalProfile.preferredPumpTypes.filter(type => 
        validPumpTypes.includes(type)
      )
    }
    
    // Remove any undefined or null nested objects
    if (cleaned.businessDetails && Object.values(cleaned.businessDetails).every(v => v === undefined || v === null)) {
      cleaned.businessDetails = undefined
    }
    
    if (cleaned.technicalProfile && Object.values(cleaned.technicalProfile).every(v => v === undefined || v === null || (Array.isArray(v) && v.length === 0))) {
      cleaned.technicalProfile = undefined
    }
    
    return cleaned
  }

  useEffect(() => {
    fetchIndustries()
    fetchBusinessTypes()
  }, [])

  const fetchIndustries = async () => {
    try {
      const response = await fetch('/api/industries?active=true')
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

  const fetchBusinessTypes = async () => {
    try {
      const response = await fetch('/api/business-types')
      if (response.ok) {
        const businessTypesData = await response.json()
        setBusinessTypes(businessTypesData)
        
        // Set default business type if creating new customer
        if (!customer && businessTypesData.length > 0) {
          setFormData(prev => ({ ...prev, businessType: businessTypesData[0]._id }))
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

  useEffect(() => {
    if (customer) {
      // Clean the customer data before setting it to the form
      const cleanedCustomer = cleanFormData({
        name: customer.name,
        slug: customer.slug,
        legalName: customer.legalName,
        businessType: customer.businessType.toString(),
        industry: customer.industry,
        website: customer.website,
        logo: customer.logo,
        contactInfo: customer.contactInfo,
        addresses: customer.addresses,
        businessDetails: customer.businessDetails,
        contacts: customer.contacts,
        customerStatus: customer.customerStatus,
        customerTier: customer.customerTier,
        acquisitionDate: customer.acquisitionDate,
        lastContactDate: customer.lastContactDate,
        assignedSalesRep: customer.assignedSalesRep,
        technicalProfile: customer.technicalProfile,
        financialInfo: customer.financialInfo,
        notes: customer.notes,
        tags: customer.tags,
        isActive: customer.isActive
      })
      setFormData(cleanedCustomer)
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
    } else if (name.includes('.')) {
      const keys = name.split('.')
      setFormData(prev => {
        const newData = { ...prev }
        let current: any = newData
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {}
          current = current[keys[i]]
        }
        
        current[keys[keys.length - 1]] = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        return newData
      })
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }))
    }
  }

  const handleArrayChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev }
      if (field === 'tags') {
        const array = value.split(',').map(item => item.trim()).filter(item => item.length > 0)
        newData.tags = array
      }
      return newData
    })
  }

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          name: '',
          title: '',
          email: '',
          phone: '',
          department: 'purchasing',
          isPrimary: false
        }
      ]
    }))
  }

  const updateContact = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }))
  }

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const errors = []
    
    // Basic Info validation
    if (!formData.name) errors.push('Company Name is required')
    if (!formData.slug) errors.push('Slug is required')
    if (formData.industry.length === 0) errors.push('At least one industry must be selected')
    
    // Logo validation
    if (formData.logo && !(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(formData.logo))) {
      errors.push('Logo URL must be a valid HTTP/HTTPS URL ending with an image extension (.jpg, .jpeg, .png, .gif, .webp, .svg)')
    }
    
    // Contact Info validation
    if (!formData.contactInfo.primaryEmail) errors.push('Primary Email is required')
    if (!formData.contactInfo.primaryPhone) errors.push('Primary Phone is required')
    
    // Address validation
    if (!formData.addresses.headquarters.street) errors.push('Headquarters Street Address is required')
    if (!formData.addresses.headquarters.city) errors.push('Headquarters City is required')
    if (!formData.addresses.headquarters.postalCode) errors.push('Headquarters Postal Code is required')
    if (!formData.addresses.headquarters.country) errors.push('Headquarters Country is required')
    
    // Financial Info validation
    if (formData.financialInfo?.creditRating && 
        !['excellent', 'good', 'fair', 'poor'].includes(formData.financialInfo.creditRating)) {
      errors.push('Credit Rating must be one of: Excellent, Good, Fair, Poor')
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Validate form
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n\n' + validationErrors.join('\n'))
      setLoading(false)
      return
    }
    
    try {
      const cleanedData = cleanFormData(formData)
      console.log('CustomerForm submitting data:', cleanedData)
      await onSave(cleanedData)
    } catch (error) {
      console.error('Error saving customer:', error)
      alert(`Error saving customer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'basic', label: 'Basic Info' },
              { key: 'contact', label: 'Contact & Address' },
              { key: 'technical', label: 'Technical Profile' },
              { key: 'financial', label: 'Financial & Status' }
            ].map(tab => {
              const hasErrors = (() => {
                if (tab.key === 'basic') {
                  return !formData.name || !formData.slug || formData.industry.length === 0
                }
                if (tab.key === 'contact') {
                  return !formData.contactInfo.primaryEmail || 
                         !formData.contactInfo.primaryPhone ||
                         !formData.addresses.headquarters.street ||
                         !formData.addresses.headquarters.city ||
                         !formData.addresses.headquarters.postalCode ||
                         !formData.addresses.headquarters.country
                }
                return false
              })()
              
              return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                  {hasErrors && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
              </button>
              )
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[60vh]">
          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-4">
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
                    Supported formats: JPG, PNG, GIF, WebP, SVG (must end with .jpg, .jpeg, .png, .gif, .webp, or .svg)
                  </p>
                  {formData.logo && !(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(formData.logo)) && (
                    <p className="text-xs text-red-600 mt-1">
                      Invalid logo URL format. Must be a valid HTTP/HTTPS URL ending with an image extension.
                    </p>
                  )}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industries *
                  </label>
                  {loadingIndustries ? (
                    <div className="text-sm text-gray-500">Loading industries...</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto p-3">
                        {industries.length === 0 ? (
                          <div className="text-sm text-gray-500">No industries available</div>
                        ) : (
                          industries.map((industry) => (
                            <label key={industry._id} className="flex items-center space-x-2 py-1">
                              <input
                                type="checkbox"
                                checked={formData.industry.includes(industry._id)}
                                onChange={(e) => {
                                  const newIndustry = e.target.checked
                                    ? [...formData.industry, industry._id]
                                    : formData.industry.filter(id => id !== industry._id)
                                  setFormData(prev => ({ ...prev, industry: newIndustry }))
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{industry.name}</span>
                              <span className="text-xs text-gray-500">({industry.category})</span>
                            </label>
                          ))
                        )}
                      </div>
                      {formData.industry.length === 0 && (
                        <p className="text-sm text-red-600">Please select at least one industry</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Selected: {formData.industry.length} industries
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('tags', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="vip, high-volume, technical"
                  />
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                {/* Primary Contact Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Email *
                      </label>
                      <input
                        type="email"
                        name="contactInfo.primaryEmail"
                        value={formData.contactInfo.primaryEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Phone *
                      </label>
                      <input
                        type="tel"
                        name="contactInfo.primaryPhone"
                        value={formData.contactInfo.primaryPhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Headquarters Address */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Headquarters Address</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="addresses.headquarters.street"
                        value={formData.addresses.headquarters.street}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="addresses.headquarters.city"
                          value={formData.addresses.headquarters.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          name="addresses.headquarters.postalCode"
                          value={formData.addresses.headquarters.postalCode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <input
                          type="text"
                          name="addresses.headquarters.country"
                          value={formData.addresses.headquarters.country}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Contacts */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Key Contacts</h3>
                    <button
                      type="button"
                      onClick={addContact}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Contact
                    </button>
                  </div>
                  
                  {formData.contacts.map((contact, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">Contact {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeContact(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => updateContact(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={contact.title}
                            onChange={(e) => updateContact(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateContact(index, 'email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Department
                          </label>
                          <select
                            value={contact.department}
                            onChange={(e) => updateContact(index, 'department', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {departments.map(dept => (
                              <option key={dept.value} value={dept.value}>
                                {dept.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes about this customer..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="space-y-4">
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
                      Credit Rating
                    </label>
                    <select
                      name="financialInfo.creditRating"
                      value={formData.financialInfo?.creditRating || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Credit Rating</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <input
                      type="text"
                      name="financialInfo.currency"
                      value={formData.financialInfo?.currency || 'USD'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="USD"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive || false}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Customer</span>
                  </label>
                </div>
              </div>
            )}
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