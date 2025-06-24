'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { Product, ProductInput } from '@/models/Product'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface ProductFormProps {
  product?: Product | null
  onSave: (productData: ProductInput) => void
  onCancel: () => void
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    description: '',
    category: 'rotary-vane',
    specifications: {
      flowRate: '',
      vacuumLevel: '',
      power: '',
      inletSize: '',
      weight: '',
    },
    features: [''],
    applications: [''],
    image: 'https://trebles.co.uk/wp-content/uploads/2021/01/Industrial-Pumps.jpg',
    price: 0,
    inStock: true,
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        specifications: { ...product.specifications },
        features: [...product.features],
        applications: [...product.applications],
        image: product.image,
        price: product.price,
        inStock: product.inStock,
      })
    }
  }, [product])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (name.startsWith('spec_')) {
      const specField = name.replace('spec_', '')
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value,
        },
      }))
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }))
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleArrayChange = (arrayName: 'features' | 'applications', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item),
    }))
  }

  const addArrayItem = (arrayName: 'features' | 'applications') => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], ''],
    }))
  }

  const removeArrayItem = (arrayName: 'features' | 'applications', index: number) => {
    if (formData[arrayName].length > 1) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: prev[arrayName].filter((_, i) => i !== index),
      }))
    }
  }

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      description: value,
    }))
  }

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
      // toggle to add extra line breaks when pasting HTML:
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleanedData = {
      ...formData,
      features: formData.features.filter(feature => feature.trim() !== ''),
      applications: formData.applications.filter(app => app.trim() !== ''),
    }
    
    onSave(cleanedData)
  }

  const categories = [
    { value: 'rotary-vane', label: 'Rotary Vane Pumps' },
    { value: 'scroll', label: 'Scroll Pumps' },
    { value: 'diaphragm', label: 'Diaphragm Pumps' },
    { value: 'turbomolecular', label: 'Turbomolecular Pumps' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          
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
              form="product-form"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </div>

        <form id="product-form" onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description * (Rich Text Editor)
            </label>
            <div className="quill-editor-wrapper">
              <ReactQuill
                value={formData.description}
                onChange={handleDescriptionChange}
                modules={modules}
                formats={formats}
                theme="snow"
                placeholder="Enter product description with rich formatting..."
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
                         <style jsx global>{`
               .quill-editor-wrapper .ql-editor {
                 min-height: 250px;
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
               /* Color picker styles */
               .quill-editor-wrapper .ql-color-picker .ql-picker-options {
                 max-width: 200px;
                 width: 200px;
               }
               /* Image resize styles */
               .quill-editor-wrapper .ql-editor img {
                 max-width: 100%;
                 height: auto;
               }
               
               /* Preview section styles */
               .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
                 color: #1f2937;
                 margin-top: 1em;
                 margin-bottom: 0.5em;
                 font-weight: 600;
               }
               .prose h1 { font-size: 1.5rem; }
               .prose h2 { font-size: 1.3rem; }
               .prose h3 { font-size: 1.1rem; }
               .prose p {
                 margin-bottom: 1em;
                 line-height: 1.6;
                 color: #374151;
               }
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

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="spec_flowRate" className="block text-sm font-medium text-gray-700 mb-2">
                  Flow Rate
                </label>
                <input
                  type="text"
                  id="spec_flowRate"
                  name="spec_flowRate"
                  value={formData.specifications.flowRate}
                  onChange={handleInputChange}
                  placeholder="e.g., 2000 CFM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="spec_vacuumLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Vacuum Level
                </label>
                <input
                  type="text"
                  id="spec_vacuumLevel"
                  name="spec_vacuumLevel"
                  value={formData.specifications.vacuumLevel}
                  onChange={handleInputChange}
                  placeholder="e.g., 0.1 torr"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="spec_power" className="block text-sm font-medium text-gray-700 mb-2">
                  Power
                </label>
                <input
                  type="text"
                  id="spec_power"
                  name="spec_power"
                  value={formData.specifications.power}
                  onChange={handleInputChange}
                  placeholder="e.g., 15 HP"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="spec_inletSize" className="block text-sm font-medium text-gray-700 mb-2">
                  Inlet Size
                </label>
                <input
                  type="text"
                  id="spec_inletSize"
                  name="spec_inletSize"
                  value={formData.specifications.inletSize}
                  onChange={handleInputChange}
                  placeholder="e.g., 8 inches"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="spec_weight" className="block text-sm font-medium text-gray-700 mb-2">
                  Weight
                </label>
                <input
                  type="text"
                  id="spec_weight"
                  name="spec_weight"
                  value={formData.specifications.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 450 lbs"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Features</h4>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleArrayChange('features', index, e.target.value)}
                  placeholder="Enter a feature"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('features', index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                  disabled={formData.features.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('features')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add Feature
            </button>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Applications</h4>
            {formData.applications.map((application, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={application}
                  onChange={(e) => handleArrayChange('applications', index, e.target.value)}
                  placeholder="Enter an application"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('applications', index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                  disabled={formData.applications.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('applications')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add Application
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="inStock"
                name="inStock"
                checked={formData.inStock}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
                In Stock
              </label>
            </div>
          </div>


        </form>
      </div>
    </div>
  )
} 