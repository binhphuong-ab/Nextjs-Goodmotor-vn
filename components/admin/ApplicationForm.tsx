'use client'

import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { Eye, Edit, CheckCircle } from 'lucide-react'
import { generateSlug, validateUrl, validateImageUrl, getImageUrl } from '@/lib/utils'
import type { IApplication, IApplicationInput } from '@/models/Application'
import MarkdownEditor, { MarkdownEditorPresets } from '@/components/MarkdownEditor'
import { ProductDescriptionDisplay } from '@/components/MarkdownDisplay'



const CATEGORIES = [
  { value: 'freeze-drying', label: 'Freeze Drying' },
  { value: 'distillation', label: 'Distillation' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'degassing', label: 'Degassing' },
  { value: 'filtration', label: 'Filtration' },
  { value: 'drying', label: 'Drying' },
  { value: 'metallurgy', label: 'Metallurgy' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'medical', label: 'Medical' },
  { value: 'research', label: 'Research' },
  { value: 'other', label: 'Other' }
]



// Simple text editor using textarea with stable reference
const SimpleTextEditor = memo(({ value, onChange, placeholder, className = "" }: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}) => {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeRef.current(e.target.value)
  }, [])

  return (
    <textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full min-h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      rows={6}
    />
  )
})

SimpleTextEditor.displayName = 'SimpleTextEditor'

// Simple array input component
const SimpleArrayInput = ({ label, value, onChange, placeholder }: {
  label: string
  value: string[]
  onChange: (newArray: string[]) => void
  placeholder: string
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const newArray = [...value]
              newArray[index] = e.target.value
              onChange(newArray)
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
          />
          {value.length > 1 && (
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ''])}
        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
      >
        Add {label.slice(0, -1)}
      </button>
    </div>
  </div>
)

// Memoized text item component to prevent re-renders
const TextArrayItem = memo(({ 
  value, 
  index, 
  placeholder, 
  onItemChange, 
  onItemRemove, 
  canRemove 
}: {
  value: string
  index: number
  placeholder: string
  onItemChange: (index: number, content: string) => void
  onItemRemove: (index: number) => void
  canRemove: boolean
}) => {
  const onItemChangeRef = useRef(onItemChange)
  const onItemRemoveRef = useRef(onItemRemove)
  onItemChangeRef.current = onItemChange
  onItemRemoveRef.current = onItemRemove

  const handleChange = useCallback((content: string) => {
    onItemChangeRef.current(index, content)
  }, [index])

  const handleRemove = useCallback(() => {
    onItemRemoveRef.current(index)
  }, [index])

  return (
    <div className="border border-gray-300 rounded-md p-4">
      <div className="mb-3">
        <SimpleTextEditor
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
        />
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={handleRemove}
          className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 text-sm"
        >
          Remove
        </button>
      )}
    </div>
  )
})

TextArrayItem.displayName = 'TextArrayItem'

// Name and URL input component for Products and Projects
const NameUrlArrayInput = ({ label, value, onChange, placeholder, errors, onValidateUrl }: {
  label: string
  value: Array<{name: string, url?: string}>
  onChange: (newArray: Array<{name: string, url?: string}>) => void
  placeholder: string
  errors?: { [key: string]: string }
  onValidateUrl?: (type: string, index: number, url: string) => void
}) => {
  const handleItemChange = useCallback((index: number, field: 'name' | 'url', content: string) => {
    const newArray = [...value]
    newArray[index] = { ...newArray[index], [field]: content }
    onChange(newArray)
    
    // Validate URL when it changes
    if (field === 'url' && content.trim() && onValidateUrl) {
      onValidateUrl(label.toLowerCase(), index, content)
    }
  }, [value, onChange, label, onValidateUrl])

  const handleItemRemove = useCallback((index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }, [value, onChange])

  const handleAdd = useCallback(() => {
    onChange([...value, { name: '', url: '' }])
  }, [value, onChange])

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-4">
        {value.map((item, index) => (
          <div key={`${label}-${index}`} className="border border-gray-300 rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL (Optional)
                </label>
                <input
                  type="text"
                  value={item.url || ''}
                  onChange={(e) => handleItemChange(index, 'url', e.target.value)}
                  placeholder="/industries/industry-slug or https://example.com/page"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors?.[`${label.toLowerCase()}_${index}_url`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors?.[`${label.toLowerCase()}_${index}_url`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`${label.toLowerCase()}_${index}_url`]}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter a relative path (e.g., /products/pump-name) or full URL
                </p>
              </div>
            </div>
            {value.length > 1 && (
              <button
                type="button"
                onClick={() => handleItemRemove(index)}
                className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Add {label.slice(0, -1)}
        </button>
      </div>
    </div>
  )
}

// Simple text array input component
const SimpleTextArrayInput = ({ label, value, onChange, placeholder }: {
  label: string
  value: string[]
  onChange: (newArray: string[]) => void
  placeholder: string
}) => {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const handleItemChange = useCallback((index: number, content: string) => {
    const newArray = [...value]
    newArray[index] = content
    onChangeRef.current(newArray)
  }, [value])

  const handleItemRemove = useCallback((index: number) => {
    onChangeRef.current(value.filter((_, i) => i !== index))
  }, [value])

  const handleAdd = useCallback(() => {
    onChangeRef.current([...value, ''])
  }, [value])

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-4">
        {value.map((item, index) => (
          <TextArrayItem
            key={`${label}-${index}`}
            value={item}
            index={index}
            placeholder={placeholder}
            onItemChange={handleItemChange}
            onItemRemove={handleItemRemove}
            canRemove={value.length > 1}
          />
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Add {label.slice(0, -1)}
        </button>
      </div>
    </div>
  )
}

interface ApplicationFormProps {
  application?: IApplication | null
  onSave: (applicationData: IApplicationInput) => void
  onCancel: () => void
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void
}

export default function ApplicationForm({ application, onSave, onCancel, onShowNotification }: ApplicationFormProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [industries, setIndustries] = useState<Array<{ _id: string, name: string, slug: string }>>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  const [formData, setFormData] = useState<IApplicationInput>({
    name: '',
    slug: '',
    description: '',
    category: 'freeze-drying',
    vacuumRequirements: {
      pressureRange: '',
      flowRate: '',
      pumpingSpeed: '',
      ultimateVacuum: ''
    },
    processConditions: {
      temperature: '',
      duration: ''
    },
    recommendedIndustries: [],
    products: [{ name: '', url: '' }],
    projects: [{ name: '', url: '' }],
    authors: '',
    caseStudies: '',
    images: [],
    downloadDocuments: [],
    keywords: [''],
    isActive: true,
    featured: false,
    displayOrder: 0
  })

  // URL validation function
  const validateUrlLocal = (errorKey: string, url: string, context: string = 'URL'): void => {
    const result = validateUrl(url, { 
      context, 
      allowEmpty: true 
    })
    
    if (result.isValid) {
      // Clear error if valid
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    } else {
      // Set error if invalid
      setErrors(prev => ({
        ...prev,
        [errorKey]: result.error || `Invalid ${context.toLowerCase()}`
      }))
    }
  }

  // Image validation function
  const validateImageLocal = (errorKey: string, imageUrl: string, context: string = 'Image'): void => {
    const result = validateImageUrl(imageUrl, { 
      context, 
      allowEmpty: true 
    })
    
    if (result.isValid) {
      // Clear error if valid
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    } else {
      // Set error if invalid
      setErrors(prev => ({
        ...prev,
        [errorKey]: result.error || `Invalid ${context.toLowerCase()}`
      }))
    }
  }

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

  // Load existing application data
  useEffect(() => {
    if (application) {
      setFormData({
        name: application.name,
        slug: application.slug,
        description: application.description,
        category: application.category,
        vacuumRequirements: application.vacuumRequirements || {
          pressureRange: '',
          flowRate: '',
          pumpingSpeed: '',
          ultimateVacuum: ''
        },
        processConditions: application.processConditions || {
          temperature: '',
          duration: ''
        },
        recommendedIndustries: application.recommendedIndustries?.map(industry => 
          typeof industry === 'string' ? industry : (industry as any)._id
        ) || [],
        products: application.products || [{ name: '', url: '' }],
        projects: application.projects || [{ name: '', url: '' }],
        authors: application.authors || '',
        caseStudies: application.caseStudies || '',
        images: application.images || [],
        downloadDocuments: application.downloadDocuments || [],
        keywords: application.keywords || [''],
        isActive: application.isActive,
        featured: application.featured,
        displayOrder: application.displayOrder
      })
    }
  }, [application])



  // Simple handlers without complex dependencies
  const updateField = (field: string, value: any) => {
    if (field === 'name') {
      const newSlug = generateSlug(value)
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: prev.slug === '' || prev.slug === generateSlug(prev.name) ? newSlug : prev.slug,
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const updateNestedField = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any || {}),
        [field]: value
      }
    }))
  }

  const updateArrayField = (field: string, newArray: any[]) => {
    setFormData(prev => ({ ...prev, [field]: newArray }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleanedData = {
      ...formData,
      authors: formData.authors?.trim() || '',
      caseStudies: formData.caseStudies?.trim() || '',
      keywords: formData.keywords?.filter(item => item.trim() !== '') || [],
      products: formData.products?.filter(item => item.name.trim() !== '') || [],
      projects: formData.projects?.filter(item => item.name.trim() !== '') || []
    }
    
    onSave(cleanedData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {application ? 'Edit Application' : 'Add New Application'}
          </h3>
          
          <div className="flex items-center space-x-4">
            {/* Tab Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                {application ? 'Update Application' : 'Add Application'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          {activeTab === 'edit' ? (
            /* Single Page Form */
            <div className="h-full overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                
                {/* Basic Information Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    📝 Basic Information
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Application Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Application Slug *
                        </label>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => updateField('slug', e.target.value)}
                          required
                          pattern="^[a-z0-9-]+$"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => updateField('slug', generateSlug(formData.name))}
                          className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          Auto-generate from name
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <div className="space-y-2">
                        <div className="relative">
                          <select
                            value={formData.category}
                            onChange={(e) => updateField('category', e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                            size={5}
                          >
                            {CATEGORIES.map(category => (
                              <option 
                                key={category.value} 
                                value={category.value}
                                className="py-2 px-2 hover:bg-blue-50 cursor-pointer"
                              >
                                {category.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-start space-x-2 text-xs text-gray-500">
                          <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <div>Select the application category</div>
                            {formData.category && (
                              <div className="mt-1 text-blue-600 font-medium">
                                {CATEGORIES.find(cat => cat.value === formData.category)?.label} selected
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <MarkdownEditor
                        value={formData.description}
                        onChange={(value) => updateField('description', value || '')}
                        {...MarkdownEditorPresets.technicalDocs}
                        label="Application Description *"
                        placeholder={`Enter detailed application description...

## Overview
Brief description of the application and its purpose.

**Key Features:**
- Feature 1
- Feature 2

## Process Requirements
Specific requirements for vacuum conditions and processing.

**Technical Specifications:**
- Pressure: $P = 10^{-3}$ mbar
- Temperature: $T = -80°C$ to $150°C$

## Benefits
- Improved product quality
- Reduced processing time
- Energy efficiency`}
                        required={true}
                      />
                    </div>

                    <div>
                      <MarkdownEditor
                        value={formData.authors}
                        onChange={(value) => updateField('authors', value || '')}
                        {...MarkdownEditorPresets.technicalDocs}
                        label="Authors"
                        placeholder={`Enter information about the authors...

## Author Information
List the main contributors and authors for this application.

**Authors:**
- **Dr. John Smith** - Lead Researcher, XYZ University
  - PhD in Vacuum Technology
  - 15+ years experience in industrial applications
- **Jane Doe, P.E.** - Senior Engineer, ABC Corp
  - Professional Engineer specialization in vacuum systems
  - Project lead for multiple successful implementations

## Contributions
Briefly describe their key contributions or roles in the application development.`}
                        required={false}
                      />
                    </div>

                    <div>
                      <MarkdownEditor
                        value={formData.caseStudies || ''}
                        onChange={(value) => updateField('caseStudies', value || '')}
                        {...MarkdownEditorPresets.technicalDocs}
                        label="Case Studies"
                        placeholder={`Enter detailed case studies and applications...

## Case Study 1: Industrial Freeze Drying Application

### Background
Brief overview of the application and client requirements.

### Challenge
- Problem statement
- Technical requirements
- Constraints faced

### Solution
- Vacuum pump configuration used
- Technical specifications
- Implementation approach

### Results
- Performance metrics achieved
- **Pressure Range:** 10^-3 to 10^-6 mbar
- **Efficiency:** 99.5% uptime
- Client satisfaction and feedback

---

## Case Study 2: Research Laboratory Application

### Background
Description of the research application and objectives.

### Implementation Details
- System configuration
- Technical challenges overcome
- Timeline and phases

### Outcomes
- Research results enabled
- Performance data
- Future applications`}
                        required={false}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={formData.displayOrder}
                          onChange={(e) => updateField('displayOrder', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => updateField('isActive', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Active</span>
                        </label>
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => updateField('featured', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Featured</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    🖼️ Images
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Images
                      </label>
                      <div className="space-y-4">
                        {formData.images?.map((image, index) => (
                          <div key={index} className="border border-gray-300 rounded-md p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Image URL *
                                </label>
                                <input
                                  type="text"
                                  value={image.url}
                                  onChange={(e) => {
                                    const newImages = [...(formData.images || [])]
                                    newImages[index] = { ...image, url: e.target.value }
                                    updateArrayField('images', newImages)
                                    
                                    // Validate image URL
                                    if (e.target.value.trim()) {
                                      validateImageLocal(`image_${index}_url`, e.target.value, 'Application Image')
                                    } else {
                                      // Clear error when field is empty
                                      setErrors(prev => {
                                        const newErrors = { ...prev }
                                        delete newErrors[`image_${index}_url`]
                                        return newErrors
                                      })
                                    }
                                  }}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors[`image_${index}_url`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  placeholder="/images/application.jpg or https://example.com/image.jpg"
                                />
                                {errors[`image_${index}_url`] && (
                                  <p className="mt-1 text-sm text-red-600">{errors[`image_${index}_url`]}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                  Enter a relative path (e.g., /images/application.jpg) or full URL
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Alt Text
                                </label>
                                <input
                                  type="text"
                                  value={image.alt || ''}
                                  onChange={(e) => {
                                    const newImages = [...(formData.images || [])]
                                    newImages[index] = { ...image, alt: e.target.value }
                                    updateArrayField('images', newImages)
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Image description for accessibility"
                                />
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Caption
                              </label>
                              <input
                                type="text"
                                value={image.caption || ''}
                                onChange={(e) => {
                                  const newImages = [...(formData.images || [])]
                                  newImages[index] = { ...image, caption: e.target.value }
                                  updateArrayField('images', newImages)
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Optional caption text"
                              />
                            </div>

                            {/* Enhanced Image Preview */}
                            {image.url && image.url.trim() && !errors[`image_${index}_url`] && (
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Image Preview:
                                </label>
                                <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                                  <div className="relative w-32 h-32 mx-auto border border-gray-300 rounded-lg overflow-hidden bg-white">
                                    <img
                                      src={getImageUrl(image.url)}
                                      alt={image.alt || 'Application image preview'}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = 'none'
                                        const errorDiv = target.nextElementSibling as HTMLElement
                                        if (errorDiv) errorDiv.style.display = 'flex'
                                      }}
                                      onLoad={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = 'block'
                                        const errorDiv = target.nextElementSibling as HTMLElement
                                        if (errorDiv) errorDiv.style.display = 'none'
                                      }}
                                    />
                                    <div 
                                      className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500 text-sm text-center p-2" 
                                      style={{ display: 'none' }}
                                    >
                                      <div>
                                        <svg className="w-8 h-8 mx-auto mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        ⚠️ Unable to load image. Please check the URL or path.
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-center">
                                    <p className="text-xs text-gray-600 truncate" title={getImageUrl(image.url)}>
                                      {getImageUrl(image.url)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={image.isPrimary || false}
                                  onChange={(e) => {
                                    const newImages = [...(formData.images || [])]
                                    if (e.target.checked) {
                                      newImages.forEach((img, i) => {
                                        img.isPrimary = i === index
                                      })
                                    } else {
                                      newImages[index] = { ...image, isPrimary: false }
                                    }
                                    updateArrayField('images', newImages)
                                  }}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-700">Primary Image</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = formData.images?.filter((_, i) => i !== index) || []
                                  updateArrayField('images', newImages)
                                }}
                                className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 text-sm"
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = [...(formData.images || []), { url: '', alt: '', caption: '', isPrimary: false }]
                            updateArrayField('images', newImages)
                          }}
                          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          Add Image
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    ⚙️ Technical Specifications
                  </h3>
                  
                  <div className="space-y-6">
                    <h4 className="text-md font-medium text-gray-900">Vacuum Requirements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pressure Range
                        </label>
                        <input
                          type="text"
                          value={formData.vacuumRequirements?.pressureRange || ''}
                          onChange={(e) => updateNestedField('vacuumRequirements', 'pressureRange', e.target.value)}
                          placeholder="e.g., 10^-3 to 10^-6 mbar"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Flow Rate
                        </label>
                        <input
                          type="text"
                          value={formData.vacuumRequirements?.flowRate || ''}
                          onChange={(e) => updateNestedField('vacuumRequirements', 'flowRate', e.target.value)}
                          placeholder="e.g., 500-2000 CFM"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pumping Speed
                        </label>
                        <input
                          type="text"
                          value={formData.vacuumRequirements?.pumpingSpeed || ''}
                          onChange={(e) => updateNestedField('vacuumRequirements', 'pumpingSpeed', e.target.value)}
                          placeholder="e.g., 100 m³/h"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ultimate Vacuum
                        </label>
                        <input
                          type="text"
                          value={formData.vacuumRequirements?.ultimateVacuum || ''}
                          onChange={(e) => updateNestedField('vacuumRequirements', 'ultimateVacuum', e.target.value)}
                          placeholder="e.g., 10^-6 mbar"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <h4 className="text-md font-medium text-gray-900 mt-8">Process Conditions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Temperature Range
                        </label>
                        <input
                          type="text"
                          value={formData.processConditions?.temperature || ''}
                          onChange={(e) => updateNestedField('processConditions', 'temperature', e.target.value)}
                          placeholder="e.g., -80°C to +150°C"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Process Duration
                        </label>
                        <input
                          type="text"
                          value={formData.processConditions?.duration || ''}
                          onChange={(e) => updateNestedField('processConditions', 'duration', e.target.value)}
                          placeholder="e.g., 2-24 hours"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment & Industries Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    🔧 Equipment & Industries
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Recommended Industries */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recommended Industries *
                      </label>
                      <div className="space-y-2">
                        <div className="relative">
                          <select
                            multiple
                            value={formData.recommendedIndustries}
                            onChange={(e) => {
                              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
                              updateArrayField('recommendedIndustries', selectedOptions)
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                            size={5}
                          >
                            {industries.map(industry => (
                              <option 
                                key={industry._id} 
                                value={industry._id}
                                className="py-2 px-2 hover:bg-blue-50 cursor-pointer"
                              >
                                {industry.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-start space-x-2 text-xs text-gray-500">
                          <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <div>Hold Ctrl (Cmd on Mac) to select multiple industries</div>
                            {formData.recommendedIndustries && formData.recommendedIndustries.length > 0 && (
                              <div className="mt-1 text-blue-600 font-medium">
                                {formData.recommendedIndustries.length} industry{formData.recommendedIndustries.length > 1 ? 'ies' : 'y'} selected:
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {formData.recommendedIndustries.map(industryId => {
                                    const industry = industries.find(i => i._id === industryId)
                                    return industry ? (
                                      <span key={industryId} className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                        {industry.name}
                                      </span>
                                    ) : null
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <NameUrlArrayInput
                      label="Products"
                      value={formData.products || []}
                      onChange={(newArray) => updateArrayField('products', newArray)}
                      placeholder="e.g., Vacuum Pump Model XYZ"
                      errors={errors}
                      onValidateUrl={(type, index, url) => {
                        validateUrlLocal(`${type}_${index}_url`, url, 'URL')
                      }}
                    />

                    <NameUrlArrayInput
                      label="Projects"
                      value={formData.projects || []}
                      onChange={(newArray) => updateArrayField('projects', newArray)}
                      placeholder="e.g., Industrial Freeze Drying System"
                      errors={errors}
                      onValidateUrl={(type, index, url) => {
                        validateUrlLocal(`${type}_${index}_url`, url, 'URL')
                      }}
                    />

                  </div>
                </div>

                {/* Download Documents Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    📄 Download Documents
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Downloadable Resources
                      </label>
                      <div className="space-y-4">
                        {formData.downloadDocuments?.map((document, index) => (
                          <div key={index} className="border border-gray-300 rounded-md p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Document Title *
                                </label>
                                <input
                                  type="text"
                                  value={document.title}
                                  onChange={(e) => {
                                    const newDocuments = [...(formData.downloadDocuments || [])]
                                    newDocuments[index] = { ...document, title: e.target.value }
                                    updateArrayField('downloadDocuments', newDocuments)
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="e.g., Technical Specification Sheet"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Document URL *
                                </label>
                                <input
                                  type="text"
                                  value={document.url}
                                  onChange={(e) => {
                                    const newDocuments = [...(formData.downloadDocuments || [])]
                                    newDocuments[index] = { ...document, url: e.target.value }
                                    updateArrayField('downloadDocuments', newDocuments)
                                    
                                    // Validate URL
                                    if (e.target.value.trim()) {
                                      validateUrlLocal(`download_${index}_url`, e.target.value, 'Document URL')
                                    } else {
                                      // Clear error when field is empty
                                      setErrors(prev => {
                                        const newErrors = { ...prev }
                                        delete newErrors[`download_${index}_url`]
                                        return newErrors
                                      })
                                    }
                                  }}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors[`download_${index}_url`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  placeholder="/documents/manual.pdf or https://docs.google.com/document/d/..."
                                />
                                {errors[`download_${index}_url`] && (
                                  <p className="mt-1 text-sm text-red-600">{errors[`download_${index}_url`]}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                  Enter a relative path (e.g., /documents/manual.pdf) or full URL
                                </p>
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thumbnail/Cover Image URL
                              </label>
                              <input
                                type="text"
                                value={document.imageUrl || ''}
                                onChange={(e) => {
                                  const newDocuments = [...(formData.downloadDocuments || [])]
                                  newDocuments[index] = { ...document, imageUrl: e.target.value }
                                  updateArrayField('downloadDocuments', newDocuments)
                                  
                                  // Validate image URL
                                  if (e.target.value.trim()) {
                                    validateImageLocal(`download_${index}_image`, e.target.value, 'Thumbnail Image')
                                  } else {
                                    // Clear error when field is empty
                                    setErrors(prev => {
                                      const newErrors = { ...prev }
                                      delete newErrors[`download_${index}_image`]
                                      return newErrors
                                    })
                                  }
                                }}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors[`download_${index}_image`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="/images/thumbnail.jpg or https://example.com/thumbnail.jpg"
                              />
                              {errors[`download_${index}_image`] && (
                                <p className="mt-1 text-sm text-red-600">{errors[`download_${index}_image`]}</p>
                              )}
                              <p className="mt-1 text-xs text-gray-500">
                                Enter a relative path (e.g., /images/thumbnail.jpg) or full URL
                              </p>
                            </div>

                            {/* Enhanced Thumbnail Preview */}
                            {document.imageUrl && document.imageUrl.trim() && !errors[`download_${index}_image`] && (
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Thumbnail Preview:
                                </label>
                                <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                                  <div className="relative w-32 h-32 mx-auto border border-gray-300 rounded-lg overflow-hidden bg-white">
                                    <img
                                      src={getImageUrl(document.imageUrl)}
                                      alt={document.title || 'Document thumbnail preview'}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = 'none'
                                        const errorDiv = target.nextElementSibling as HTMLElement
                                        if (errorDiv) errorDiv.style.display = 'flex'
                                      }}
                                      onLoad={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = 'block'
                                        const errorDiv = target.nextElementSibling as HTMLElement
                                        if (errorDiv) errorDiv.style.display = 'none'
                                      }}
                                    />
                                    <div 
                                      className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500 text-sm text-center p-2" 
                                      style={{ display: 'none' }}
                                    >
                                      <div>
                                        <svg className="w-8 h-8 mx-auto mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        ⚠️ Unable to load image. Please check the URL or path.
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-center">
                                    <p className="text-xs text-gray-600 truncate" title={getImageUrl(document.imageUrl)}>
                                      {getImageUrl(document.imageUrl)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <SimpleTextEditor
                                value={document.description || ''}
                                onChange={(content: string) => {
                                  const newDocuments = [...(formData.downloadDocuments || [])]
                                  newDocuments[index] = { ...document, description: content }
                                  updateArrayField('downloadDocuments', newDocuments)
                                }}
                                placeholder="Brief description of the document..."
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newDocuments = formData.downloadDocuments?.filter((_, i) => i !== index) || []
                                updateArrayField('downloadDocuments', newDocuments)
                              }}
                              className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 text-sm"
                            >
                              Remove Document
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newDocuments = [...(formData.downloadDocuments || []), { title: '', url: '', imageUrl: '', description: '' }]
                            updateArrayField('downloadDocuments', newDocuments)
                          }}
                          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          Add Document
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO & Settings Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    🔍 SEO & Settings
                  </h3>
                  
                  <div className="space-y-6">
                    <SimpleArrayInput
                      label="SEO Keywords"
                      value={formData.keywords || ['']}
                      onChange={(newArray) => updateArrayField('keywords', newArray)}
                      placeholder="e.g., vacuum pump, freeze drying, lyophilization"
                    />
                  </div>
                </div>

              </form>
            </div>
          ) : (
            /* Preview Mode */
            <div className="h-full overflow-y-auto bg-gray-50 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {formData.name || 'Application Name'}
                      </h1>
                      {formData.featured && (
                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Featured</span>
                        </div>
                      )}
                    </div>
                    
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {CATEGORIES.find(cat => cat.value === formData.category)?.label || 'Category'}
                    </span>
                  </div>

                  <div className="text-gray-600 mb-6">
                    {formData.description ? (
                      <ProductDescriptionDisplay content={formData.description} />
                    ) : (
                      <p className="text-gray-400 italic">Application description will appear here...</p>
                    )}
                  </div>

                  {/* Authors */}
                  {formData.authors?.trim() && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Authors</h3>
                      <div className="text-gray-600">
                        <ProductDescriptionDisplay content={formData.authors} />
                      </div>
                    </div>
                  )}

                  {/* Recommended Industries */}
                  {formData.recommendedIndustries && formData.recommendedIndustries.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommended Industries</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.recommendedIndustries.map((industryId, index) => {
                          const industry = industries.find(i => i._id === industryId)
                          return industry ? (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                              {industry.name}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  {formData.products && formData.products.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Products</h3>
                      <div className="space-y-2">
                        {formData.products.map((product, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                              {product.name}
                            </span>
                            {product.url && (
                              <a 
                                href={product.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View Product →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {formData.projects && formData.projects.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Projects</h3>
                      <div className="space-y-2">
                        {formData.projects.map((project, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                              {project.name}
                            </span>
                            {project.url && (
                              <a 
                                href={project.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                View Project →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  )
} 