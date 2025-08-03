'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { generateSlug } from '@/lib/utils'
import 'react-quill/dist/quill.snow.css'
import { Product, ProductInput } from '@/models/Product'
import { IBrand } from '@/models/Brand'
import { IPumpType } from '@/models/PumpType'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface ProductFormProps {
  product?: Product | null
  onSave: (productData: ProductInput) => void
  onCancel: () => void
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void
}

export default function ProductForm({ product, onSave, onCancel, onShowNotification }: ProductFormProps) {
  const [brands, setBrands] = useState<IBrand[]>([])
  const [pumpTypes, setPumpTypes] = useState<IPumpType[]>([])
  const [selectedBrand, setSelectedBrand] = useState<IBrand | null>(null)
  const [availableProductLines, setAvailableProductLines] = useState<any[]>([])
  const isInitializedRef = useRef(false)
  

  
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    slug: '',
    description: '',
    brand: '',
    productLineId: '',
    pumpType: '',
    specifications: {
      flowRate: '',
      vacuumLevel: '',
      power: '',
      inletSize: '',
      weight: '',
      country: '',
      equipment: '',
    },
    features: [''],
    applications: [{ name: '', url: '' }],
    images: [{
      url: 'https://trebles.co.uk/wp-content/uploads/2021/01/Industrial-Pumps.jpg',
      alt: '',
      caption: '',
      isPrimary: true
    }],
    price: undefined,
  })

  useEffect(() => {
    // Fetch brands and pump types on component mount
    fetchBrands()
    fetchPumpTypes()
  }, []) // Only run once on mount

  // Separate useEffect to handle product data after brands are loaded
  useEffect(() => {
    // Only process product data if brands are loaded (or if there's no product)
    if (!product || brands.length === 0) {
      if (!product) {
        // Reset form for new product
        setFormData({
          name: '',
          slug: '',
          description: '',
          brand: '',
          productLineId: '',
          pumpType: '',
          specifications: {
            flowRate: '',
            vacuumLevel: '',
            power: '',
            inletSize: '',
            weight: '',
            country: '',
            equipment: '',
          },
          features: [''],
          applications: [{ name: '', url: '' }],
          images: [{
            url: 'https://trebles.co.uk/wp-content/uploads/2021/01/Industrial-Pumps.jpg',
            alt: '',
            caption: '',
            isPrimary: true
          }],
          price: undefined,
        })
      }
      return
    }

    // Reset initialization flag when product changes
    isInitializedRef.current = false
    
    // Handle brand - it might be populated object or just ID string
    const brandId = typeof product.brand === 'object' && product.brand !== null 
      ? (product.brand as any)._id 
      : product.brand ? String(product.brand) : ''
    
    // Handle pumpType - it might be populated object or just ID string  
    const pumpTypeId = typeof product.pumpType === 'object' && product.pumpType !== null
      ? (product.pumpType as any)._id
      : product.pumpType ? String(product.pumpType) : ''
    
    // Product data processing
    
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      brand: brandId,
      productLineId: product.productLineId || '',
      pumpType: pumpTypeId,
      specifications: { ...product.specifications },
      features: [...product.features],
      applications: [...product.applications],
      images: [...product.images],
      price: product.price || undefined,
    })
  }, [product, brands.length])

  // Handle brand selection and populate product lines
  useEffect(() => {
    if (formData.brand && brands.length > 0) {
      const brand = brands.find(b => b._id === formData.brand)
      if (brand) {
        setSelectedBrand(brand)
        const activeProductLines = brand.productLines?.filter(line => line.isActive) || []
        const sortedLines = activeProductLines.sort((a, b) => a.displayOrder - b.displayOrder)
        setAvailableProductLines(sortedLines)
        
        // Check if this is the initial load when brands data becomes available
        // Use product.productLineId directly to avoid React state update race condition
        const isInitialBrandLoad = !isInitializedRef.current && product && product.productLineId
        
        if (isInitialBrandLoad) {
          // Set productLineId from product data on initial load (fixes React state race condition)
          setFormData(prev => ({ ...prev, productLineId: product.productLineId || '' }))
        } else if (isInitializedRef.current && product) {
          // This is a user-initiated change - check if brand actually changed
          const originalBrandId = product.brand 
            ? (typeof product.brand === 'object' && product.brand !== null 
               ? (product.brand as any)._id 
               : String(product.brand))
            : null
          
          if (formData.brand !== originalBrandId) {
            setFormData(prev => ({ ...prev, productLineId: '' }))
          }
        }
        
        // Mark as initialized after first successful load
        if (!isInitializedRef.current) {
          isInitializedRef.current = true
        }
      }
          } else {
        setSelectedBrand(null)
        setAvailableProductLines([])
        // Only reset productLineId if brands are loaded and no brand is selected, or if this is a user change
        if ((brands.length > 0 && !formData.brand) || isInitializedRef.current) {
          setFormData(prev => ({ ...prev, productLineId: '' }))
        }
      }
  }, [formData.brand, brands, product])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/admin/brands')
      if (response.ok) {
        const brandsData = await response.json()
        setBrands(brandsData)
      } else {
        console.error('Failed to fetch brands')
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const fetchPumpTypes = async () => {
    try {
      const response = await fetch('/api/admin/pump-types')
      if (response.ok) {
        const pumpTypesData = await response.json()
        setPumpTypes(pumpTypesData)
      } else {
        console.error('Failed to fetch pump types')
      }
    } catch (error) {
      console.error('Error fetching pump types:', error)
    }
  }

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
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value),
      }))
    } else if (name === 'name') {
      // Auto-generate slug when name changes (only if slug is empty or was auto-generated)
      const newSlug = generateSlug(value)
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: prev.slug === '' || prev.slug === generateSlug(prev.name) ? newSlug : prev.slug,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleArrayChange = (arrayName: 'features', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item),
    }))
  }

  const addArrayItem = (arrayName: 'features') => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], ''],
    }))
  }

  const removeArrayItem = (arrayName: 'features', index: number) => {
    if (formData[arrayName].length > 1) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: prev[arrayName].filter((_, i) => i !== index),
      }))
    }
  }

  // Application-specific functions
  const addApplication = () => {
    setFormData(prev => ({
      ...prev,
      applications: [...prev.applications, { name: '', url: '' }]
    }))
  }

  const removeApplication = (index: number) => {
    if (formData.applications.length > 1) {
      setFormData(prev => ({
        ...prev,
        applications: prev.applications.filter((_, i) => i !== index)
      }))
    }
  }

  const updateApplication = (index: number, field: 'name' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      applications: prev.applications.map((app, i) => 
        i === index ? { ...app, [field]: value } : app
      )
    }))
  }

  // Image array management functions
  const handleImageChange = (index: number, field: 'url' | 'alt' | 'caption' | 'isPrimary', value: string | boolean) => {
    setFormData(prev => {
      const newImages = [...prev.images]
      
      if (field === 'isPrimary' && value === true) {
        // If setting this as primary, unset all others
        newImages.forEach((img, i) => {
          img.isPrimary = i === index
        })
      } else {
        newImages[index] = { ...newImages[index], [field]: value }
      }
      
      return {
        ...prev,
        images: newImages
      }
    })
  }

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', alt: '', caption: '', isPrimary: false }]
    }))
  }

  const removeImage = (index: number) => {
    if (formData.images.length > 1) {
      setFormData(prev => {
        const newImages = prev.images.filter((_, i) => i !== index)
        
        // If we removed the primary image, make the first one primary
        if (prev.images[index].isPrimary && newImages.length > 0) {
          newImages[0].isPrimary = true
        }
        
        return {
          ...prev,
          images: newImages
        }
      })
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
      brand: formData.brand && formData.brand.trim() !== '' ? formData.brand : undefined,
      productLineId: formData.productLineId && formData.productLineId.trim() !== '' ? formData.productLineId : undefined,
      pumpType: formData.pumpType && formData.pumpType.trim() !== '' ? formData.pumpType : undefined,
      features: formData.features.filter(feature => feature.trim() !== ''),
      applications: formData.applications.filter(app => app.name.trim() !== ''),
      images: formData.images.filter(img => img.url.trim() !== '').map((img, index) => ({
        ...img,
        isPrimary: index === 0 || img.isPrimary // Ensure at least the first image is primary
      }))
    }
    
    // Ensure at least one image has isPrimary set
    if (cleanedData.images.length > 0 && !cleanedData.images.some(img => img.isPrimary)) {
      cleanedData.images[0].isPrimary = true
    }
    
    onSave(cleanedData)
  }



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
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Product Slug *
                <span className="text-xs text-gray-500 ml-2">(URL-friendly identifier)</span>
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                pattern="^[a-z0-9-]+$"
                placeholder="auto-generated-from-name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used in the URL: /products/{formData.slug}
              </p>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }))}
                className="mt-1 text-xs text-blue-600 hover:text-blue-800"
              >
                Auto-generate from title
              </button>
            </div>

            <div>
              <label htmlFor="pumpType" className="block text-sm font-medium text-gray-700 mb-2">
                Pump Type (Optional)
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <select
                    id="pumpType"
                    name="pumpType"
                    value={formData.pumpType || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                    size={5}
                  >
                    <option value="">Select a pump type (optional)</option>
                    {pumpTypes.map(pumpType => (
                      <option 
                        key={pumpType._id} 
                        value={pumpType._id}
                        className="py-2 px-2 hover:bg-blue-50 cursor-pointer"
                      >
                        {pumpType.pumpType}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-start space-x-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div>Choose the type of pump for this product</div>
                    {formData.pumpType && (
                      <div className="mt-1 text-blue-600 font-medium">
                        {pumpTypes.find(type => type._id === formData.pumpType)?.pumpType} selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                Brand (Optional)
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                    size={5}
                  >
                    <option value="">Select a brand (optional)</option>
                    {brands.map(brand => (
                      <option 
                        key={brand._id} 
                        value={brand._id}
                        className="py-2 px-2 hover:bg-blue-50 cursor-pointer"
                      >
                        {brand.name}{brand.country ? ` (${brand.country})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-start space-x-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div>Choose the manufacturer/brand of this product</div>
                    {formData.brand && (
                      <div className="mt-1 text-blue-600 font-medium">
                        {brands.find(brand => brand._id === formData.brand)?.name} selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Line Selection */}
            {selectedBrand && (
              <div>
                <label htmlFor="productLineId" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Line (Optional)
                </label>
                {availableProductLines.length > 0 ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        id="productLineId"
                        name="productLineId"
                        value={formData.productLineId || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                        size={5}
                      >
                        <option value="">Select product line (optional)</option>
                        {availableProductLines.map(line => (
                          <option 
                            key={line._id} 
                            value={line._id}
                            className="py-2 px-2 hover:bg-blue-50 cursor-pointer"
                          >
                            {line.name}
                            {line.description && ` - ${line.description}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-gray-500">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div>Choose a specific product line within {selectedBrand.name}</div>
                        {formData.productLineId && (
                          <div className="mt-1 text-blue-600 font-medium">
                            {availableProductLines.find(line => line._id === formData.productLineId)?.name} selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                      No product lines defined for this brand
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This brand has no active product lines. You can add them in Brand management.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Rich Text Editor)
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
            <h4 className="text-md font-medium text-gray-900 mb-4">Specifications (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Equipment Type - Scrollable Selection */}
              <div>
                <label htmlFor="spec_equipment" className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Type
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <select
                      id="spec_equipment"
                      name="spec_equipment"
                      value={formData.specifications.equipment || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                      size={5}
                    >
                      <option value="">Select Equipment Type</option>
                      <option value="Bơm chân không" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Bơm chân không</option>
                      <option value="Phụ tùng bơm" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Phụ tùng bơm</option>
                      <option value="Thiết bị chân không" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Thiết bị chân không</option>
                    </select>
                  </div>
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div>Choose the equipment type</div>
                      {formData.specifications.equipment && (
                        <div className="mt-1 text-blue-600 font-medium">
                          {formData.specifications.equipment} selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Country of Origin - Scrollable Selection */}
              <div>
                <label htmlFor="spec_country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country of Origin
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <select
                      id="spec_country"
                      name="spec_country"
                      value={formData.specifications.country || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                      size={5}
                    >
                      <option value="">Select Country</option>
                      <option value="Germany" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Germany</option>
                      <option value="Japan" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Japan</option>
                      <option value="Korea" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Korea</option>
                      <option value="United States" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">United States</option>
                      <option value="UK" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">UK</option>
                      <option value="France" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">France</option>
                      <option value="China" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">China</option>
                      <option value="Vietnam" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Vietnam</option>
                      <option value="Other" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">Other</option>
                    </select>
                  </div>
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div>Choose the country of origin</div>
                      {formData.specifications.country && (
                        <div className="mt-1 text-blue-600 font-medium">
                          {formData.specifications.country} selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Power Rating - Scrollable Selection */}
              <div>
                <label htmlFor="spec_power" className="block text-sm font-medium text-gray-700 mb-2">
                  Power
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <select
                      id="spec_power"
                      name="spec_power"
                      value={formData.specifications.power || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                      size={5}
                    >
                      <option value="">Select Power</option>
                      <option value="<400W" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">&lt;400W</option>
                      <option value="400W" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">400W</option>
                      <option value="550W" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">550W</option>
                      <option value="0.75Kw" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">0.75Kw</option>
                      <option value="1.1Kw" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">1.1Kw</option>
                      <option value="1.5kw" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">1.5kw</option>
                      <option value="2.2Kw" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">2.2Kw</option>
                      <option value="3Kw" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">3Kw</option>
                      <option value="3.7Kw" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">3.7Kw</option>
                      <option value="5.5Kw" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">5.5Kw</option>
                      <option value="7.5Kw" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">7.5Kw</option>
                      <option value="9Kw" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">9Kw</option>
                      <option value="11Kw" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">11Kw</option>
                      <option value="15Kw" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">15Kw</option>
                      <option value="22Kw" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">22Kw</option>
                      <option value=">22Kw" className="py-2 px-2 hover:bg-blue-50 cursor-pointer">&gt;22Kw</option>
                    </select>
                  </div>
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div>Choose the power rating</div>
                      {formData.specifications.power && (
                        <div className="mt-1 text-blue-600 font-medium">
                          {formData.specifications.power} selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Specifications */}
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

              {/* Vacuum Level Specification */}
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

              {/* Physical Dimensions */}
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

              {/* Weight Specification */}
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

          {/* Applications */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-900">Applications</h4>
              <button
                type="button"
                onClick={addApplication}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Application
              </button>
            </div>
            {formData.applications.map((application, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Application {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeApplication(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    disabled={formData.applications.length === 1}
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application Name *
                    </label>
                    <input
                      type="text"
                      value={application.name}
                      onChange={(e) => updateApplication(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter application name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application URL
                    </label>
                    <input
                      type="url"
                      value={application.url || ''}
                      onChange={(e) => updateApplication(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/application"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (VNĐ) (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  placeholder="e.g., 360000 (leave empty for contact pricing)"
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 text-sm">VNĐ</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter price in VNĐ (Vietnamese Dong). Leave empty to show "Contact for pricing"
              </p>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-md font-medium text-gray-900 mb-4">Product Images *</h4>
              <div className="space-y-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Image URL *
                        </label>
                        <input
                          type="url"
                          value={image.url}
                          onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                          required
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={image.alt || ''}
                          onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                          placeholder="Descriptive text for accessibility"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Caption (Optional)
                      </label>
                      <input
                        type="text"
                        value={image.caption || ''}
                        onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                        placeholder="Image caption or description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={image.isPrimary || false}
                          onChange={(e) => handleImageChange(index, 'isPrimary', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Primary Image {image.isPrimary && <span className="text-blue-600 font-medium">(Default)</span>}
                        </span>
                      </label>
                      
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="px-3 py-1 text-red-600 border border-red-300 rounded-md hover:bg-red-50 text-sm"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>

                    {/* Image Preview */}
                    {image.url && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preview:
                        </label>
                        <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={image.url}
                            alt={image.alt || 'Product image'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addImage}
                  className="w-full py-3 px-4 border border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  + Add Another Image
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Add multiple product images. The primary image will be used as the main display image.
              </p>
            </div>


          </div>


        </form>
      </div>
    </div>
  )
} 