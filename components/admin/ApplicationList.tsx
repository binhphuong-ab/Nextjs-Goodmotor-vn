'use client'

import { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon, EyeIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { IApplication } from '@/models/Application'
import ConfirmDialog from '@/components/ConfirmDialog'

interface ApplicationListProps {
  applications: IApplication[]
  onEdit: (application: IApplication) => void
  onDelete: (applicationId: string) => void
  onCreate: () => void
}

const categoryLabels = {
  'freeze-drying': 'Freeze Drying',
  'distillation': 'Distillation',
  'packaging': 'Packaging',
  'plastic': 'Plastic',
  'degassing': 'Degassing',
  'filtration': 'Filtration',
  'drying': 'Drying',
  'metallurgy': 'Metallurgy',
  'electronics': 'Electronics',
  'medical': 'Medical',
  'research': 'Research',
  'other': 'Other'
}

const categoryColors = {
  'freeze-drying': 'bg-blue-100 text-blue-800',
  'distillation': 'bg-purple-100 text-purple-800',
  'packaging': 'bg-green-100 text-green-800',
  'plastic': 'bg-yellow-100 text-yellow-800',
  'degassing': 'bg-red-100 text-red-800',
  'filtration': 'bg-indigo-100 text-indigo-800',
  'drying': 'bg-orange-100 text-orange-800',
  'metallurgy': 'bg-gray-100 text-gray-800',
  'electronics': 'bg-cyan-100 text-cyan-800',
  'medical': 'bg-pink-100 text-pink-800',
  'research': 'bg-teal-100 text-teal-800',
  'other': 'bg-gray-100 text-gray-800'
}

export default function ApplicationList({ applications, onEdit, onDelete, onCreate }: ApplicationListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [industries, setIndustries] = useState<Array<{ _id: string, name: string, slug: string }>>([])
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    application: IApplication | null
  }>({
    isOpen: false,
    application: null
  })

  // Fetch industries
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await fetch('/api/admin/industries')
        if (response.ok) {
          const data = await response.json()
          setIndustries(data.industries || [])
        }
      } catch (error) {
        console.error('Failed to fetch industries:', error)
      }
    }

    fetchIndustries()
  }, [])

  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         application.products?.some(product => product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         application.projects?.some(project => project.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || application.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const sortedApplications = filteredApplications.sort((a, b) => {
    if (a.featured !== b.featured) {
      return b.featured ? 1 : -1 // Featured items first
    }
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder
    }
    return a.name.localeCompare(b.name)
  })

  const categories = Array.from(new Set(applications.map(app => app.category)))

  const handleDelete = (application: IApplication) => {
    setConfirmDialog({
      isOpen: true,
      application
    })
  }

  const handleConfirmDelete = () => {
    if (confirmDialog.application) {
      onDelete(confirmDialog.application._id)
    }
    setConfirmDialog({ isOpen: false, application: null })
  }

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, application: null })
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const getIndustryName = (industryId: string) => {
    const industry = industries.find(i => i._id === industryId)
    return industry ? industry.name : 'Unknown Industry'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
          <p className="text-gray-600">Manage vacuum pump technology applications, reference to Industry</p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <EyeIcon className="h-5 w-5 mr-2" />
          Add Application
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
              placeholder="Search applications..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              View Mode
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'table' | 'cards')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cards">Cards</option>
              <option value="table">Table</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {sortedApplications.length} of {applications.length} applications
            </div>
          </div>
        </div>
      </div>

      {/* Applications Display */}
      {sortedApplications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <div className="text-gray-400 text-6xl mb-4">🔧</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-500">
            {applications.length === 0 
              ? "Get started by creating your first vacuum pump application."
              : "Try adjusting your filters or search terms."
            }
          </p>
          {applications.length === 0 && (
            <button
              onClick={onCreate}
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <EyeIcon className="h-5 w-5 mr-2" />
              Create First Application
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedApplications.map((application) => (
            <div
              key={application._id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{application.name}</h3>
                    {application.featured && (
                      <StarSolidIcon className="h-5 w-5 text-yellow-500" />
                    )}
                    {!application.isActive && (
                      <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${categoryColors[application.category as keyof typeof categoryColors]}`}>
                      {categoryLabels[application.category as keyof typeof categoryLabels]}
                    </span>
                    {application.displayOrder > 0 && (
                      <span className="text-xs text-gray-500">
                        Order: {application.displayOrder}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={() => onEdit(application)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit Application"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(application)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete Application"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {stripHtml(application.description).length > 120 
                  ? stripHtml(application.description).substring(0, 120) + '...' 
                  : stripHtml(application.description)
                }
              </p>

              {/* Technical Info */}
              {(application.vacuumRequirements?.pressureRange || application.vacuumRequirements?.flowRate) && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Technical Requirements:</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    {application.vacuumRequirements.pressureRange && (
                      <div>Pressure: {application.vacuumRequirements.pressureRange}</div>
                    )}
                    {application.vacuumRequirements.flowRate && (
                      <div>Flow Rate: {application.vacuumRequirements.flowRate}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommended Industries */}
              {application.recommendedIndustries && application.recommendedIndustries.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Recommended Industries:</h4>
                  <div className="flex flex-wrap gap-1">
                    {application.recommendedIndustries.slice(0, 3).map((industryId, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
                      >
                        {getIndustryName(typeof industryId === 'string' ? industryId : (industryId as any)._id)}
                      </span>
                    ))}
                    {application.recommendedIndustries.length > 3 && (
                      <span className="inline-flex px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-md">
                        +{application.recommendedIndustries.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Products */}
              {application.products && application.products.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Products:</h4>
                  <div className="flex flex-wrap gap-1">
                    {application.products.slice(0, 3).map((product, index) => (
                      product.url ? (
                        <a
                          key={index}
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                          title={`View ${product.name}`}
                        >
                          🔧 {product.name}
                        </a>
                      ) : (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
                          title={product.name}
                        >
                          🔧 {product.name}
                        </span>
                      )
                    ))}
                    {application.products.length > 3 && (
                      <span className="inline-flex px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-md">
                        +{application.products.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Projects */}
              {application.projects && application.projects.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Projects:</h4>
                  <div className="flex flex-wrap gap-1">
                    {application.projects.slice(0, 3).map((project, index) => (
                      project.url ? (
                        <a
                          key={index}
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex px-2 py-1 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                          title={`View ${project.name}`}
                        >
                          📁 {project.name}
                        </a>
                      ) : (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs bg-green-50 text-green-700 rounded-md"
                          title={project.name}
                        >
                          📁 {project.name}
                        </span>
                      )
                    ))}
                    {application.projects.length > 3 && (
                      <span className="inline-flex px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-md">
                        +{application.projects.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Images */}
              {application.images && application.images.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Images:</h4>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-md">
                      📷 {application.images.length} image{application.images.length !== 1 ? 's' : ''}
                    </span>
                    {application.images.some(img => img.isPrimary) && (
                      <span className="inline-flex px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded-md">
                        ⭐ Primary
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Download Documents */}
              {application.downloadDocuments && application.downloadDocuments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Resources:</h4>
                  <div className="flex flex-wrap gap-1">
                    {application.downloadDocuments.slice(0, 2).map((document, index) => (
                      <a 
                        key={index}
                        href={document.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                        title={document.description || document.title}
                      >
                        📄 {document.title.length > 15 ? document.title.substring(0, 15) + '...' : document.title}
                      </a>
                    ))}
                    {application.downloadDocuments.length > 2 && (
                      <span className="inline-flex px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-md">
                        +{application.downloadDocuments.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                <div>Created: {formatDate(application.createdAt)}</div>
                {application.stats?.viewCount !== undefined && (
                  <div>{application.stats.viewCount} views</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recommended Industries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products & Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedApplications.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">
                              {application.name}
                            </div>
                            {application.featured && (
                              <StarSolidIcon className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {stripHtml(application.description).length > 80 
                              ? stripHtml(application.description).substring(0, 80) + '...' 
                              : stripHtml(application.description)
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${categoryColors[application.category as keyof typeof categoryColors]}`}>
                        {categoryLabels[application.category as keyof typeof categoryLabels]}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {application.recommendedIndustries?.slice(0, 2).map(industryId => 
                          getIndustryName(typeof industryId === 'string' ? industryId : (industryId as any)._id)
                        ).join(', ')}
                        {application.recommendedIndustries && application.recommendedIndustries.length > 2 && (
                          <span className="text-gray-500"> +{application.recommendedIndustries.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {application.products?.slice(0, 2).map(product => product.name).join(', ')}
                        {application.products && application.products.length > 2 && (
                          <span className="text-gray-500"> +{application.products.length - 2} more</span>
                        )}
                        {application.projects && application.projects.length > 0 && (
                          <div className="text-xs text-gray-600 mt-1">
                            Projects: {application.projects.slice(0, 1).map(project => project.name).join(', ')}
                            {application.projects.length > 1 && (
                              <span> +{application.projects.length - 1} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(application)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(application)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Application"
        message={`Are you sure you want to delete "${confirmDialog.application?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger={true}
      />
    </div>
  )
} 