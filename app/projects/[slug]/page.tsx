'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Calendar, 
  MapPin, 
  Building, 
  Wrench, 
  CheckCircle, 
  Star, 
  ArrowLeft,
  Target,
  Lightbulb,
  Award,
  Settings
} from 'lucide-react'
import { ProjectDescriptionDisplay } from '@/components/MarkdownDisplay'

// TypeScript interface matching the Project model
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
  createdAt: string
  updatedAt: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const slug = params.slug as string

  useEffect(() => {
    if (slug) {
      fetchProject()
    }
  }, [slug])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${slug}`)
      if (response.ok) {
        const projectData = await response.json()
        setProject(projectData)
      } else if (response.status === 404) {
        router.push('/projects')
      } else {
        console.error('Failed to fetch project')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const projectTypes = {
    'new-installation': 'New Installation',
    'system-upgrade': 'System Upgrade',
    'maintenance-contract': 'Maintenance Contract',
    'emergency-repair': 'Emergency Repair',
    'consultation': 'Consultation',
    'custom-solution': 'Custom Solution'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">Loading project...</div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-8">The project you're looking for doesn't exist.</p>
          <Link 
            href="/projects"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-custom py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/projects"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Projects
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {project.title}
                </h1>
                {project.featured && (
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">Featured Project</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>{project.client}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(project.completionDate)}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {projectTypes[project.projectType as keyof typeof projectTypes]}
                </span>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  project.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : project.status === 'ongoing'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {project.images && project.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative">
                  <Image
                    src={project.images[currentImageIndex]}
                    alt={`${project.title} - Image ${currentImageIndex + 1}`}
                    width={800}
                    height={400}
                    className="w-full h-64 lg:h-96 object-cover"
                  />
                  {project.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {project.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {project.images.length > 1 && (
                  <div className="p-4 bg-gray-50 flex gap-2 overflow-x-auto">
                    {project.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 border-2 rounded-lg overflow-hidden transition-colors ${
                          index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          width={80}
                          height={60}
                          className="w-20 h-15 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Project Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Overview</h2>
              <ProjectDescriptionDisplay content={project.description} />
            </div>

            {/* Challenges, Solutions, Results */}
            <div className="space-y-6">
              {/* Challenges */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-red-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Challenges</h2>
                </div>
                <ProjectDescriptionDisplay content={project.challenges} />
              </div>

              {/* Solutions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Solutions</h2>
                </div>
                <ProjectDescriptionDisplay content={project.solutions} />
              </div>

              {/* Results */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Results Achieved</h2>
                </div>
                <ProjectDescriptionDisplay content={project.results} />
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Technical Specifications */}
            {(project.specifications.flowRate || project.specifications.vacuumLevel || 
              project.specifications.power || project.specifications.quantity) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-bold text-gray-900">Technical Specifications</h3>
                </div>
                <div className="space-y-3">
                  {project.specifications.flowRate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Flow Rate:</span>
                      <span className="font-medium">{project.specifications.flowRate}</span>
                    </div>
                  )}
                  {project.specifications.vacuumLevel && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vacuum Level:</span>
                      <span className="font-medium">{project.specifications.vacuumLevel}</span>
                    </div>
                  )}
                  {project.specifications.power && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Power:</span>
                      <span className="font-medium">{project.specifications.power}</span>
                    </div>
                  )}
                  {project.specifications.quantity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{project.specifications.quantity}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Equipment Used */}
            {project.pumpModels && project.pumpModels.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Equipment Used</h3>
                <div className="space-y-2">
                  {project.pumpModels.map((model, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <a
                        href={model.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      >
                        {model.name}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications */}
            {project.applications && project.applications.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Applications</h3>
                <div className="space-y-2">
                  {project.applications.map((app, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                      >
                        {app.name}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Project Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 block">Project Type:</span>
                  <span className="font-medium">
                    {projectTypes[project.projectType as keyof typeof projectTypes]}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block">Status:</span>
                  <span className="font-medium capitalize">{project.status}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Completion Date:</span>
                  <span className="font-medium">{formatDate(project.completionDate)}</span>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-blue-600 rounded-xl text-white p-6">
              <h3 className="text-xl font-bold mb-4">Interested in Similar Solutions?</h3>
              <p className="text-blue-100 mb-4">
                Let our experts help you find the perfect vacuum pump solution for your specific needs.
              </p>
              <div className="space-y-3">
                <Link 
                  href="/contact"
                  className="block w-full bg-white text-blue-600 text-center px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get A Quote
                </Link>
                <Link 
                  href="/contact"
                  className="block w-full border-2 border-white text-white text-center px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
