'use client'

import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { Eye, Edit, CheckCircle } from 'lucide-react'
import type { IApplication, IApplicationInput } from '@/models/Application'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="w-full min-h-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 animate-pulse"></div>
})

// Import ReactQuill styles
import 'react-quill/dist/quill.snow.css'

// ReactQuill configuration for main description only
const QUILL_MODULES = {
  toolbar: [
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    [{ 'direction': 'rtl' }],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  },
  history: {
    delay: 1000,
    maxStack: 50,
    userOnly: true
  }
}

const QUILL_FORMATS = [
  'font', 'size',
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'align',
  'list', 'bullet', 'indent',
  'blockquote', 'code-block',
  'link', 'image', 'video',
  'direction'
]

const CATEGORIES = [
  { value: 'freeze-drying', label: 'Freeze Drying' },
  { value: 'distillation', label: 'Distillation' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'coating', label: 'Coating' },
  { value: 'degassing', label: 'Degassing' },
  { value: 'filtration', label: 'Filtration' },
  { value: 'drying', label: 'Drying' },
  { value: 'metallurgy', label: 'Metallurgy' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'medical', label: 'Medical' },
  { value: 'research', label: 'Research' },
  { value: 'other', label: 'Other' }
]

// Rich text editor component - only for main description
const RichTextEditor = ({ value, onChange, placeholder, className = "" }: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}) => (
  <div className={`quill-wrapper ${className}`}>
    <ReactQuill
      theme="snow"
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      modules={QUILL_MODULES}
      formats={QUILL_FORMATS}
      style={{ backgroundColor: 'white' }}
    />
  </div>
)

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
const NameUrlArrayInput = ({ label, value, onChange, placeholder }: {
  label: string
  value: Array<{name: string, url?: string}>
  onChange: (newArray: Array<{name: string, url?: string}>) => void
  placeholder: string
}) => {
  const handleItemChange = useCallback((index: number, field: 'name' | 'url', content: string) => {
    const newArray = [...value]
    newArray[index] = { ...newArray[index], [field]: content }
    onChange(newArray)
  }, [value, onChange])

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
                  type="url"
                  value={item.url || ''}
                  onChange={(e) => handleItemChange(index, 'url', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
}

export default function ApplicationForm({ application, onSave, onCancel }: ApplicationFormProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [industries, setIndustries] = useState<Array<{ _id: string, name: string, slug: string }>>([])
  
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
    benefits: [''],
    challenges: [''],
    images: [],
    downloadDocuments: [],
    keywords: [''],
    isActive: true,
    featured: false,
    displayOrder: 0
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
        benefits: application.benefits.length > 0 ? application.benefits : [''],
        challenges: application.challenges || [''],
        images: application.images || [],
        downloadDocuments: application.downloadDocuments || [],
        keywords: application.keywords || [''],
        isActive: application.isActive,
        featured: application.featured,
        displayOrder: application.displayOrder
      })
    }
  }, [application])

  // Simple utility functions
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

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
      benefits: formData.benefits.filter(item => item.trim() !== ''),
      challenges: formData.challenges?.filter(item => item.trim() !== '') || [],
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
                      <select
                        value={formData.category}
                        onChange={(e) => updateField('category', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {CATEGORIES.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Description *
                      </label>
                      <RichTextEditor
                        value={formData.description}
                        onChange={(value) => updateField('description', value)}
                        placeholder="Enter detailed application description..."
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
                        {formData.recommendedIndustries.map((industryId, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <select
                              value={industryId}
                              onChange={(e) => {
                                const newArray = [...formData.recommendedIndustries]
                                newArray[index] = e.target.value
                                updateArrayField('recommendedIndustries', newArray)
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select industry</option>
                              {industries.map(industry => (
                                <option key={industry._id} value={industry._id}>
                                  {industry.name}
                                </option>
                              ))}
                            </select>
                            {formData.recommendedIndustries.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newArray = formData.recommendedIndustries.filter((_, i) => i !== index)
                                  updateArrayField('recommendedIndustries', newArray)
                                }}
                                className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newArray = [...formData.recommendedIndustries, '']
                            updateArrayField('recommendedIndustries', newArray)
                          }}
                          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          Add Industry
                        </button>
                      </div>
                    </div>
                    
                    <NameUrlArrayInput
                      label="Products"
                      value={formData.products || []}
                      onChange={(newArray) => updateArrayField('products', newArray)}
                      placeholder="e.g., Vacuum Pump Model XYZ"
                    />

                    <NameUrlArrayInput
                      label="Projects"
                      value={formData.projects || []}
                      onChange={(newArray) => updateArrayField('projects', newArray)}
                      placeholder="e.g., Industrial Freeze Drying System"
                    />

                    <SimpleTextArrayInput
                      label="Benefits"
                      value={formData.benefits}
                      onChange={(newArray: string[]) => updateArrayField('benefits', newArray)}
                      placeholder="e.g., improved product quality, reduced contamination..."
                    />

                    <SimpleTextArrayInput
                      label="Challenges"
                      value={formData.challenges || ['']}
                      onChange={(newArray: string[]) => updateArrayField('challenges', newArray)}
                      placeholder="e.g., high initial cost, maintenance requirements..."
                    />
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
                                  type="url"
                                  value={image.url}
                                  onChange={(e) => {
                                    const newImages = [...(formData.images || [])]
                                    newImages[index] = { ...image, url: e.target.value }
                                    updateArrayField('images', newImages)
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="https://example.com/image.jpg"
                                />
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
                                  type="url"
                                  value={document.url}
                                  onChange={(e) => {
                                    const newDocuments = [...(formData.downloadDocuments || [])]
                                    newDocuments[index] = { ...document, url: e.target.value }
                                    updateArrayField('downloadDocuments', newDocuments)
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="https://docs.google.com/document/d/..."
                                />
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thumbnail/Cover Image URL
                              </label>
                              <input
                                type="url"
                                value={document.imageUrl || ''}
                                onChange={(e) => {
                                  const newDocuments = [...(formData.downloadDocuments || [])]
                                  newDocuments[index] = { ...document, imageUrl: e.target.value }
                                  updateArrayField('downloadDocuments', newDocuments)
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com/thumbnail.jpg"
                              />
                            </div>
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

                  <div 
                    className="text-gray-600 prose prose-sm max-w-none mb-6"
                    dangerouslySetInnerHTML={{ __html: formData.description || '<p>Application description will appear here...</p>' }}
                  />

                  {/* Benefits */}
                  {formData.benefits?.filter(b => b.trim()).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Benefits</h3>
                      <div className="space-y-3">
                        {formData.benefits.filter(b => b.trim()).map((benefit, index) => (
                          <div key={index} className="text-gray-600 whitespace-pre-wrap">
                            {benefit}
                          </div>
                        ))}
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

        <style jsx global>{`
          .quill-wrapper .ql-editor {
            min-height: 150px;
            font-size: 14px;
            line-height: 1.6;
            font-family: inherit;
          }
          .quill-wrapper .ql-toolbar {
            background-color: #f9fafb;
            padding: 8px;
          }
          .quill-wrapper .ql-toolbar .ql-formats {
            margin-right: 15px;
          }
          .quill-wrapper .ql-toolbar .ql-formats:last-child {
            margin-right: 0;
          }
          .quill-wrapper .ql-container {
            font-family: inherit;
          }
          .quill-wrapper .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
          }
          .quill-wrapper .ql-snow .ql-tooltip {
            background-color: white;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .quill-wrapper .ql-snow .ql-picker-options {
            background-color: white;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .quill-wrapper .ql-snow .ql-picker-item:hover {
            background-color: #f3f4f6;
          }
        `}</style>
      </div>
    </div>
  )
} 