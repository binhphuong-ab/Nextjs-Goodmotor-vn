/**
 * Projects Portfolio Page
 * 
 * This is the PUBLIC-FACING projects showcase page that displays completed project case studies.
 * 
 * DATA FLOW:
 * 1. This page makes an API call to → /api/projects/route.ts
 * 2. The API returns completed projects from MongoDB
 * 3. This page renders the projects in a beautiful portfolio layout
 * 
 * RELATIONSHIP WITH API:
 * - Frontend Consumer: This page (page.tsx)
 * - Backend Provider: /api/projects/route.ts
 * - Data Source: MongoDB Project collection
 * 
 * FEATURES:
 * - Industry filtering
 * - Dynamic statistics calculation
 * - Featured project highlighting
 * - Responsive grid layout
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Building, Wrench, CheckCircle, Star, ArrowRight } from 'lucide-react'

// TypeScript interface matching the Project model from /models/Project.ts
interface Project {
  _id: string
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
  solutions: string
  featured: boolean
  status: 'completed' | 'ongoing' | 'planned'
}

export default function ProjectsPage() {
  // State management for projects data and UI
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch projects data when component mounts
  useEffect(() => {
    fetchProjects()
  }, [])

  /**
   * MAIN DATA FETCHING FUNCTION
   * 
   * This function connects the FRONTEND (this page) with the BACKEND API.
   * 
   * API CALL FLOW:
   * 1. Makes HTTP GET request to '/api/projects'
   * 2. The request is handled by /app/api/projects/route.ts
   * 3. route.ts queries MongoDB for completed projects
   * 4. route.ts returns JSON array of projects
   * 5. This page updates state and re-renders UI
   * 
   * ERROR HANDLING:
   * - Graceful failure: Shows error in console but doesn't crash page
   * - Loading state: Provides user feedback during data fetch
   */
  const fetchProjects = async () => {
    try {
      // API call to our backend route → /app/api/projects/route.ts
      const response = await fetch('/api/projects')
      if (response.ok) {
        // Parse JSON response from the API
        const projectsData = await response.json()
        // Update component state with fetched data
        setProjects(projectsData)
      } else {
        console.error('Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      // Always stop loading state regardless of success/failure
      setLoading(false)
    }
  }

  // Project type and pump type labels
  const projectTypes = {
    'new-installation': 'New Installation',
    'system-upgrade': 'System Upgrade',
    'maintenance-contract': 'Maintenance Contract',
    'emergency-repair': 'Emergency Repair',
    'consultation': 'Consultation',
    'custom-solution': 'Custom Solution'
  }

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
                <div className="text-3xl font-bold">{new Set(projects.map(p => p.location)).size}+</div>
                <div className="text-blue-200">Locations Worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">No projects found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((project) => (
                <div key={project._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                  {/* Project Header */}
                  <div className="relative">
                    {project.images && project.images.length > 0 && (
                      <Image
                        src={project.images[0].url}
                        alt={project.images[0].alt || project.title}
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
                    </div>



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

                    {/* Pump Models */}
                    {project.pumpModels && project.pumpModels.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Equipment Used:</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.pumpModels.map((model, index) => (
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
                    {project.applications && project.applications.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Applications:</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.applications.map((app, index) => (
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

                    {/* View Details Button */}
                    <div className="border-t pt-4 mt-auto">
                      <Link 
                        href={`/projects/${project.slug}`}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group"
                      >
                        View Project Details
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
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