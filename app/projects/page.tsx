'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Calendar, MapPin, Building, Wrench, CheckCircle, Star } from 'lucide-react'

interface Project {
  _id: string
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const projectsData = await response.json()
        setProjects(projectsData)
      } else {
        console.error('Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const industries = [
    { value: 'all', label: 'All Industries' },
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
  ]

  const projectTypes = {
    'new-installation': 'New Installation',
    'system-upgrade': 'System Upgrade',
    'maintenance-contract': 'Maintenance Contract',
    'emergency-repair': 'Emergency Repair',
    'consultation': 'Consultation',
    'custom-solution': 'Custom Solution'
  }

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

  const filteredProjects = selectedIndustry === 'all' 
    ? projects 
    : projects.filter(project => project.industry === selectedIndustry)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="section-padding">
        <div className="container-custom">
          <div className="text-center">
            <div className="text-xl">Loading projects...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Our Success Stories
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto">
              Discover how Good Motor's vacuum pump solutions have transformed industries worldwide
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold">{projects.length}+</div>
                <div className="text-blue-200">Completed Projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{new Set(projects.map(p => p.industry)).size}+</div>
                <div className="text-blue-200">Industries Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{new Set(projects.map(p => p.location)).size}+</div>
                <div className="text-blue-200">Locations Worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-4">
            {industries.map((industry) => (
              <button
                key={industry.value}
                onClick={() => setSelectedIndustry(industry.value)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  selectedIndustry === industry.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {industry.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">No projects found for the selected industry.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredProjects.map((project) => (
                <div key={project._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                  {/* Project Header */}
                  <div className="relative">
                    {project.images && project.images.length > 0 && (
                      <Image
                        src={project.images[0]}
                        alt={project.title}
                        width={600}
                        height={300}
                        className="w-full h-64 object-cover"
                      />
                    )}
                    {project.featured && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium">Featured</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col h-full">
                    {/* Project Title & Type */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {projectTypes[project.projectType as keyof typeof projectTypes]}
                      </span>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="w-4 h-4" />
                        <span>{project.client}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(project.completionDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Wrench className="w-4 h-4" />
                        <span className="capitalize">{project.industry.replace('-', ' ')}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div 
                      className="text-gray-600 mb-4"
                      dangerouslySetInnerHTML={{ __html: project.description }}
                    />

                    {/* Specifications */}
                    {(project.specifications.flowRate || project.specifications.vacuumLevel || project.specifications.power) && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Key Specifications:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          {project.specifications.flowRate && <div>Flow Rate: {project.specifications.flowRate}</div>}
                          {project.specifications.vacuumLevel && <div>Vacuum Level: {project.specifications.vacuumLevel}</div>}
                          {project.specifications.power && <div>Power: {project.specifications.power}</div>}
                          {project.specifications.quantity && <div>Quantity: {project.specifications.quantity}</div>}
                        </div>
                      </div>
                    )}

                    {/* Pump Types */}
                    {project.pumpTypes && project.pumpTypes.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Equipment Used:</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.pumpTypes.map((type, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {pumpTypeLabels[type as keyof typeof pumpTypeLabels]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Results */}
                    <div className="border-t pt-4 mt-auto">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Results Achieved:</h4>
                          <div 
                            className="text-sm text-gray-600"
                            dangerouslySetInnerHTML={{ __html: project.results }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let our experts help you find the perfect vacuum pump solution for your specific needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get A Quote
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  )
} 