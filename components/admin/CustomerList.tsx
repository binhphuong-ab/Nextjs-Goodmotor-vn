'use client'

import { useState, useEffect } from 'react'
import { ICustomer } from '@/models/Customer'
import Notification from '@/components/Notification'
import ConfirmDialog from '@/components/ConfirmDialog'

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

interface CustomerListProps {
  customers: ICustomer[]
  onEdit: (customer: ICustomer) => void
  onDelete: (customerId: string) => void
}

interface NotificationState {
  type: 'success' | 'error' | 'info'
  message: string
  visible: boolean
}

const statusColors = {
  'prospect': 'bg-yellow-100 text-yellow-800',
  'active': 'bg-green-100 text-green-800',
  'inactive': 'bg-gray-100 text-gray-800',
  'partner': 'bg-blue-100 text-blue-800',
  'distributor': 'bg-purple-100 text-purple-800'
}

const tierColors = {
  'standard': 'bg-gray-100 text-gray-800',
  'preferred': 'bg-blue-100 text-blue-800',
  'premium': 'bg-purple-100 text-purple-800',
  'enterprise': 'bg-gold-100 text-gold-800'
}

export default function CustomerList({ customers, onEdit, onDelete }: CustomerListProps) {
  const [industries, setIndustries] = useState<Industry[]>([])
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
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
    fetchBusinessTypes()
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
      showNotification('success', `Customer "${confirmDialog.customer.name}" will be deleted`)
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
        const industriesData = await response.json()
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

  const fetchBusinessTypes = async () => {
    try {
      const response = await fetch('/api/admin/business-types')
      if (response.ok) {
        const businessTypesData = await response.json()
        setBusinessTypes(businessTypesData)
      } else {
        console.error('Failed to fetch business types')
        showNotification('error', 'Failed to load business types data')
      }
    } catch (error) {
      console.error('Error fetching business types:', error)
      showNotification('error', 'Error loading business types data')
    }
  }

  const getIndustryNames = (industryIds: string[]) => {
    return industryIds
      .map(id => industries.find(industry => industry._id === id)?.name)
      .filter(name => name) as string[]
  }

  const getBusinessTypeName = (businessTypeId: string) => {
    const businessType = businessTypes.find(bt => bt._id === businessTypeId)
    return businessType ? businessType.name : 'Unknown'
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
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier
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
                  <div className="text-sm text-gray-900">
                    {getBusinessTypeName(customer.businessType.toString())}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {customer.industry && customer.industry.length > 0 ? (
                    <div className="text-sm text-gray-500">
                      {getIndustryNames(customer.industry).slice(0, 2).join(', ')}
                      {customer.industry.length > 2 && ` +${customer.industry.length - 2} more`}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">-</div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[customer.customerStatus]}`}>
                    {customer.customerStatus.charAt(0).toUpperCase() + customer.customerStatus.slice(1)}
                  </span>
                  {!customer.isActive && (
                    <div className="text-xs text-red-600 mt-1 font-medium">Inactive</div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tierColors[customer.customerTier]}`}>
                    {customer.customerTier.charAt(0).toUpperCase() + customer.customerTier.slice(1)}
                  </span>
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
            
            <div className="flex space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                <span>{customers.filter(c => c.customerStatus === 'active').length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Prospects</span>
                <span>{customers.filter(c => c.customerStatus === 'prospect').length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Partners</span>
                <span>{customers.filter(c => c.customerStatus === 'partner').length}</span>
              </div>
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