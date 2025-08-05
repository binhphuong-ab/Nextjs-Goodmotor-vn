'use client'

import { useState, useEffect } from 'react'
import { ICustomer } from '@/models/Customer'
import { IIndustry } from '@/models/Industry'
import Notification from '@/components/Notification'
import ConfirmDialog from '@/components/ConfirmDialog'



interface CustomerListProps {
  customers: ICustomer[]
  onEdit: (customer: ICustomer) => void
  onDelete: (customerId: string) => void
  onCreate?: () => void
}

interface NotificationState {
  type: 'success' | 'error' | 'info'
  message: string
  visible: boolean
}





export default function CustomerList({ customers, onEdit, onDelete, onCreate }: CustomerListProps) {
  const [industries, setIndustries] = useState<IIndustry[]>([])

  const [notification, setNotification] = useState<NotificationState | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    customer: ICustomer | null
  }>({
    isOpen: false,
    customer: null
  })

  useEffect(() => {
    fetchIndustries()

  }, [])

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, visible: true })
  }

  const hideNotification = () => {
    setNotification(null)
  }

  const handleEdit = (customer: ICustomer) => {
    onEdit(customer)
    showNotification('info', `Editing customer: ${customer.name}`)
  }

  const handleDelete = (customer: ICustomer) => {
    setConfirmDialog({
      isOpen: true,
      customer
    })
  }

  const handleConfirmDelete = () => {
    if (confirmDialog.customer) {
      onDelete(confirmDialog.customer._id)
      setConfirmDialog({ isOpen: false, customer: null })
    }
  }

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, customer: null })
  }

  const fetchIndustries = async () => {
    try {
      const response = await fetch('/api/industries')
      if (response.ok) {
        const industriesData: IIndustry[] = await response.json()
        setIndustries(industriesData)
      } else {
        console.error('Failed to fetch industries')
        showNotification('error', 'Failed to load industries data')
      }
    } catch (error) {
      console.error('Error fetching industries:', error)
      showNotification('error', 'Error loading industries data')
    }
  }



  const getIndustryNames = (industryData: (string | IIndustry)[] | undefined): string[] => {
    if (!industryData || !Array.isArray(industryData)) return []
    
    return industryData
      .map(item => {
        // Handle populated Industry objects from MongoDB Atlas
        if (typeof item === 'object' && item !== null && 'name' in item) {
          return item.name
        }
        // Handle ObjectId strings (when not populated)
        if (typeof item === 'string') {
          const industry = industries.find(industry => industry._id === item)
          return industry ? industry.name : null
        }
        return null
      })
      .filter((name): name is string => name !== null)
  }

  const getBusinessTypeName = (businessType: ICustomer['businessType'] | undefined): string => {
    // BusinessType is now a simple string enum
    return businessType || 'Unknown'
  }

  if (customers.length === 0) {
    return (
      <>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">Add your first customer to get started</p>
        </div>

        {/* Auto-closing Notification */}
        {notification && notification.visible && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={hideNotification}
            autoClose={true}
            duration={3000}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Industries
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Projects & Models
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {customer.logo && (
                      <div className="flex-shrink-0 h-10 w-10 mr-3">
                        <img
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                          src={customer.logo}
                          alt={`${customer.name} logo`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.slug}
                      </div>
                      {customer.website && (
                        <a 
                          href={customer.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {customer.website}
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {getBusinessTypeName(customer.businessType)}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {customer.industry && customer.industry.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {getIndustryNames(customer.industry).slice(0, 2).map((industryName, index) => (
                        <span 
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"
                        >
                          {industryName}
                        </span>
                      ))}
                      {customer.industry.length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                          +{customer.industry.length - 2} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">-</div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {customer.country || 'Unknown'}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-600 space-y-1">
                    {customer.projects && customer.projects.length > 0 && (
                      <div>
                        <span className="font-medium text-blue-600">Projects:</span> {customer.projects.length}
                      </div>
                    )}
                    {customer.pumpModelsUsed && customer.pumpModelsUsed.length > 0 && (
                      <div>
                        <span className="font-medium text-green-600">Pumps:</span> {customer.pumpModelsUsed.length}
                      </div>
                    )}
                    {customer.applications && customer.applications.length > 0 && (
                      <div>
                        <span className="font-medium text-purple-600">Apps:</span> {customer.applications.length}
                      </div>
                    )}
                    {(!customer.projects?.length && !customer.pumpModelsUsed?.length && !customer.applications?.length) && (
                      <div className="text-gray-400">-</div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="bg-white px-4 py-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing {customers.length} customer{customers.length !== 1 ? 's' : ''}
            </div>
            

          </div>
        </div>
      </div>

      {/* Auto-closing Notification */}
      {notification && notification.visible && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
          autoClose={true}
          duration={3000}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Customer"
        message={`Are you sure you want to delete "${confirmDialog.customer?.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger={true}
      />
    </>
  )
} 