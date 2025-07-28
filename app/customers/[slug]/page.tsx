'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  BuildingOfficeIcon, 
  GlobeAltIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  UsersIcon,
  CogIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Customer {
  _id: string
  name: string
  slug: string
  legalName?: string
  businessType: {
    _id: string
    name: string
    slug: string
  }
  industry: {
    _id: string
    name: string
    slug: string
  }[]
  website?: string
  logo?: string
  
  // Contact Information
  contactInfo: {
    primaryEmail: string
    primaryPhone: string
    secondaryPhone?: string
    fax?: string
  }
  
  // Address Information
  addresses: {
    headquarters: {
      street: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
    billing?: {
      street: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
    shipping?: {
      street: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
  }
  
  // Business Details
  businessDetails?: {
    foundedYear?: number
    employeeCount?: string
    annualRevenue?: string
    registrationNumber?: string
    taxId?: string
  }
  
  // Key Contacts
  contacts: Array<{
    name: string
    title: string
    email: string
    phone?: string
    department: string
    isPrimary: boolean
  }>
  
  // Customer Relationship
  customerStatus: string
  customerTier: string
  acquisitionDate?: string
  lastContactDate?: string
  assignedSalesRep?: string
  
  // Technical Information
  technicalProfile?: {
    primaryApplications: string[]
    requiredVacuumLevels?: string[]
    preferredPumpTypes: string[]
    typicalOrderVolume?: string
    technicalRequirements?: string[]
    certificationNeeds?: string[]
  }
  
  // Financial Information
  financialInfo?: {
    creditRating?: string
    paymentTerms?: string
    creditLimit?: number
    currency: string
  }
  
  // Notes and Tags
  notes?: string
  tags: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const businessTypeLabels = {
  'machine-builder': 'Machine Builder',
  'factory': 'Factory',
  'manufacturing': 'Manufacturing',
  'pharmaceutical': 'Pharmaceutical',
  'semiconductor': 'Semiconductor',
  'food-processing': 'Food Processing',
  'chemical': 'Chemical',
  'automotive': 'Automotive',
  'aerospace': 'Aerospace',
  'research': 'Research',
  'distributor': 'Distributor',
  'other': 'Other'
}

const statusColors = {
  'prospect': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'active': 'bg-green-100 text-green-800 border-green-200',
  'inactive': 'bg-gray-100 text-gray-800 border-gray-200',
  'partner': 'bg-blue-100 text-blue-800 border-blue-200',
  'distributor': 'bg-purple-100 text-purple-800 border-purple-200'
}

const tierBadges = {
  'standard': 'bg-gray-100 text-gray-800 border-gray-200',
  'preferred': 'bg-blue-100 text-blue-800 border-blue-200',
  'premium': 'bg-purple-100 text-purple-800 border-purple-200',
  'enterprise': 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300'
}

const pumpTypeLabels = {
  'rotary-vane': 'Rotary Vane',
  'scroll': 'Scroll',
  'diaphragm': 'Diaphragm',
  'turbomolecular': 'Turbomolecular',
  'liquid-ring': 'Liquid Ring',
  'roots-blower': 'Roots Blower',
  'claw-pump': 'Claw Pump',
  'other': 'Other'
}

const departmentLabels = {
  'purchasing': 'Purchasing',
  'engineering': 'Engineering',
  'maintenance': 'Maintenance',
  'management': 'Management',
  'finance': 'Finance',
  'other': 'Other'
}

export default function CustomerDetailPage() {
  const { slug } = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchCustomer(slug as string)
    }
  }, [slug])

  const fetchCustomer = async (customerSlug: string) => {
    try {
      const response = await fetch(`/api/customers/${customerSlug}`)
      if (response.ok) {
        const customerData = await response.json()
        setCustomer(customerData)
      } else if (response.status === 404) {
        setError('Customer not found')
      } else {
        setError('Failed to fetch customer details')
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
      setError('An error occurred while loading customer details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-20">
          <div className="text-center">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {error || 'Customer not found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The customer you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/customers" className="mt-4 inline-flex items-center btn-primary">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Customers
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const primaryContact = customer.contacts.find(c => c.isPrimary) || customer.contacts[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/customers" className="text-gray-400 hover:text-gray-500">
                  Customers
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-900">{customer.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {customer.logo ? (
                <img
                  src={customer.logo}
                  alt={`${customer.name} logo`}
                  className="h-20 w-20 rounded-xl object-cover border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="h-20 w-20 bg-primary-100 rounded-xl flex items-center justify-center">
                  <BuildingOfficeIcon className="h-10 w-10 text-primary-600" />
                </div>
              )}
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                {customer.legalName && customer.legalName !== customer.name && (
                  <p className="text-lg text-gray-600 mt-1">Legal Name: {customer.legalName}</p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${tierBadges[customer.customerTier as keyof typeof tierBadges]}`}>
                    {customer.customerTier.charAt(0).toUpperCase() + customer.customerTier.slice(1)} Customer
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${statusColors[customer.customerStatus as keyof typeof statusColors]}`}>
                    {customer.customerStatus.charAt(0).toUpperCase() + customer.customerStatus.slice(1)}
                  </span>
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                    {customer.businessType.name}
                  </span>
                </div>
              </div>
            </div>
            
            <Link href="/customers" className="btn-secondary">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Customers
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Company Overview</h2>
              
              {customer.notes && (
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">{customer.notes}</p>
                </div>
              )}

              {/* Industries */}
              {customer.industry && customer.industry.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    {customer.industry.map((industry, index) => (
                      <span
                        key={index}
                        className="inline-flex px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md border border-blue-200"
                      >
                        {industry.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Details */}
              {customer.businessDetails && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Business Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    {customer.businessDetails.foundedYear && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Founded</span>
                        <p className="text-gray-900">{customer.businessDetails.foundedYear}</p>
                      </div>
                    )}
                    {customer.businessDetails.employeeCount && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Employee Count</span>
                        <p className="text-gray-900">{customer.businessDetails.employeeCount}</p>
                      </div>
                    )}
                    {customer.businessDetails.annualRevenue && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Annual Revenue</span>
                        <p className="text-gray-900">{customer.businessDetails.annualRevenue}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Website */}
              {customer.website && (
                <div className="pt-4 border-t border-gray-100">
                  <a
                    href={customer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium"
                  >
                    <GlobeAltIcon className="h-5 w-5 mr-2" />
                    Visit Website
                  </a>
                </div>
              )}
            </div>

            {/* Technical Profile */}
            {customer.technicalProfile && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CogIcon className="h-6 w-6 mr-2 text-primary-600" />
                  Technical Profile
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Applications */}
                  {customer.technicalProfile.primaryApplications && customer.technicalProfile.primaryApplications.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Primary Applications</h3>
                      <div className="space-y-2">
                        {customer.technicalProfile.primaryApplications.map((app, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 text-sm bg-green-50 text-green-700 rounded-md border border-green-200 mr-2 mb-2"
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pump Preferences */}
                  {customer.technicalProfile.preferredPumpTypes && customer.technicalProfile.preferredPumpTypes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Preferred Pump Types</h3>
                      <div className="space-y-2">
                        {customer.technicalProfile.preferredPumpTypes.map((pump, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-md border border-purple-200 mr-2 mb-2"
                          >
                            {pumpTypeLabels[pump as keyof typeof pumpTypeLabels] || pump}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vacuum Requirements */}
                  {customer.technicalProfile.requiredVacuumLevels && customer.technicalProfile.requiredVacuumLevels.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Required Vacuum Levels</h3>
                      <div className="space-y-1">
                        {customer.technicalProfile.requiredVacuumLevels.map((level, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md border border-blue-200 mr-2 mb-2"
                          >
                            {level}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Volume & Certifications */}
                  <div>
                    {customer.technicalProfile.typicalOrderVolume && (
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Typical Order Volume</h3>
                        <p className="text-gray-700">{customer.technicalProfile.typicalOrderVolume}</p>
                      </div>
                    )}
                    
                    {customer.technicalProfile.certificationNeeds && customer.technicalProfile.certificationNeeds.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Certification Needs</h3>
                        <div className="flex flex-wrap gap-2">
                          {customer.technicalProfile.certificationNeeds.map((cert, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Key Contacts */}
            {customer.contacts && customer.contacts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <UsersIcon className="h-6 w-6 mr-2 text-primary-600" />
                  Key Contacts
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.contacts.map((contact, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${contact.isPrimary ? 'border-primary-200 bg-primary-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        {contact.isPrimary && (
                          <span className="inline-flex px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{contact.title}</p>
                      <p className="text-sm text-blue-600">{departmentLabels[contact.department as keyof typeof departmentLabels] || contact.department}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-700 flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {contact.email}
                        </p>
                        {contact.phone && (
                          <p className="text-sm text-gray-700 flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {contact.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Contact</h3>
              
              <div className="space-y-3">
                {primaryContact ? (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-900">{primaryContact.name}</h4>
                      <p className="text-sm text-gray-600">{primaryContact.title}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {primaryContact.email}
                      </p>
                      {primaryContact.phone && (
                        <p className="text-sm text-gray-700 flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {primaryContact.phone}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {customer.contactInfo.primaryEmail}
                    </p>
                    <p className="text-sm text-gray-700 flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {customer.contactInfo.primaryPhone}
                    </p>
                    {customer.contactInfo.secondaryPhone && (
                      <p className="text-sm text-gray-700 flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {customer.contactInfo.secondaryPhone} (Secondary)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Addresses</h3>
              
              {/* Headquarters */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 flex items-center mb-2">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  Headquarters
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{customer.addresses.headquarters.street}</p>
                  <p>
                    {customer.addresses.headquarters.city}
                    {customer.addresses.headquarters.state && `, ${customer.addresses.headquarters.state}`}
                  </p>
                  <p>{customer.addresses.headquarters.country} {customer.addresses.headquarters.postalCode}</p>
                </div>
              </div>

              {/* Billing Address */}
              {customer.addresses.billing && (
                <div className="mb-4 pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2">Billing Address</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{customer.addresses.billing.street}</p>
                    <p>
                      {customer.addresses.billing.city}
                      {customer.addresses.billing.state && `, ${customer.addresses.billing.state}`}
                    </p>
                    <p>{customer.addresses.billing.country} {customer.addresses.billing.postalCode}</p>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {customer.addresses.shipping && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{customer.addresses.shipping.street}</p>
                    <p>
                      {customer.addresses.shipping.city}
                      {customer.addresses.shipping.state && `, ${customer.addresses.shipping.state}`}
                    </p>
                    <p>{customer.addresses.shipping.country} {customer.addresses.shipping.postalCode}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Financial Information */}
            {customer.financialInfo && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Financial Information
                </h3>
                
                <div className="space-y-3">
                  {customer.financialInfo.creditRating && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Credit Rating</span>
                      <span className="text-sm text-gray-900 capitalize">{customer.financialInfo.creditRating}</span>
                    </div>
                  )}
                  {customer.financialInfo.paymentTerms && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Payment Terms</span>
                      <span className="text-sm text-gray-900">{customer.financialInfo.paymentTerms}</span>
                    </div>
                  )}
                  {customer.financialInfo.creditLimit && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Credit Limit</span>
                      <span className="text-sm text-gray-900">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: customer.financialInfo.currency || 'USD'
                        }).format(customer.financialInfo.creditLimit)}
                      </span>
                    </div>
                  )}
                </div>

                {customer.assignedSalesRep && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Sales Rep</span>
                      <span className="text-sm text-gray-900">{customer.assignedSalesRep}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {customer.tags && customer.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 