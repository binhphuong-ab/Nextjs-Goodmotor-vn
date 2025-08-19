'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Eye, Edit, CheckCircle, AlertCircle } from 'lucide-react'
import { generateSlug, getTodayDate, validateImageUrl, getImageUrl } from '@/lib/utils'
import 'react-quill/dist/quill.snow.css'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface Project {
  _id?: string
  title: string
  slug: string
  description: string
  client: string
  location: string
  completionDate: string
  projectType: string
  pumpModels: Array<{
    name: string
    url: string
  }>
  applications: Array<{
    name: string
    url: string
  }>
  images: Array<{
    url: string
    alt?: string
    caption?: string
    isPrimary?: boolean
  }>
  specifications: {
    flowRate?: string
    vacuumLevel?: string
    power?: string
    quantity?: string
  }
  challenges: string
  solutions: string
  results: string
  featured: boolean
  status: 'completed' | 'ongoing' | 'planned'
}

interface ProjectFormProps {
  project?: Project | null
  onSave: (projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void
}

interface ValidationErrors {
  [key: string]: string
}

export default function ProjectForm({ project, onSave, onCancel, onShowNotification }: ProjectFormProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [showValidation, setShowValidation] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  

  
  const [formData, setFormData] = useState<Omit<Project, '_id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    slug: '',
    description: '',
    client: '',
    location: '',
    completionDate: project ? '' : getTodayDate(), // Auto-fill with today for new projects
    projectType: 'new-installation',
    pumpModels: [{ name: '', url: '' }],
    applications: [{ name: '', url: '' }],
    images: [{ url: '', alt: '', caption: '', isPrimary: true }],
    specifications: {
      flowRate: '',
      vacuumLevel: '',
      power: '',
      quantity: ''
    },
    challenges: '',
    solutions: '',
    results: '',
    featured: false,
    status: 'completed'
  })



  useEffect(() => {
    if (project) {
      // Format completion date for date input (YYYY-MM-DD)
      const formattedDate = project.completionDate ? 
        new Date(project.completionDate).toISOString().split('T')[0] : 
        getTodayDate()
      
      setFormData({
        title: project.title,
        slug: project.slug,
        description: project.description,
        client: project.client,
        location: project.location,
        completionDate: formattedDate,
        projectType: project.projectType,
        pumpModels: [...project.pumpModels],
        applications: [...project.applications],
        images: project.images.map((img, index) => {
          // Handle both old string format and new object format
          if (typeof img === 'string') {
            return { url: img, alt: '', caption: '', isPrimary: index === 0 }
          }
          return { ...img }
        }),
        specifications: { ...project.specifications },
        challenges: project.challenges,
        solutions: project.solutions,
        results: project.results,
        featured: project.featured,
        status: project.status
      })
    }
  }, [project])

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
    } else if (name === 'title') {
      // Auto-generate slug when title changes (only if slug is empty or was auto-generated)
      const newSlug = generateSlug(value)
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: prev.slug === '' || prev.slug === generateSlug(prev.title) ? newSlug : prev.slug,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleRichTextChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Image validation function
  const validateImageUrlLocal = (url: string): string | null => {
    const result = validateImageUrl(url, { 
      context: 'Image', 
      allowEmpty: true 
    })
    return result.isValid ? null : result.error || 'Invalid image format'
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
    
    // Clear errors when user starts typing
    if (field === 'url' && errors[`image_${index}_url`]) {
      setErrors(prev => ({
        ...prev,
        [`image_${index}_url`]: ''
      }))
    }
    
    // Validate image URL when it changes
    if (field === 'url' && typeof value === 'string') {
      const validationError = validateImageUrlLocal(value)
      if (validationError) {
        setErrors(prev => ({
          ...prev,
          [`image_${index}_url`]: validationError
        }))
      }
    }
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
      
      // Clear errors for removed image and shift remaining errors
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`image_${index}_url`]
        
        // Shift error indices for remaining images
        for (let i = index + 1; i < formData.images.length; i++) {
          if (newErrors[`image_${i}_url`]) {
            newErrors[`image_${i-1}_url`] = newErrors[`image_${i}_url`]
            delete newErrors[`image_${i}_url`]
          }
        }
        
        return newErrors
      })
    }
  }

  const handlePrimaryImageChange = (index: number, isPrimary: boolean) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index ? isPrimary : false // Only one image can be primary
      }))
    }))
  }

  const handleArrayChange = (arrayName: 'pumpModels' | 'applications', index: number, value: string | { name: string; url: string }) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item),
    }))
  }

  const addArrayItem = (arrayName: 'pumpModels' | 'applications') => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { name: '', url: '' }],
    }))
  }

  const removeArrayItem = (arrayName: 'pumpModels' | 'applications', index: number) => {
    if (formData[arrayName].length > 1) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: prev[arrayName].filter((_, i) => i !== index),
      }))
    }
  }

  const validateForm = () => {
    const errors: ValidationErrors = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Project title is required'
    }
    if (!formData.description.trim()) {
      errors.description = 'Project description is required'
    }
    if (!formData.client.trim()) {
      errors.client = 'Client name is required'
    }
    if (!formData.location.trim()) {
      errors.location = 'Location is required'
    }
    if (!formData.completionDate.trim()) {
      errors.completionDate = 'Completion date is required'
    }
    if (!formData.challenges.trim()) {
      errors.challenges = 'Project challenges description is required'
    }
    if (!formData.solutions.trim()) {
      errors.solutions = 'Solutions description is required'
    }
    if (!formData.results.trim()) {
      errors.results = 'Results description is required'
    }
    
    // Validate images
    const newImageErrors: { [key: string]: string } = {}
    formData.images.forEach((image, index) => {
      if (image.url && image.url.trim()) {
        const validationError = validateImageUrlLocal(image.url)
        if (validationError) {
          newImageErrors[`image_${index}_url`] = validationError
        }
      }
    })
    setErrors(newImageErrors)
    
    return errors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setShowValidation(true)
      const errorMessage = 'Please fix the following errors: ' + Object.values(errors).join(', ')
      onShowNotification?.('error', errorMessage)
      return
    }
    
    // Clear validation errors on successful validation
    setValidationErrors({})
    setShowValidation(false)
    
    // Ensure at least one image is primary if images exist
    const filteredImages = formData.images.filter(img => img.url.trim() !== '')
    if (filteredImages.length > 0 && !filteredImages.some(img => img.isPrimary)) {
      filteredImages[0].isPrimary = true
    }
    
    const cleanedData = {
      ...formData,
      // Convert completionDate string to Date object for the API
      completionDate: new Date(formData.completionDate).toISOString(),
      pumpModels: formData.pumpModels.filter(model => model.name.trim() !== ''),
      applications: formData.applications.filter(app => app.name.trim() !== ''),
      images: filteredImages,
    }
    
    onSave(cleanedData)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Options
  const projectTypes = [
    { value: 'new-installation', label: 'New Installation' },
    { value: 'system-upgrade', label: 'System Upgrade' },
    { value: 'maintenance-contract', label: 'Maintenance Contract' },
    { value: 'emergency-repair', label: 'Emergency Repair' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'custom-solution', label: 'Custom Solution' }
  ]

  const statusOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'planned', label: 'Planned' }
  ]

  // Quill editor configuration
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {project ? 'Edit Project' : 'Add New Project'}
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
                Live Preview
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {project ? 'Update Project' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          {activeTab === 'edit' ? (
            /* Edit Mode */
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <form id="project-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {showValidation && validationErrors.title && (
                      <p className="text-red-500 text-xs mt-1"><AlertCircle className="w-4 h-4 inline-block mr-1" /> {validationErrors.title}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                      Project Slug *
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
                      placeholder="auto-generated-from-title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be used in the URL: /projects/{formData.slug}
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Auto-generate from title
                    </button>
                  </div>

                  <div>
                    <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      id="client"
                      name="client"
                      value={formData.client}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {showValidation && validationErrors.client && (
                      <p className="text-red-500 text-xs mt-1"><AlertCircle className="w-4 h-4 inline-block mr-1" /> {validationErrors.client}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
                      Project Type *
                    </label>
                    <div className="space-y-2">
                      <div className="relative">
                        <select
                          id="projectType"
                          name="projectType"
                          value={formData.projectType}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                          size={5}
                        >
                          {projectTypes.map(type => (
                            <option 
                              key={type.value} 
                              value={type.value}
                              className="py-2 px-2 hover:bg-blue-50 cursor-pointer"
                            >
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-gray-500">
                        <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <div>Choose the type of project</div>
                          {formData.projectType && (
                            <div className="mt-1 text-blue-600 font-medium">
                              {projectTypes.find(type => type.value === formData.projectType)?.label} selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {showValidation && validationErrors.projectType && (
                      <p className="text-red-500 text-xs mt-1"><AlertCircle className="w-4 h-4 inline-block mr-1" /> {validationErrors.projectType}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <div className="space-y-2">
                      <div className="relative">
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[120px] transition-colors duration-200 hover:border-gray-400"
                          size={5}
                        >
                          {statusOptions.map(status => (
                            <option 
                              key={status.value} 
                              value={status.value}
                              className="py-2 px-2 hover:bg-blue-50 cursor-pointer"
                            >
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-start space-x-2 text-xs text-gray-500">
                        <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <div>Select the project status</div>
                          {formData.status && (
                            <div className="mt-1 text-blue-600 font-medium">
                              {statusOptions.find(status => status.value === formData.status)?.label} selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {showValidation && validationErrors.status && (
                      <p className="text-red-500 text-xs mt-1"><AlertCircle className="w-4 h-4 inline-block mr-1" /> {validationErrors.status}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {showValidation && validationErrors.location && (
                      <p className="text-red-500 text-xs mt-1"><AlertCircle className="w-4 h-4 inline-block mr-1" /> {validationErrors.location}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Completion Date *
                    </label>
                    <input
                      type="date"
                      id="completionDate"
                      name="completionDate"
                      value={formData.completionDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {showValidation && validationErrors.completionDate && (
                      <p className="text-red-500 text-xs mt-1"><AlertCircle className="w-4 h-4 inline-block mr-1" /> {validationErrors.completionDate}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description *
                  </label>
                  <div className="quill-editor-wrapper">
                    <ReactQuill
                      value={formData.description}
                      onChange={(value) => handleRichTextChange('description', value)}
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="Enter detailed project description..."
                    />
                    {showValidation && validationErrors.description && (
                      <p className="text-red-500 text-xs mt-1"><AlertCircle className="w-4 h-4 inline-block mr-1" /> {validationErrors.description}</p>
                    )}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Images
                  </label>
                  <div className="space-y-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="space-y-3">
                          {/* Image URL */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Image URL
                            </label>
                            <input
                              type="url"
                              value={image.url}
                              onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                              placeholder="https://example.com/image.jpg or /images/project.jpg"
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                showValidation && validationErrors[`images.${index}.url`] 
                                  ? 'border-red-300' 
                                  : 'border-gray-300'
                              }`}
                            />
                            {showValidation && validationErrors[`images.${index}.url`] && (
                              <p className="mt-1 text-sm text-red-600">
                                {validationErrors[`images.${index}.url`]}
                              </p>
                            )}
                          </div>

                          {/* Alt Text */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Alt Text
                            </label>
                            <input
                              type="text"
                              value={image.alt || ''}
                              onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                              placeholder="Description of the image for accessibility"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Caption */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Caption
                            </label>
                            <input
                              type="text"
                              value={image.caption || ''}
                              onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                              placeholder="Optional caption displayed with the image"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Primary Image Checkbox */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`primary-image-${index}`}
                              checked={image.isPrimary || false}
                              onChange={(e) => handlePrimaryImageChange(index, e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`primary-image-${index}`} className="text-sm text-gray-700">
                              Primary image (displayed first)
                            </label>
                          </div>

                          {/* Image Preview */}
                          {image.url && (
                            <div className="mt-3">
                              <label className="block text-xs font-medium text-gray-600 mb-2">
                                Preview
                              </label>
                              <div className="relative w-32 h-24 border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                                <img
                                  src={getImageUrl(image.url)}
                                  alt={image.alt || 'Project image preview'}
                                  className="w-full h-full object-cover"
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
                                  className="absolute inset-0 flex items-center justify-center bg-gray-100 text-red-500 text-xs text-center p-2" 
                                  style={{ display: 'none' }}
                                >
                                  <div>
                                    <svg className="w-6 h-6 mx-auto mb-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    ⚠️ Unable to load image. Please check the URL or path.
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Remove Image Button */}
                          {formData.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="inline-flex items-center px-3 py-1 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                            >
                              Remove Image
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addImage}
                      className="inline-flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Add Image
                    </button>
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Technical Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="spec_flowRate" className="block text-sm font-medium text-gray-700 mb-2">
                        Flow Rate
                      </label>
                      <input
                        type="text"
                        id="spec_flowRate"
                        name="spec_flowRate"
                        value={formData.specifications.flowRate || ''}
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
                        value={formData.specifications.vacuumLevel || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., 29.8 inHg"
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
                        value={formData.specifications.power || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., 45 kW"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      
                    </div>

                    <div>
                      <label htmlFor="spec_quantity" className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="text"
                        id="spec_quantity"
                        name="spec_quantity"
                        value={formData.specifications.quantity || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., 8 units"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      
                    </div>
                  </div>
                </div>

                {/* Pump Models */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pump Models Used
                  </label>
                  <div className="space-y-2">
                    {formData.pumpModels.map((pumpModel, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={pumpModel.name}
                          onChange={(e) => handleArrayChange('pumpModels', index, { ...pumpModel, name: e.target.value })}
                          placeholder="Pump Model Name"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="url"
                          value={pumpModel.url}
                          onChange={(e) => handleArrayChange('pumpModels', index, { ...pumpModel, url: e.target.value })}
                          placeholder="Pump Model URL"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.pumpModels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('pumpModels', index)}
                            className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('pumpModels')}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Add Pump Model
                    </button>
                  </div>
                </div>

                {/* Applications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Applications Used
                  </label>
                  <div className="space-y-2">
                    {formData.applications.map((application, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={application.name}
                          onChange={(e) => handleArrayChange('applications', index, { ...application, name: e.target.value })}
                          placeholder="Application Name"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="url"
                          value={application.url}
                          onChange={(e) => handleArrayChange('applications', index, { ...application, url: e.target.value })}
                          placeholder="Application URL"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.applications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('applications', index)}
                            className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('applications')}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Add Application
                    </button>
                  </div>
                </div>

                {/* Challenges */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Challenges
                  </label>
                  <div className="quill-editor-wrapper">
                    <ReactQuill
                      value={formData.challenges}
                      onChange={(value) => handleRichTextChange('challenges', value)}
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="Describe the main challenges faced in this project..."
                    />
                    {showValidation && validationErrors.challenges && (
                      <p className="text-red-500 text-xs mt-1"><AlertCircle className="w-4 h-4 inline-block mr-1" /> {validationErrors.challenges}</p>
                    )}
                  </div>
                </div>

                {/* Solutions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solutions Provided
                  </label>
                  <div className="quill-editor-wrapper">
                    <ReactQuill
                      value={formData.solutions}
                      onChange={(value) => handleRichTextChange('solutions', value)}
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="Explain the solutions and approaches used..."
                    />
                    {showValidation && validationErrors.solutions && (
                      <p className="text-red-500 text-xs mt-1"><AlertCircle className="w-4 h-4 inline-block mr-1" /> {validationErrors.solutions}</p>
                    )}
                  </div>
                </div>

                {/* Results */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Results Achieved
                  </label>
                  <div className="quill-editor-wrapper">
                    <ReactQuill
                      value={formData.results}
                      onChange={(value) => handleRichTextChange('results', value)}
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="Detail the outcomes and achievements..."
                    />
                    {showValidation && validationErrors.results && (
                      <p className="text-red-500 text-xs mt-1"><AlertCircle className="w-4 h-4 inline-block mr-1" /> {validationErrors.results}</p>
                    )}
                  </div>
                </div>

                {/* Featured checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    Feature this project on the homepage
                  </label>
                </div>


              </form>
            </div>
          ) : (
            /* Preview Mode */
            <div className="h-full overflow-y-auto bg-gray-50 p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Project Preview Header */}
                  {formData.images?.[0]?.url && (
                    <div className="relative h-64 bg-gray-200">
                      <img
                        src={getImageUrl(formData.images[0].url)}
                        alt={formData.images[0].alt || formData.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      {formData.featured && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Featured</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-8">
                    {/* Project Title & Type */}
                    <div className="mb-6">
                      <h1 className="text-3xl font-bold text-gray-900 mb-3">{formData.title || 'Project Title'}</h1>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {projectTypes.find(type => type.value === formData.projectType)?.label || 'Project Type'}
                      </span>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
                      <div className="space-y-2">
                        <div><span className="font-semibold">Client:</span> {formData.client || 'Client Name'}</div>
                        <div><span className="font-semibold">Location:</span> {formData.location || 'Location'}</div>
                      </div>
                      <div className="space-y-2">
                        <div><span className="font-semibold">Completion:</span> {formatDate(formData.completionDate) || 'Date'}</div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Description</h3>
                      <div 
                        className="text-gray-600 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: formData.description || '<p>Project description will appear here...</p>' }}
                      />
                    </div>

                    {/* Specifications */}
                    {(formData.specifications.flowRate || formData.specifications.vacuumLevel || formData.specifications.power || formData.specifications.quantity) && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Key Specifications:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          {formData.specifications.flowRate && <div>Flow Rate: {formData.specifications.flowRate}</div>}
                          {formData.specifications.vacuumLevel && <div>Vacuum Level: {formData.specifications.vacuumLevel}</div>}
                          {formData.specifications.power && <div>Power: {formData.specifications.power}</div>}
                          {formData.specifications.quantity && <div>Quantity: {formData.specifications.quantity}</div>}
                        </div>
                      </div>
                    )}

                    {/* Pump Models */}
                    {formData.pumpModels.some(model => model.name.trim()) && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Equipment Used:</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.pumpModels.filter(model => model.name.trim()).map((model, index) => (
                            <a
                              key={index}
                              href={model.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs rounded transition-colors cursor-pointer"
                            >
                              {model.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Applications */}
                    {formData.applications.some(app => app.name.trim()) && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Applications Used:</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.applications.filter(app => app.name.trim()).map((app, index) => (
                            <a
                              key={index}
                              href={app.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 text-xs rounded transition-colors cursor-pointer"
                            >
                              {app.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Challenges */}
                    {formData.challenges && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Challenges:</h4>
                        <div 
                          className="text-gray-600 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: formData.challenges }}
                        />
                      </div>
                    )}

                    {/* Solutions */}
                    {formData.solutions && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Solutions:</h4>
                        <div 
                          className="text-gray-600 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: formData.solutions }}
                        />
                      </div>
                    )}

                    {/* Results */}
                    {formData.results && (
                      <div className="border-t pt-6">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Results Achieved:</h4>
                            <div 
                              className="text-gray-600 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: formData.results }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>



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
          
          /* Scrollbar styling */
          .scrollbar-thin {
            scrollbar-width: thin;
          }
          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          
          /* Ensure proper flex behavior for scrolling */
          .min-h-0 {
            min-height: 0;
          }
          
          /* Preview prose styling */
          .prose p {
            margin-bottom: 1em;
          }
          .prose ul, .prose ol {
            margin: 1em 0;
            padding-left: 1.5em;
          }
          .prose li {
            margin-bottom: 0.5em;
          }
          .prose strong {
            font-weight: 600;
          }
          .prose em {
            font-style: italic;
          }
          .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
            font-weight: 600;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
        `}</style>
      </div>
    </div>
  )
} 