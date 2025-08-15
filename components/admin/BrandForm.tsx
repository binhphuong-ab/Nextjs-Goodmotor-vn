'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { IBrand, IBrandInput, IProductLine, IProductLineDocument } from '@/models/Brand'
import { generateSlug } from '@/lib/utils'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

// Quill editor configuration with comprehensive features
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['code-block'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  }
}

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'color', 'background',
  'script',
  'list', 'bullet', 'indent',
  'direction', 'align',
  'link', 'image', 'video',
  'code-block'
]

interface BrandFormProps {
  brand?: IBrand | null
  onSave: (data: IBrandInput) => void
  onCancel: () => void
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void
}

export default function BrandForm({ brand, onSave, onCancel, onShowNotification }: BrandFormProps) {
  const [formData, setFormData] = useState<IBrandInput>({
    name: '',
    slug: '',
    country: '',
    yearEstablished: undefined,
    revenue: '',
    description: '',
    productLines: []
  })
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Helper function to check if a product line is in use
  const isProductLineInUse = (index: number): { inUse: boolean; products: string[] } => {
    let productLineId: string
    if (brand && brand.productLines && brand.productLines[index]) {
      productLineId = brand.productLines[index]._id || brand.productLines[index].name
    } else {
      const productLine = formData.productLines?.[index]
      productLineId = productLine?.name || ''
    }
    
    const products = brand?.productLineUsage?.[productLineId] || []
    return {
      inUse: products.length > 0,
      products
    }
  }

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        slug: brand.slug,
        country: brand.country || '',
        yearEstablished: brand.yearEstablished || undefined,
        revenue: brand.revenue || '',
        description: brand.description || '',
        productLines: brand.productLines || []
      })
    }
  }, [brand])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const updatedData: Partial<IBrandInput> = {
      [name]: name === 'yearEstablished' ? (value ? parseInt(value) : undefined) : value
    }
    
    // Auto-generate slug when name changes (only for new brands)
    if (name === 'name' && !brand) {
      updatedData.slug = generateSlug(value)
    }
    
    setFormData(prev => ({
      ...prev,
      ...updatedData
    }))
    
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

  // Product Line management functions
  const addProductLine = () => {
    const newProductLine: Omit<IProductLine, '_id'> = {
      name: '',
      description: '',
      isActive: true,
      displayOrder: formData.productLines?.length || 0,
      documents: []
    }
    setFormData(prev => ({
      ...prev,
      productLines: [...(prev.productLines || []), newProductLine]
    }))
  }

  const updateProductLine = (index: number, field: keyof IProductLine, value: any) => {
    setFormData(prev => ({
      ...prev,
      productLines: prev.productLines?.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      ) || []
    }))
  }

  const removeProductLine = (index: number) => {
    const productLine = formData.productLines?.[index]
    if (!productLine) return
    
    // Check if this product line is being used by products
    const usage = isProductLineInUse(index)
    
    if (usage.inUse) {
      const message = `Cannot remove "${productLine.name}" because it's being used by ${usage.products.length} product(s): ${usage.products.join(', ')}`
      onShowNotification?.('error', message)
      return
    }
    
    setFormData(prev => ({
      ...prev,
      productLines: prev.productLines?.filter((_, i) => i !== index) || []
    }))
  }

  // Document management functions for product lines
  const addDocument = (productLineIndex: number) => {
    const newDocument: IProductLineDocument = {
      name: '',
      url: ''
    }
    
    console.log('Adding document to product line', productLineIndex, ':', newDocument)
    
    setFormData(prev => ({
      ...prev,
      productLines: prev.productLines?.map((line, i) => 
        i === productLineIndex 
          ? { ...line, documents: [...(line.documents || []), newDocument] }
          : line
      ) || []
    }))
  }

  const updateDocument = (productLineIndex: number, documentIndex: number, field: keyof IProductLineDocument, value: string) => {
    console.log('Updating document:', { productLineIndex, documentIndex, field, value })
    
    setFormData(prev => ({
      ...prev,
      productLines: prev.productLines?.map((line, i) => 
        i === productLineIndex 
          ? {
              ...line,
              documents: line.documents?.map((doc, j) => 
                j === documentIndex ? { ...doc, [field]: value } : doc
              ) || []
            }
          : line
      ) || []
    }))
  }

  const removeDocument = (productLineIndex: number, documentIndex: number) => {
    setFormData(prev => ({
      ...prev,
      productLines: prev.productLines?.map((line, i) => 
        i === productLineIndex 
          ? {
              ...line,
              documents: line.documents?.filter((_, j) => j !== documentIndex) || []
            }
          : line
      ) || []
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Brand slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    // Optional validations - only validate if provided
    if (formData.yearEstablished && (formData.yearEstablished < 1800 || formData.yearEstablished > new Date().getFullYear())) {
      newErrors.yearEstablished = `Year established must be between 1800 and ${new Date().getFullYear()}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Debug: Log original form data
      console.log('Original formData.productLines:', formData.productLines)
      
      // Filter out empty product lines and clean up documents
      const validProductLines = formData.productLines?.filter(line => line.name.trim() !== '').map(line => {
        // Debug: Log each product line before and after document filtering
        console.log('Product line before filtering:', line.name, 'documents:', line.documents)
        
        const filteredDocuments = line.documents?.filter(doc => {
          const hasName = doc.name.trim() !== ''
          const hasUrl = doc.url.trim() !== ''
          console.log('Document filter check:', { name: doc.name, url: doc.url, hasName, hasUrl, willKeep: hasName && hasUrl })
          return hasName && hasUrl
        }) || []
        
        console.log('Product line after filtering:', line.name, 'documents:', filteredDocuments)
        
        return {
          ...line,
          documents: filteredDocuments
        }
      }) || []
      
      const dataToSave = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        country: formData.country?.trim() || undefined,
        yearEstablished: formData.yearEstablished || undefined,
        revenue: formData.revenue?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        productLines: validProductLines
      }
      
      // Debug: Log final data being sent
      console.log('Final data being sent to API:', dataToSave)
      console.log('Final productLines with documents:', JSON.stringify(validProductLines, null, 2))
      
      onSave(dataToSave)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-medium text-gray-900">
            {brand ? 'Edit Brand' : 'Add New Brand'}
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
              form="brand-form"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {brand ? 'Update' : 'Create'} Brand
            </button>
          </div>
        </div>
        
        <form id="brand-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Brand Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. Busch, Orion, Edwards"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug * {!brand && <span className="text-xs text-gray-500">(Auto-generated from name)</span>}
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
              placeholder="e.g. busch-vacuum, edwards-pumps"
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens are allowed"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              URL-friendly identifier for this brand. Used in web addresses.
            </p>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country (Optional)
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.country ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. Germany, United States, Japan"
            />
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
          </div>

          <div>
            <label htmlFor="yearEstablished" className="block text-sm font-medium text-gray-700 mb-1">
              Year Established (Optional)
            </label>
            <input
              type="number"
              id="yearEstablished"
              name="yearEstablished"
              value={formData.yearEstablished || ''}
              onChange={handleChange}
              min="1800"
              max={new Date().getFullYear()}
              placeholder="e.g., 1963"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.yearEstablished ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.yearEstablished && (
              <p className="mt-1 text-sm text-red-600">{errors.yearEstablished}</p>
            )}
          </div>

          <div>
            <label htmlFor="revenue" className="block text-sm font-medium text-gray-700 mb-1">
              Revenue (Optional)
            </label>
            <input
              type="text"
              id="revenue"
              name="revenue"
              value={formData.revenue}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. $1.2 billion annually, €500 million"
            />
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
                placeholder="Describe the brand, its specialties, history, and key products..."
              />
            </div>
            
            {/* Live Preview Section */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live Preview:
              </label>
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50 min-h-[120px]">
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

          {/* Product Lines Section */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Product Lines</h3>
              <button
                type="button"
                onClick={addProductLine}
                className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                + Add Product Line
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Define product lines/groups for this brand. Users will be able to select these when creating products. You can also attach relevant documents (catalogs, manuals, etc.) to each product line.
            </p>

            {formData.productLines && formData.productLines.length > 0 ? (
              <div className="space-y-4">
                {formData.productLines.map((line, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Line Name *
                        </label>
                        <input
                          type="text"
                          value={line.name}
                          onChange={(e) => updateProductLine(index, 'name', e.target.value)}
                          placeholder="e.g. Rotary Vane Pumps, Screw Pumps"
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
                          value={line.description || ''}
                          onChange={(e) => updateProductLine(index, 'description', e.target.value)}
                          placeholder="Brief description of this product line"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    {/* Documents Section */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Documents (Optional)
                        </label>
                        <button
                          type="button"
                          onClick={() => addDocument(index)}
                          className="text-sm bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 transition-colors"
                        >
                          + Add Document
                        </button>
                      </div>
                      
                      {line.documents && line.documents.length > 0 ? (
                        <div className="space-y-2">
                          {line.documents.map((doc, docIndex) => (
                            <div key={docIndex} className="flex gap-2 items-center bg-white p-2 rounded border">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={doc.name}
                                  onChange={(e) => updateDocument(index, docIndex, 'name', e.target.value)}
                                  placeholder="Document name (e.g. Product Catalog, User Manual)"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={doc.url}
                                  onChange={(e) => updateDocument(index, docIndex, 'url', e.target.value)}
                                  placeholder="Document URL or path (e.g. /images/catalog.pdf, https://...)"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDocument(index, docIndex)}
                                className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                                title="Remove document"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No documents added</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Display Order
                          </label>
                          <input
                            type="number"
                            value={line.displayOrder}
                            onChange={(e) => updateProductLine(index, 'displayOrder', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={line.isActive}
                            onChange={(e) => updateProductLine(index, 'isActive', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Active
                          </label>
                        </div>
                      </div>
                      
                      {(() => {
                        const usage = isProductLineInUse(index)
                        const isDisabled = usage.inUse
                        const tooltipText = isDisabled 
                          ? `Cannot remove: Used by ${usage.products.length} product(s) - ${usage.products.join(', ')}`
                          : 'Remove this product line'
                        
                        return (
                          <button
                            type="button"
                            onClick={() => removeProductLine(index)}
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
                <p className="text-gray-500 mb-3">No product lines defined yet</p>
                <button
                  type="button"
                  onClick={addProductLine}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Add your first product line
                </button>
              </div>
            )}
          </div>

        </form>
        
        <style jsx global>{`
          .quill-editor-wrapper .ql-editor {
            min-height: 150px;
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
          .prose img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 1em 0;
          }
        `}</style>
      </div>
    </div>
  )
} 