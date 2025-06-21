'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Eye, Edit, CheckCircle } from 'lucide-react'
import 'react-quill/dist/quill.snow.css'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface Project {
  _id?: string
  title: string
  description: string
  client: string
  industry: string
  location: string
  completionDate: string
  projectType: string
  pumpTypes: string[]
  images: string[]
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
}

export default function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  
  const [formData, setFormData] = useState<Omit<Project, '_id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    client: '',
    industry: 'pharmaceutical',
    location: '',
    completionDate: '',
    projectType: 'new-installation',
    pumpTypes: ['rotary-vane'],
    images: [''],
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
      setFormData({
        title: project.title,
        description: project.description,
        client: project.client,
        industry: project.industry,
        location: project.location,
        completionDate: project.completionDate,
        projectType: project.projectType,
        pumpTypes: [...project.pumpTypes],
        images: [...project.images],
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

  const handleArrayChange = (arrayName: 'pumpTypes' | 'images', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item),
    }))
  }

  const addArrayItem = (arrayName: 'pumpTypes' | 'images') => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], ''],
    }))
  }

  const removeArrayItem = (arrayName: 'pumpTypes' | 'images', index: number) => {
    if (formData[arrayName].length > 1) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: prev[arrayName].filter((_, i) => i !== index),
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleanedData = {
      ...formData,
      pumpTypes: formData.pumpTypes.filter(type => type.trim() !== ''),
      images: formData.images.filter(img => img.trim() !== ''),
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
  const industries = [
    { value: 'pharmaceutical', label: 'Pharmaceutical' },
    { value: 'semiconductor', label: 'Semiconductor' },
    { value: 'food-processing', label: 'Food Processing' },
    { value: 'chemical', label: 'Chemical' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'aerospace', label: 'Aerospace' },
    { value: 'oil-gas', label: 'Oil & Gas' },
    { value: 'power-generation', label: 'Power Generation' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'research', label: 'Research' },
    { value: 'other', label: 'Other' }
  ]

  const projectTypes = [
    { value: 'new-installation', label: 'New Installation' },
    { value: 'system-upgrade', label: 'System Upgrade' },
    { value: 'maintenance-contract', label: 'Maintenance Contract' },
    { value: 'emergency-repair', label: 'Emergency Repair' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'custom-solution', label: 'Custom Solution' }
  ]

  const pumpTypes = [
    { value: 'rotary-vane', label: 'Rotary Vane' },
    { value: 'scroll', label: 'Scroll' },
    { value: 'diaphragm', label: 'Diaphragm' },
    { value: 'turbomolecular', label: 'Turbomolecular' },
    { value: 'liquid-ring', label: 'Liquid Ring' },
    { value: 'roots-blower', label: 'Roots Blower' },
    { value: 'claw-pump', label: 'Claw Pump' },
    { value: 'other', label: 'Other' }
  ]

  const statusOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'planned', label: 'Planned' }
  ]

  const pumpTypeLabels = {
    'rotary-vane': 'Rotary Vane',
    'scroll': 'Scroll',
    'diaphragm': 'Diaphragm',
    'turbomolecular': 'Turbomolecular',
    'liquid-ring': 'Liquid Ring',
    'roots-blower': 'Roots Blower',
    'claw-pump': 'Claw Pump',
    'other': 'Other'
  }

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
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {industries.map(industry => (
                        <option key={industry.value} value={industry.value}>
                          {industry.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
                      Project Type *
                    </label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {projectTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
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

                {/* Pump Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pump Types Used
                  </label>
                  <div className="space-y-2">
                    {formData.pumpTypes.map((pumpType, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <select
                          value={pumpType}
                          onChange={(e) => handleArrayChange('pumpTypes', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select pump type</option>
                          {pumpTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {formData.pumpTypes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('pumpTypes', index)}
                            className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('pumpTypes')}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Add Pump Type
                    </button>
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Images (URLs)
                  </label>
                  <div className="space-y-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => handleArrayChange('images', index, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('images', index)}
                            className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('images')}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Add Image
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
                  {formData.images?.[0] && (
                    <div className="relative h-64 bg-gray-200">
                      <img
                        src={formData.images[0]}
                        alt={formData.title}
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
                        <div><span className="font-semibold">Industry:</span> {industries.find(ind => ind.value === formData.industry)?.label || 'Industry'}</div>
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

                    {/* Pump Types */}
                    {formData.pumpTypes.some(type => type.trim()) && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Equipment Used:</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.pumpTypes.filter(type => type.trim()).map((type, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {pumpTypeLabels[type as keyof typeof pumpTypeLabels]}
                            </span>
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