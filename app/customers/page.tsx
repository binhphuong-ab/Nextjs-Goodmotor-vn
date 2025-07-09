'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BuildingOfficeIcon, GlobeAltIcon, MapPinIcon } from '@heroicons/react/24/outline'

interface Customer {
  _id: string
  name: string
  slug: string
  businessType: {
    _id: string
    name: string
    slug: string
  }
  industry: string[]
  website?: string
  logo?: string
  addresses: {
    headquarters: {
      city: string
      country: string
    }
  }
  customerStatus: string
  customerTier: string
  technicalProfile?: {
    primaryApplications: string[]
  }
  tags: string[]
  createdAt: string
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
  'prospect': 'bg-yellow-100 text-yellow-800',
  'active': 'bg-green-100 text-green-800',
  'inactive': 'bg-gray-100 text-gray-800',
  'partner': 'bg-blue-100 text-blue-800',
  'distributor': 'bg-purple-100 text-purple-800'
}

const tierBadges = {
  'standard': 'bg-gray-100 text-gray-800',
  'preferred': 'bg-blue-100 text-blue-800',
  'premium': 'bg-purple-100 text-purple-800',
  'enterprise': 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [filterByType, setFilterByType] = useState<string>('all')
  const [filterByTier, setFilterByTier] = useState<string>('all')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const customersData = await response.json()
        setCustomers(customersData)
      } else {
        console.error('Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const typeMatch = filterByType === 'all' || customer.businessType?.slug === filterByType
    const tierMatch = filterByTier === 'all' || customer.customerTier === filterByTier
    return typeMatch && tierMatch
  })

  const businessTypes = Array.from(new Set(customers.map(c => c.businessType?.slug).filter(Boolean)))
  const customerTiers = Array.from(new Set(customers.map(c => c.customerTier)))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading our valued customers...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white">
        <div className="container-custom py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Our Valued <span className="text-primary-300">Customers</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Trusted by leading companies across industries worldwide. From semiconductor manufacturers to food processors, 
              our vacuum pump solutions power critical operations globally.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-300">{customers.length}+</div>
                <div className="text-primary-200">Active Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-300">{businessTypes.length}</div>
                <div className="text-primary-200">Industries Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-300">
                  {customers.filter(c => c.customerTier === 'enterprise' || c.customerTier === 'premium').length}
                </div>
                <div className="text-primary-200">Premium Partners</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Customer Showcase</h2>
              <p className="text-sm text-gray-600">
                Showing {filteredCustomers.length} of {customers.length} customers
              </p>
            </div>
            
            <div className="flex flex-col gap-6 w-full">
              {/* Business Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <span className="flex items-center gap-2">
                    <BuildingOfficeIcon className="h-4 w-4" />
                    Business Type
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterByType('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      filterByType === 'all'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Types ({customers.length})
                  </button>
                  {businessTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterByType(type)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        filterByType === type
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {businessTypeLabels[type as keyof typeof businessTypeLabels]}
                      ({customers.filter(c => c.businessType?.slug === type).length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Tier Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Customer Tier
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterByTier('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      filterByTier === 'all'
                        ? 'bg-secondary-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Tiers ({customers.length})
                  </button>
                  {customerTiers.map(tier => {
                    const tierColors = {
                      'standard': filterByTier === tier ? 'bg-gray-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
                      'preferred': filterByTier === tier ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50',
                      'premium': filterByTier === tier ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50',
                      'enterprise': filterByTier === tier ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-md' : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-300 hover:from-yellow-200 hover:to-orange-200'
                    }
                    
                    return (
                      <button
                        key={tier}
                        onClick={() => setFilterByTier(tier)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          tierColors[tier as keyof typeof tierColors]
                        }`}
                      >
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        ({customers.filter(c => c.customerTier === tier).length})
                      </button>
                    )
                  })}
                </div>
              </div>


            </div>
          </div>


        </div>
      </div>

      {/* Customers Grid */}
      <div className="container-custom py-12">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCustomers.map((customer) => (
              <Link
                key={customer._id}
                href={`/customers/${customer.slug}`}
                className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                {/* Customer Header */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {customer.logo ? (
                        <div className="flex-shrink-0">
                          <img
                            src={customer.logo}
                            alt={`${customer.name} logo`}
                            className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {customer.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {customer.businessType?.name || 'Unknown Business Type'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tierBadges[customer.customerTier as keyof typeof tierBadges]}`}>
                        {customer.customerTier.charAt(0).toUpperCase() + customer.customerTier.slice(1)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[customer.customerStatus as keyof typeof statusColors]}`}>
                        {customer.customerStatus.charAt(0).toUpperCase() + customer.customerStatus.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>{customer.addresses.headquarters.city}, {customer.addresses.headquarters.country}</span>
                  </div>

                  {/* Industries */}
                  {customer.industry && customer.industry.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {customer.industry.slice(0, 3).map((industry, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
                          >
                            {industry}
                          </span>
                        ))}
                        {customer.industry.length > 3 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                            +{customer.industry.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Applications */}
                  {customer.technicalProfile?.primaryApplications && customer.technicalProfile.primaryApplications.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">Primary Applications:</p>
                      <div className="flex flex-wrap gap-1">
                        {customer.technicalProfile.primaryApplications.slice(0, 2).map((app, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs bg-green-50 text-green-700 rounded-md"
                          >
                            {app}
                          </span>
                        ))}
                        {customer.technicalProfile.primaryApplications.length > 2 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                            +{customer.technicalProfile.primaryApplications.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Website Link */}
                  {customer.website && (
                    <div className="pt-4 border-t border-gray-100">
                      <a
                        href={customer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium group-hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GlobeAltIcon className="h-4 w-4 mr-1" />
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {customer.tags && customer.tags.length > 0 && (
                  <div className="px-6 py-3 bg-gray-50 border-t">
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.slice(0, 4).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                      {customer.tags.length > 4 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-300 text-gray-600 rounded-md">
                          +{customer.tags.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-primary-900 text-white">
        <div className="container-custom py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Join Our Growing Family of Satisfied Customers
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Ready to experience the Good Motor difference? Let's discuss how our vacuum pump solutions 
              can optimize your operations and drive your success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary">
                Get a Quote
              </Link>
              <Link href="/products" className="btn-secondary">
                View Our Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 