'use client'

import { useState } from 'react'
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline'
import ConfirmDialog from '@/components/ConfirmDialog'

interface Application {
  _id: string
  name: string
  slug: string
  category?: string
}

interface Customer {
  _id: string
  name: string
  slug: string
  businessType?: string
}

interface Industry {
  _id: string
  name: string
  slug: string
  description?: string
  category: string
  displayOrder?: number
  stats?: {
    customerCount?: number
    applicationCount?: number
    lastUpdated?: Date | string
  }
  customers?: Customer[]
  applications?: Application[]
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



export default function IndustryList({ industries, onEdit, onDelete, onCreate }: IndustryListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    industry: Industry | null
  }>({
    isOpen: false,
    industry: null
  })

  const filteredIndustries = industries.filter(industry => {
    const matchesSearch = industry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         industry.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || industry.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const sortedIndustries = filteredIndustries.sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return (a.displayOrder || 0) - (b.displayOrder || 0)
    }
    return a.name.localeCompare(b.name)
  })

  const categories = Array.from(new Set(industries.map(industry => industry.category)))

  // Helper function to check if industry has linked customers
  const hasLinkedEntities = (industry: Industry) => {
    const customerCount = industry.stats?.customerCount || 0
    const applicationCount = industry.stats?.applicationCount || 0
    const customersArray = industry.customers?.length || 0
    const applicationsArray = industry.applications?.length || 0
    return customerCount > 0 || customersArray > 0 || applicationCount > 0 || applicationsArray > 0
  }

  const handleDelete = (industry: Industry) => {
    // Only allow delete if no linked customers or applications
    if (!hasLinkedEntities(industry)) {
      setConfirmDialog({
        isOpen: true,
        industry
      })
    }
  }

  const handleConfirmDelete = () => {
    if (confirmDialog.industry) {
      onDelete(confirmDialog.industry._id)
    }
    setConfirmDialog({ isOpen: false, industry: null })
  }

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, industry: null })
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {sortedIndustries.length} of {industries.length} industries
            </div>
          </div>
        </div>
      </div>

      {/* Industries Table */}
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
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statistics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recent Customers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedIndustries.map((industry) => {
                  const hasCustomers = hasLinkedEntities(industry)
                  
                  return (
                    <tr key={industry._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {industry.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {industry.slug}
                            </div>
                            {industry.displayOrder !== undefined && industry.displayOrder > 0 && (
                              <div className="text-xs text-gray-400">
                                Order: {industry.displayOrder}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${categoryColors[industry.category as keyof typeof categoryColors]}`}>
                          {categoryLabels[industry.category as keyof typeof categoryLabels]}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {industry.description ? (
                            industry.description.length > 100 
                              ? industry.description.substring(0, 100) + '...'
                              : industry.description
                          ) : (
                            <span className="text-gray-400 italic">No description</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{industry.stats?.customerCount || 0}</span>
                              <span className="text-gray-500">customers</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{industry.stats?.applicationCount || 0}</span>
                              <span className="text-gray-500">apps</span>
                              {hasCustomers && (
                                <span className="ml-1 text-amber-600" title="Has linked entities - deletion disabled">
                                  🔒
                                </span>
                              )}
                            </div>
                          </div>
                          {industry.stats?.lastUpdated && (
                            <div className="text-xs text-gray-500 mt-1">
                              Updated: {new Date(industry.stats.lastUpdated).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {industry.customers && industry.customers.length > 0 ? (
                            <div className="space-y-1">
                              {industry.customers.slice(0, 2).map((customer) => (
                                <div key={customer._id} className="flex items-center justify-between">
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
                                </div>
                              ))}
                              {industry.customers.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{industry.customers.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">No customers</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(`/api/industries/${industry._id}/customers`, '_blank')}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Customers"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onEdit(industry)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Industry"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(industry)}
                            disabled={hasCustomers}
                            className={`${
                              hasCustomers 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-red-600 hover:text-red-900'
                            }`}
                            title={
                              hasCustomers 
                                ? `Cannot delete: ${industry.stats?.customerCount || industry.customers?.length || 0} linked customers, ${industry.stats?.applicationCount || industry.applications?.length || 0} linked applications`
                                : "Delete Industry"
                            }
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Industry"
        message={`Are you sure you want to delete "${confirmDialog.industry?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger={true}
      />
    </div>
  )
} 