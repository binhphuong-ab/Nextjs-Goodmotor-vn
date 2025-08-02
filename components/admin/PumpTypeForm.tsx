'use client'

import React, { useState, useEffect } from 'react'
import { IPumpType, IPumpTypeInput } from '@/models/PumpType'

interface PumpTypeFormProps {
  pumpType?: IPumpType | null
  onSave: (data: IPumpTypeInput) => void
  onCancel: () => void
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void
}

export default function PumpTypeForm({ pumpType, onSave, onCancel, onShowNotification }: PumpTypeFormProps) {
  const [formData, setFormData] = useState<IPumpTypeInput>({
    pumpType: ''
  })
  
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (pumpType) {
      setFormData({
        pumpType: pumpType.pumpType
      })
    }
  }, [pumpType])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData({
      pumpType: value
    })
    
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const validateForm = (): boolean => {
    if (!formData.pumpType.trim()) {
      setError('Pump type is required')
      return false
    }

    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave({
        pumpType: formData.pumpType.trim()
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {pumpType ? 'Edit Pump Type' : 'Add New Pump Type'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pumpType" className="block text-sm font-medium text-gray-700 mb-1">
              Pump Type *
            </label>
            <input
              type="text"
              id="pumpType"
              name="pumpType"
              value={formData.pumpType}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. Rotary Vane, Screw, Liquid Ring, Diaphragm"
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pumpType ? 'Update' : 'Create'} Pump Type
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 