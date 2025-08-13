'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { IPumpType, IPumpTypeInput, ISubPumpType } from '@/models/PumpType'
import { generateSlug } from '@/lib/utils'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

// Quill editor configuration
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ]
}

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'align', 'link'
]

interface PumpTypeFormProps {
  pumpType?: IPumpType | null
  onSave: (data: IPumpTypeInput) => void
  onCancel: () => void
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void
}

export default function PumpTypeForm({ pumpType, onSave, onCancel, onShowNotification }: PumpTypeFormProps) {
  const [formData, setFormData] = useState<IPumpTypeInput>({
    pumpType: '',
    slug: '',
    description: '',
    subPumpTypes: [],
    subPumpTypeUsage: {},
    productUsage: []
  })
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Helper function to check if a sub pump type is in use
  const isSubPumpTypeInUse = (index: number): { inUse: boolean; products: string[] } => {
    let subPumpTypeId: string
    
    // Get the _id of the sub pump type
    const currentSubPumpType = formData.subPumpTypes?.[index]
    if (!currentSubPumpType) {
      return { inUse: false, products: [] }
    }
    
    // For existing sub pump types, use their _id from the original pump type data
    if (pumpType && pumpType.subPumpTypes && pumpType.subPumpTypes[index] && pumpType.subPumpTypes[index]._id) {
      subPumpTypeId = pumpType.subPumpTypes[index]._id!
    } else {
      // For new sub pump types (no _id yet), they can't be in use
      return { inUse: false, products: [] }
    }
    
    // Check usage from the original pump type data (from server)
    const products = pumpType?.subPumpTypeUsage?.[subPumpTypeId] || []
    return {
      inUse: products.length > 0,
      products
    }
  }

  useEffect(() => {
    if (pumpType) {
      setFormData({
        pumpType: pumpType.pumpType,
        slug: pumpType.slug,
        description: pumpType.description || '',
        subPumpTypes: pumpType.subPumpTypes || [],
        subPumpTypeUsage: pumpType.subPumpTypeUsage || {},
        productUsage: pumpType.productUsage || []
      })
    }
  }, [pumpType])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'pumpType') {
      setFormData(prev => ({
        ...prev,
        pumpType: value,
        // Auto-generate slug when pump type changes (only if creating new or slug is empty)
        slug: (!pumpType || !prev.slug) ? generateSlug(value) : prev.slug
      }))
    } else if (name === 'slug') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      description: value
    }))
    
    // Clear error when user starts typing
    if (errors.description) {
      setErrors(prev => ({
        ...prev,
        description: ''
      }))
    }
  }

  // Sub Pump Type management functions
  const addSubPumpType = () => {
    const newSubPumpType: Omit<ISubPumpType, '_id'> = {
      name: '',
      description: '',
      isActive: true,
      displayOrder: formData.subPumpTypes?.length || 0
    }
    setFormData(prev => ({
      ...prev,
      subPumpTypes: [...(prev.subPumpTypes || []), newSubPumpType]
    }))
  }

  const updateSubPumpType = (index: number, field: keyof ISubPumpType, value: any) => {
    setFormData(prev => ({
      ...prev,
      subPumpTypes: prev.subPumpTypes?.map((subType, i) => 
        i === index ? { ...subType, [field]: value } : subType
      ) || []
    }))
  }

  const removeSubPumpType = (index: number) => {
    const subPumpType = formData.subPumpTypes?.[index]
    if (!subPumpType) return
    
    // Check if this sub pump type is being used by products
    const usage = isSubPumpTypeInUse(index)
    
    if (usage.inUse) {
      const message = `Cannot remove "${subPumpType.name}" because it's being used by ${usage.products.length} product(s): ${usage.products.join(', ')}`
      onShowNotification?.('error', message)
      return
    }
    
    setFormData(prev => ({
      ...prev,
      subPumpTypes: prev.subPumpTypes?.filter((_, i) => i !== index) || []
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.pumpType.trim()) {
      newErrors.pumpType = 'Pump type is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Filter out empty sub pump types
      const validSubPumpTypes = formData.subPumpTypes?.filter(subType => subType.name.trim() !== '') || []
      
      onSave({
        pumpType: formData.pumpType.trim(),
        slug: formData.slug.trim(),
        description: formData.description?.trim() || undefined,
        subPumpTypes: validSubPumpTypes,
        subPumpTypeUsage: formData.subPumpTypeUsage || {},
        productUsage: formData.productUsage || []
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-medium text-gray-900">
            {pumpType ? 'Edit Pump Type' : 'Add New Pump Type'}
          </h2>
          
          {/* Action Buttons in Header */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="pump-type-form"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pumpType ? 'Update' : 'Create'} Pump Type
            </button>
          </div>
        </div>
        
        <form id="pump-type-form" onSubmit={handleSubmit} className="p-6 space-y-4">
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
                errors.pumpType ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. Rotary Vane, Screw, Liquid Ring, Diaphragm"
            />
            {errors.pumpType && (
              <p className="mt-1 text-sm text-red-600">{errors.pumpType}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug * {!pumpType && <span className="text-xs text-gray-500">(Auto-generated from pump type)</span>}
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. rotary-vane, screw, liquid-ring, diaphragm"
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens are allowed"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              URL-friendly identifier for this pump type. Used in web addresses.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional) - Rich Text Editor
            </label>
            <div className="quill-editor-wrapper">
              <ReactQuill
                value={formData.description || ''}
                onChange={handleDescriptionChange}
                modules={modules}
                formats={formats}
                theme="snow"
                placeholder="Describe this pump type, its applications, and characteristics..."
              />
            </div>
            
            {/* Live Preview Section */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live Preview:
              </label>
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50 min-h-[100px]">
                {formData.description ? (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.description }}
                  />
                ) : (
                  <p className="text-gray-400 italic">Preview will appear here as you type...</p>
                )}
              </div>
            </div>
          </div>

          {/* Sub Pump Types Section */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Sub Pump Types</h3>
              <button
                type="button"
                onClick={addSubPumpType}
                className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                + Add Sub Pump Type
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Define subcategories for this pump type. For example, "Vacuum Pumps" could have sub types like "Rotary Vane", "Scroll", "Diaphragm".
            </p>

            {formData.subPumpTypes && formData.subPumpTypes.length > 0 ? (
              <div className="space-y-4">
                {formData.subPumpTypes.map((subType, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sub Pump Type Name *
                        </label>
                        <input
                          type="text"
                          value={subType.name}
                          onChange={(e) => updateSubPumpType(index, 'name', e.target.value)}
                          placeholder="e.g. Oil-Sealed Rotary Vane, Dry Scroll"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={subType.description || ''}
                          onChange={(e) => updateSubPumpType(index, 'description', e.target.value)}
                          placeholder="Brief description of this sub pump type"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Display Order
                          </label>
                          <input
                            type="number"
                            value={subType.displayOrder}
                            onChange={(e) => updateSubPumpType(index, 'displayOrder', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={subType.isActive}
                            onChange={(e) => updateSubPumpType(index, 'isActive', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Active
                          </label>
                        </div>
                      </div>
                      
                      {(() => {
                        const usage = isSubPumpTypeInUse(index)
                        const isDisabled = usage.inUse
                        const tooltipText = isDisabled 
                          ? `Cannot remove: Used by ${usage.products.length} product(s) - ${usage.products.join(', ')}`
                          : 'Remove this sub pump type'
                        
                        return (
                          <button
                            type="button"
                            onClick={() => removeSubPumpType(index)}
                            disabled={isDisabled}
                            title={tooltipText}
                            className={`text-sm font-medium px-3 py-1 rounded border transition-colors ${
                              isDisabled
                                ? 'text-gray-400 border-gray-300 bg-gray-100 cursor-not-allowed'
                                : 'text-red-600 hover:text-red-800 border-red-300 hover:bg-red-50'
                            }`}
                          >
                            Remove
                            {usage.inUse && (
                              <span className="ml-1 text-xs">({usage.products.length})</span>
                            )}
                          </button>
                        )
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-3">No sub pump types defined yet</p>
                <button
                  type="button"
                  onClick={addSubPumpType}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Add your first sub pump type
                </button>
              </div>
            )}
          </div>

        </form>
        
        <style jsx global>{`
          .quill-editor-wrapper .ql-editor {
            min-height: 120px;
            font-size: 14px;
            line-height: 1.6;
          }
          .quill-editor-wrapper .ql-toolbar {
            border-top: 1px solid #d1d5db;
            border-left: 1px solid #d1d5db;
            border-right: 1px solid #d1d5db;
            border-bottom: none;
            background-color: #f9fafb;
          }
          .quill-editor-wrapper .ql-container {
            border-bottom: 1px solid #d1d5db;
            border-left: 1px solid #d1d5db;
            border-right: 1px solid #d1d5db;
            border-top: none;
            background-color: white;
          }
          .quill-editor-wrapper .ql-toolbar.ql-snow {
            border-radius: 6px 6px 0 0;
          }
          .quill-editor-wrapper .ql-container.ql-snow {
            border-radius: 0 0 6px 6px;
          }
          .quill-editor-wrapper .ql-editor.ql-blank::before {
            font-style: italic;
            color: #9ca3af;
          }
          
          /* Preview prose styling */
          .prose p {
            margin-bottom: 1em;
            line-height: 1.6;
            color: #374151;
          }
          .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
            color: #1f2937;
            margin-top: 1em;
            margin-bottom: 0.5em;
            font-weight: 600;
          }
          .prose h1 { font-size: 1.5rem; }
          .prose h2 { font-size: 1.3rem; }
          .prose h3 { font-size: 1.1rem; }
          .prose ul, .prose ol {
            margin-bottom: 1em;
            padding-left: 1.5em;
          }
          .prose li {
            margin-bottom: 0.25em;
            color: #374151;
          }
          .prose strong {
            font-weight: 600;
            color: #111827;
          }
          .prose a {
            color: #2563eb;
            text-decoration: underline;
          }
          .prose a:hover {
            color: #1d4ed8;
          }
          .prose blockquote {
            border-left: 4px solid #d1d5db;
            padding-left: 1em;
            margin: 1em 0;
            font-style: italic;
            color: #6b7280;
          }
          .prose code {
            background-color: #f3f4f6;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-size: 0.9em;
          }
        `}</style>
      </div>
    </div>
  )
} 