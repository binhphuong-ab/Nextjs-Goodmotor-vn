'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BuildingOfficeIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { ICustomerPopulated } from '@/types/customer'







export default function CustomersPage() {
  const [customers, setCustomers] = useState<ICustomerPopulated[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [filterByType, setFilterByType] = useState<string>('all')
  const [filterByCountry, setFilterByCountry] = useState<string>('all')

  useEffect(() => {
    fetchCustomers()

  }, [])

  const fetchCustomers = async (retryAttempt = 0) => {
    try {
      console.log('Fetching customers...')
      const response = await fetch('/api/customers')
      
      if (response.ok) {
        const customersData = await response.json()
        setCustomers(customersData)
        setError(null) // Clear any previous errors
        console.log(`Successfully loaded ${customersData.length} customers`)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`Failed to fetch customers: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      
      // Retry logic - try up to 2 more times with exponential backoff
      if (retryAttempt < 2) {
        console.log(`Retrying customer fetch in ${(retryAttempt + 1) * 1000}ms...`)
        setTimeout(() => {
          setRetryCount(retryAttempt + 1)
          fetchCustomers(retryAttempt + 1)
        }, (retryAttempt + 1) * 1000)
        return
      }
      
      // Final failure after retries
      setError(error instanceof Error ? error.message : 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }



  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setRetryCount(0)
    fetchCustomers()
  }

  const filteredCustomers = customers.filter(customer => {
    const typeMatch = filterByType === 'all' || customer.businessType === filterByType
    const countryMatch = filterByCountry === 'all' || customer.country === filterByCountry
    return typeMatch && countryMatch
  })

  const countries = Array.from(new Set(customers.map(c => c.country)))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Loading our valued customers...
              {retryCount > 0 && <span className="block text-sm text-gray-500 mt-2">Retry attempt {retryCount}</span>}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Unable to Load Customers</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Refresh Page
              </button>
            </div>
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
                <div className="text-3xl font-bold text-primary-300">5</div>
                <div className="text-primary-200">Business Types</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-300">
                  {countries.length}
                </div>
                <div className="text-primary-200">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Showcase</h2>
            <p className="text-lg text-gray-600">
              Discover our trusted partners across industries
            </p>
          </div>

          {/* Filter Controls */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="space-y-8">
              
              {/* Business Type Filter */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <BuildingOfficeIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Business Type</h3>
                    <p className="text-sm text-gray-600">Filter by industry sector</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  <button
                    onClick={() => setFilterByType('all')}
                    className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      filterByType === 'all'
                        ? 'bg-primary-600 text-white shadow-lg ring-2 ring-primary-200'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">All Types</div>
                      <div className="text-xs opacity-75">{customers.length} customers</div>
                    </div>
                  </button>
                  
                  {['Machinary service', 'Nhà chế tạo máy', 'Nhà máy Việt Nam', 'Nhà máy nước ngoài', 'Xưởng sản xuất'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterByType(type)}
                      className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        filterByType === type
                          ? 'bg-primary-600 text-white shadow-lg ring-2 ring-primary-200'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium">{type}</div>
                        <div className="text-xs opacity-75">
                          {customers.filter(c => c.businessType === type).length} customers
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Country Filter */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Country</h3>
                    <p className="text-sm text-gray-600">Filter by customer location</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  <button
                    onClick={() => setFilterByCountry('all')}
                    className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      filterByCountry === 'all'
                        ? 'bg-secondary-600 text-white shadow-lg ring-2 ring-secondary-200'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">All Countries</div>
                      <div className="text-xs opacity-75">{customers.length} customers</div>
                    </div>
                  </button>
                  
                  {countries.map(country => (
                    <button
                      key={country}
                      onClick={() => setFilterByCountry(country)}
                      className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        filterByCountry === country
                          ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-200'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium">{country}</div>
                        <div className="text-xs opacity-75">
                          {customers.filter(c => c.country === country).length} customers
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">
                    Showing {filteredCustomers.length} of {customers.length} customers
                  </span>
                </div>
                

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="bg-gray-100">
        <div className="container-custom py-16">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters to see more results</p>
              <button
                onClick={() => {
                  setFilterByType('all')
                  setFilterByCountry('all')
                }}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCustomers.map((customer) => (
                <Link
                  key={customer._id}
                  href={`/customers/${customer.slug}`}
                  className="group"
                >
                  <div className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200 transform hover:-translate-y-1">
                    {/* Customer Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {customer.logo ? (
                            <div className="flex-shrink-0">
                              <img
                                src={customer.logo}
                                alt={`${customer.name} logo`}
                                className="h-14 w-14 rounded-xl object-cover border border-gray-200 shadow-sm"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-14 w-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-sm">
                              <BuildingOfficeIcon className="h-7 w-7 text-primary-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                              {customer.name}
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                              {customer.businessType || 'Unknown Business Type'}
                            </p>
                            {customer.legalName && customer.legalName !== customer.name && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {customer.legalName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {customer.country}
                        </span>
                        {customer.province && (
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            {customer.province}
                          </span>
                        )}
                      </div>

                      {/* Website Link */}
                      {customer.website && (
                        <div className="mb-4">
                          <a
                            href={customer.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium group-hover:underline transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GlobeAltIcon className="h-4 w-4 mr-2" />
                            Visit Website
                          </a>
                        </div>
                      )}

                      {/* Complete Date */}
                      {customer.completeDate && (
                        <div className="text-xs text-gray-500 mb-4">
                          <span className="font-medium">Completed:</span> {new Date(customer.completeDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Industries Footer */}
                    {customer.industry && customer.industry.length > 0 && (
                      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Industries</p>
                        <div className="flex flex-wrap gap-2">
                          {customer.industry.slice(0, 3).map((industry, index: number) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md font-medium"
                            >
                              {industry.name}
                            </span>
                          ))}
                          {customer.industry.length > 3 && (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-md font-medium">
                              +{customer.industry.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Hover Effect Indicator */}
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-primary-500 ring-opacity-0 group-hover:ring-opacity-20 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
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