'use client'

import React, { useState, useEffect } from 'react'
import { IPumpType, IPumpTypeInput, ISubPumpType } from '@/models/PumpType'
import { generateSlug, validateImageUrl } from '@/lib/utils'
import MarkdownEditor, { MarkdownEditorPresets } from '@/components/MarkdownEditor'
import { ProductDescriptionDisplay } from '@/components/MarkdownDisplay'



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
    image: '',
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
        image: pumpType.image || '',
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
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
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

  const handleDescriptionChange = (value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      description: value || ''
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
      slug: '',
      image: '',
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
      subPumpTypes: prev.subPumpTypes?.map((subType, i) => {
        if (i === index) {
          const updatedSubType = { ...subType, [field]: value }
          
          // Auto-generate slug when name changes (like pump type behavior)
          if (field === 'name') {
            // Auto-generate slug when sub pump type name changes (only if creating new or slug is empty)
            const isNewSubPumpType = !pumpType || !(subType as ISubPumpType)._id
            const hasEmptySlug = !subType.slug
            if (isNewSubPumpType || hasEmptySlug) {
              updatedSubType.slug = generateSlug(value)
            }
          } else if (field === 'slug') {
            // Manual slug editing - apply generateSlug to ensure proper format
            updatedSubType.slug = generateSlug(value)
          }
          
          return updatedSubType
        }
        return subType
      }) || []
    }))
    
    // Clear errors when user starts typing
    if (field === 'name' && errors[`subPumpType_${index}_name`]) {
      setErrors(prev => ({
        ...prev,
        [`subPumpType_${index}_name`]: ''
      }))
    }
    if (field === 'slug' && errors[`subPumpType_${index}_slug`]) {
      setErrors(prev => ({
        ...prev,
        [`subPumpType_${index}_slug`]: ''
      }))
    }
    if (field === 'image' && errors[`subPumpType_${index}_image`]) {
      setErrors(prev => ({
        ...prev,
        [`subPumpType_${index}_image`]: ''
      }))
    }
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

    // Validate image field (optional)
    if (formData.image && formData.image.trim()) {
      const imageValidation = validateImageUrl(formData.image, { 
        context: 'Image', 
        allowEmpty: true 
      })
      if (!imageValidation.isValid) {
        newErrors.image = imageValidation.error || 'Invalid image format'
      }
    }

    // Validate sub pump types
    if (formData.subPumpTypes && formData.subPumpTypes.length > 0) {
      const subPumpTypeSlugs = new Set<string>()
      
      formData.subPumpTypes.forEach((subType, index) => {
        // Only validate if the sub pump type has a name (indicating it's being used)
        if (subType.name.trim()) {
          // Check if slug is provided
          if (!subType.slug.trim()) {
            newErrors[`subPumpType_${index}_slug`] = 'Sub pump type slug is required'
          } else if (!/^[a-z0-9-]+$/.test(subType.slug)) {
            newErrors[`subPumpType_${index}_slug`] = 'Sub pump type slug can only contain lowercase letters, numbers, and hyphens'
          } else if (subPumpTypeSlugs.has(subType.slug)) {
            newErrors[`subPumpType_${index}_slug`] = 'Sub pump type slug must be unique within this pump type'
          } else {
            subPumpTypeSlugs.add(subType.slug)
          }
          
          // Validate sub pump type image field (optional)
          if (subType.image && subType.image.trim()) {
            const imageValidation = validateImageUrl(subType.image, { 
              context: 'Sub pump type image', 
              allowEmpty: true 
            })
            if (!imageValidation.isValid) {
              newErrors[`subPumpType_${index}_image`] = imageValidation.error || 'Invalid sub pump type image format'
            }
          }
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Filter out empty sub pump types (must have both name and slug)
      const validSubPumpTypes = formData.subPumpTypes?.filter(subType => 
        subType.name.trim() !== '' && subType.slug.trim() !== ''
      ).map(subType => ({
        ...subType,
        image: subType.image?.trim() || undefined // Ensure empty images are undefined
      })) || []
      
      onSave({
        pumpType: formData.pumpType.trim(),
        slug: formData.slug.trim(),
        description: formData.description?.trim() || undefined,
        image: formData.image?.trim() || undefined,
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
            <MarkdownEditor
              value={formData.description || ''}
              onChange={handleDescriptionChange}
              {...MarkdownEditorPresets.technicalDocs}
              label="Description (Optional) - Markdown Editor"
              placeholder={`Describe this pump type, its applications, and characteristics...

## Overview
Brief description of the pump type and its primary function.

**Key Applications:**
- Application 1
- Application 2

## Technical Characteristics
- Operating pressure range: XX mbar
- Flow rate capacity: XX m³/h
- Power consumption: XX kW

## Typical Use Cases
Description of common applications and industries where this pump type is used.

**Advantages:**
- Advantage 1
- Advantage 2`}
            />
            
            {/* Live Preview Section */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live Preview:
              </label>
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50 min-h-[100px]">
                {formData.description ? (
                  <ProductDescriptionDisplay content={formData.description} />
                ) : (
                  <p className="text-gray-400 italic">Preview will appear here as you type...</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Image (Optional)
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.image ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. /images/pump-types/rotary-vane.jpg or https://example.com/image.jpg"
            />
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter a URL or relative path to an image file. Supported formats: jpg, jpeg, png, gif, webp, svg
            </p>
            
            {/* Image Preview */}
            {formData.image && formData.image.trim() && !errors.image && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Preview:
                </label>
                <div className="border border-gray-200 rounded-md p-2 bg-gray-50">
                  <img
                    src={formData.image}
                    alt="Pump type preview"
                    className="max-w-full h-auto max-h-48 rounded object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const errorDiv = target.nextElementSibling as HTMLElement
                      if (errorDiv) errorDiv.style.display = 'block'
                    }}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'block'
                      const errorDiv = target.nextElementSibling as HTMLElement
                      if (errorDiv) errorDiv.style.display = 'none'
                    }}
                  />
                  <div className="text-red-500 text-sm mt-2" style={{ display: 'none' }}>
                    ⚠️ Unable to load image. Please check the URL or path.
                  </div>
                </div>
              </div>
            )}
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
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`subPumpType_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          required
                        />
                        {errors[`subPumpType_${index}_name`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`subPumpType_${index}_name`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL Slug * <span className="text-xs text-gray-500">(Auto-generated from name)</span>
                        </label>
                        <input
                          type="text"
                          value={subType.slug}
                          onChange={(e) => updateSubPumpType(index, 'slug', e.target.value)}
                          placeholder="e.g. oil-sealed-rotary-vane, dry-scroll"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`subPumpType_${index}_slug`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          pattern="[a-z0-9-]+"
                          title="Only lowercase letters, numbers, and hyphens are allowed"
                          required
                        />
                        {errors[`subPumpType_${index}_slug`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`subPumpType_${index}_slug`]}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          URL-friendly identifier for this sub pump type.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image (Optional)
                      </label>
                      <input
                        type="text"
                        value={subType.image || ''}
                        onChange={(e) => updateSubPumpType(index, 'image', e.target.value)}
                        placeholder="e.g. /images/sub-pump-types/oil-sealed.jpg or https://example.com/image.jpg"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`subPumpType_${index}_image`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`subPumpType_${index}_image`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`subPumpType_${index}_image`]}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Enter a URL or relative path to an image file. Supported formats: jpg, jpeg, png, gif, webp, svg
                      </p>
                      
                      {/* Sub Pump Type Image Preview */}
                      {subType.image && subType.image.trim() && !errors[`subPumpType_${index}_image`] && (
                        <div className="mt-2">
                          <div className="border border-gray-200 rounded-md p-2 bg-white">
                            <img
                              src={subType.image}
                              alt={`${subType.name} preview`}
                              className="max-w-full h-auto max-h-32 rounded object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const errorDiv = target.nextElementSibling as HTMLElement
                                if (errorDiv) errorDiv.style.display = 'block'
                              }}
                              onLoad={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'block'
                                const errorDiv = target.nextElementSibling as HTMLElement
                                if (errorDiv) errorDiv.style.display = 'none'
                              }}
                            />
                            <div className="text-red-500 text-xs mt-1" style={{ display: 'none' }}>
                              ⚠️ Unable to load image. Please check the URL or path.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
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