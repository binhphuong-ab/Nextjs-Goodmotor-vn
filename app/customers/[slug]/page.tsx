'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  BuildingOfficeIcon, 
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface Customer {
  _id: string
  name: string
  slug: string
  legalName?: string
  businessType: {
    _id: string
    name: string
  }
  industry?: {
    _id: string
    name: string
    slug: string
  }[]
  website?: string
  logo?: string
  customerStatus: string
  customerTier: string
  completeDate?: string
  description?: string
  featured: boolean
  createdAt: string
  updatedAt: string
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

  // Simplified customer model - no contacts array

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
              
              {customer.description && (
                <div className="mb-6">
                  <div 
                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: customer.description }}
                  />
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

              {/* Customer Information */}
              {customer.completeDate && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Complete Date</span>
                      <p className="text-gray-900">{new Date(customer.completeDate).toLocaleDateString()}</p>
                    </div>
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


          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[customer.customerStatus as keyof typeof statusColors]}`}>
                    {customer.customerStatus.charAt(0).toUpperCase() + customer.customerStatus.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Tier</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tierBadges[customer.customerTier as keyof typeof tierBadges]}`}>
                    {customer.customerTier.charAt(0).toUpperCase() + customer.customerTier.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Business Type</span>
                  <span className="text-sm text-gray-900">{customer.businessType.name}</span>
                </div>
                
                {customer.completeDate && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Complete Date</span>
                    <span className="text-sm text-gray-900">
                      {new Date(customer.completeDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Featured</span>
                  <span className={`text-sm font-medium ${customer.featured ? 'text-blue-600' : 'text-gray-600'}`}>
                    {customer.featured ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 