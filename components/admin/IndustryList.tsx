'use client'

import { useState } from 'react'
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline'

interface Customer {
  _id: string
  name: string
  slug: string
  businessType?: string
  customerStatus?: 'active' | 'inactive' | 'prospect' | 'former'
}

interface Industry {
  _id: string
  name: string
  slug: string
  description?: string
  category: string
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
  stats?: {
    customerCount?: number
    projectCount?: number
    lastUpdated?: Date | string
  }
  customers?: Customer[]
  createdAt: string
  updatedAt: string
}

interface IndustryListProps {
  industries: Industry[]
  onEdit: (industry: Industry) => void
  onDelete: (industryId: string) => void
  onCreate: () => void
}

const categoryLabels = {
  'manufacturing': 'Manufacturing',
  'processing': 'Processing',
  'research': 'Research',
  'energy': 'Energy',
  'healthcare': 'Healthcare',
  'technology': 'Technology',
  'other': 'Other'
}

const categoryColors = {
  'manufacturing': 'bg-blue-100 text-blue-800',
  'processing': 'bg-green-100 text-green-800',
  'research': 'bg-purple-100 text-purple-800',
  'energy': 'bg-yellow-100 text-yellow-800',
  'healthcare': 'bg-red-100 text-red-800',
  'technology': 'bg-indigo-100 text-indigo-800',
  'other': 'bg-gray-100 text-gray-800'
}

const customerStatusColors = {
  'active': 'bg-green-100 text-green-800',
  'inactive': 'bg-gray-100 text-gray-800',
  'prospect': 'bg-blue-100 text-blue-800',
  'former': 'bg-red-100 text-red-800'
}

const customerStatusLabels = {
  'active': 'Active',
  'inactive': 'Inactive',
  'prospect': 'Prospect',
  'former': 'Former'
}

export default function IndustryList({ industries, onEdit, onDelete, onCreate }: IndustryListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredIndustries = industries.filter(industry => {
    const matchesSearch = industry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         industry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         industry.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || industry.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && industry.isActive) ||
                         (statusFilter === 'inactive' && !industry.isActive)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const sortedIndustries = filteredIndustries.sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return (a.displayOrder || 0) - (b.displayOrder || 0)
    }
    return a.name.localeCompare(b.name)
  })

  const categories = Array.from(new Set(industries.map(industry => industry.category)))

  const handleDelete = (industry: Industry) => {
    if (confirm(`Are you sure you want to delete "${industry.name}"? This action cannot be undone.`)) {
      onDelete(industry._id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Industries</h2>
          <p className="text-gray-600">Manage industry categories and their characteristics</p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Industry
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search industries..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {sortedIndustries.length} of {industries.length} industries
            </div>
          </div>
        </div>
      </div>

      {/* Industries Grid */}
      {sortedIndustries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <div className="text-gray-400 text-6xl mb-4">🏭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No industries found</h3>
          <p className="text-gray-500">
            {industries.length === 0 
              ? "Get started by creating your first industry category."
              : "Try adjusting your filters or search terms."
            }
          </p>
          {industries.length === 0 && (
            <button
              onClick={onCreate}
              className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create First Industry
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedIndustries.map((industry) => (
            <div
              key={industry._id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{industry.name}</h3>
                    {!industry.isActive && (
                      <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${categoryColors[industry.category as keyof typeof categoryColors]}`}>
                      {categoryLabels[industry.category as keyof typeof categoryLabels]}
                    </span>
                    {industry.displayOrder !== undefined && industry.displayOrder > 0 && (
                      <span className="text-xs text-gray-500">
                        Order: {industry.displayOrder}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={() => window.open(`/api/industries/${industry._id}/customers`, '_blank')}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="View Customers"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(industry)}
                    className="p-1 text-gray-400 hover:text-primary-600"
                    title="Edit Industry"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(industry)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete Industry"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {industry.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {industry.description}
                </p>
              )}

              {/* Quick Stats */}
              <div className="space-y-3">
                {/* Applications */}
                {industry.characteristics?.commonApplications && industry.characteristics.commonApplications.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Common Applications:</h4>
                    <div className="flex flex-wrap gap-1">
                      {industry.characteristics.commonApplications.slice(0, 3).map((app, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
                        >
                          {app}
                        </span>
                      ))}
                      {industry.characteristics.commonApplications.length > 3 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-md">
                          +{industry.characteristics.commonApplications.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Market Info */}
                {(industry.marketInfo?.marketSize || industry.marketInfo?.growthRate) && (
                  <div className="flex gap-4 text-xs text-gray-600">
                    {industry.marketInfo.marketSize && (
                      <div>
                        <span className="font-medium">Market:</span> {industry.marketInfo.marketSize}
                      </div>
                    )}
                    {industry.marketInfo.growthRate && (
                      <div>
                        <span className="font-medium">Growth:</span> {industry.marketInfo.growthRate}
                      </div>
                    )}
                  </div>
                )}

                {/* Usage Stats */}
                <div className="flex gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <div>
                    <span className="font-medium">{industry.stats?.customerCount || 0}</span> customers
                  </div>
                  {industry.stats?.projectCount !== undefined && (
                    <div>
                      <span className="font-medium">{industry.stats.projectCount}</span> projects
                    </div>
                  )}
                  {industry.stats?.lastUpdated && (
                    <div className="text-gray-500">
                      Updated: {new Date(industry.stats.lastUpdated).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Customers Section */}
                {industry.customers && industry.customers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">
                      Customers ({industry.customers.length}):
                    </h4>
                    <div className="space-y-1">
                      {industry.customers.slice(0, 3).map((customer) => (
                        <div
                          key={customer._id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">
                              {customer.name}
                            </div>
                            {customer.businessType && (
                              <div className="text-xs text-gray-500 truncate">
                                {customer.businessType}
                              </div>
                            )}
                          </div>
                          {customer.customerStatus && (
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${customerStatusColors[customer.customerStatus]}`}>
                              {customerStatusLabels[customer.customerStatus]}
                            </span>
                          )}
                        </div>
                      ))}
                      {industry.customers.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          + {industry.customers.length - 3} more customers
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                Created: {new Date(industry.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 