'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft,
  Star,
  CheckCircle,
  Download,
  ExternalLink,
  Zap,
  Thermometer,
  Clock,
  Gauge,
  Wind,
  Settings,
  Building,
  AlertCircle
} from 'lucide-react'
import { ProductDescriptionDisplay } from '@/components/MarkdownDisplay'
import { getImageUrl } from '@/lib/utils'

// TypeScript interface matching the Application model
interface Application {
  _id: string
  name: string
  slug: string
  description: string
  category: 'freeze-drying' | 'distillation' | 'packaging' | 'plastic' | 'degassing' | 'filtration' | 'drying' | 'metallurgy' | 'electronics' | 'medical' | 'research' | 'other'
  
  // Technical specifications
  vacuumRequirements?: {
    pressureRange?: string
    flowRate?: string
    pumpingSpeed?: string
    ultimateVacuum?: string
  }
  
  // Application characteristics
  processConditions?: {
    temperature?: string
    duration?: string
  }
  
  // Industry references
  recommendedIndustries: Array<{
    _id: string
    name: string
    slug: string
  }>
  
  // Products and projects
  products?: Array<{
    name: string
    url?: string
  }>
  projects?: Array<{
    name: string
    url?: string
  }>
  
  // Benefits and challenges
  benefits: string[]
  challenges?: string[]
  
  // Media and resources
  images?: Array<{
    url: string
    alt?: string
    caption?: string
    isPrimary?: boolean
  }>
  downloadDocuments?: Array<{
    title: string
    url: string
    imageUrl?: string
    description?: string
  }>
  
  // SEO and content
  keywords?: string[]
  
  // Status and organization
  isActive: boolean
  featured: boolean
  displayOrder: number
  
  createdAt: string
  updatedAt: string
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const slug = params.slug as string

  useEffect(() => {
    if (slug) {
      fetchApplication()
    }
  }, [slug])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${slug}`)
      if (response.ok) {
        const applicationData = await response.json()
        setApplication(applicationData)
        
        // Set the primary image as the initial image, if available
        if (applicationData.images && applicationData.images.length > 0) {
          const primaryImageIndex = applicationData.images.findIndex((img: any) => img.isPrimary)
          if (primaryImageIndex !== -1) {
            setCurrentImageIndex(primaryImageIndex)
          }
        }
      } else if (response.status === 404) {
        router.push('/applications')
      } else {
        console.error('Failed to fetch application')
      }
    } catch (error) {
      console.error('Error fetching application:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = {
    'freeze-drying': 'Freeze Drying',
    'distillation': 'Distillation',
    'packaging': 'Packaging',
    'plastic': 'Plastic',
    'degassing': 'Degassing',
    'filtration': 'Filtration',
    'drying': 'Drying',
    'metallurgy': 'Metallurgy',
    'electronics': 'Electronics',
    'medical': 'Medical',
    'research': 'Research',
    'other': 'Other'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl">Loading application...</div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
          <p className="text-gray-600 mb-8">The application you're looking for doesn't exist.</p>
          <Link 
            href="/applications"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Applications
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
              href="/applications"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Applications
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {application.name}
                </h1>
                {application.featured && (
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">Featured Application</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                  {categories[application.category as keyof typeof categories]}
                </span>
              </div>

              {/* Recommended Industries */}
              {application.recommendedIndustries && application.recommendedIndustries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Recommended for:</span>
                  {application.recommendedIndustries.map((industry, index) => (
                    <span key={index} className="inline-block px-2 py-1 bg-secondary-100 text-secondary-800 text-xs rounded">
                      {industry.name}
                    </span>
                  ))}
                </div>
              )}
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
            {application.images && application.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative">
                  <Image
                    src={getImageUrl(application.images[currentImageIndex].url)}
                    alt={application.images[currentImageIndex].alt || `${application.name} - Image ${currentImageIndex + 1}`}
                    width={800}
                    height={400}
                    className="w-full h-64 lg:h-96 object-cover"
                  />
                  {application.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {application.images.map((_, index) => (
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
                  {/* Image Caption */}
                  {application.images[currentImageIndex].caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                      <p className="text-sm">{application.images[currentImageIndex].caption}</p>
                    </div>
                  )}
                </div>
                {application.images.length > 1 && (
                  <div className="p-4 bg-gray-50 flex gap-2 overflow-x-auto">
                    {application.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative flex-shrink-0 border-2 rounded-lg overflow-hidden transition-colors ${
                          index === currentImageIndex ? 'border-primary-500' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={getImageUrl(image.url)}
                          alt={image.alt || `Thumbnail ${index + 1}`}
                          width={80}
                          height={60}
                          className="w-20 h-15 object-cover"
                        />
                        {image.isPrimary && (
                          <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
                            <Star className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Application Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Overview</h2>
              <ProductDescriptionDisplay content={application.description} />
            </div>

            {/* Benefits */}
            {application.benefits && application.benefits.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Key Benefits</h2>
                </div>
                <div className="space-y-4">
                  {application.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="text-gray-700 whitespace-pre-wrap">{benefit}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Challenges */}
            {application.challenges && application.challenges.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Considerations & Challenges</h2>
                </div>
                <div className="space-y-4">
                  {application.challenges.map((challenge, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="text-gray-700 whitespace-pre-wrap">{challenge}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download Documents */}
            {application.downloadDocuments && application.downloadDocuments.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Download className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Resources & Documents</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.downloadDocuments.map((document, index) => (
                    <a
                      key={index}
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {document.imageUrl && (
                          <Image
                            src={getImageUrl(document.imageUrl)}
                            alt={document.title}
                            width={60}
                            height={60}
                            className="w-15 h-15 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{document.title}</h3>
                          {document.description && (
                            <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                          )}
                          <div className="flex items-center gap-1 text-blue-600 text-sm">
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Vacuum Requirements */}
            {application.vacuumRequirements && (
              Object.values(application.vacuumRequirements).some(val => val?.trim())
            ) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-bold text-gray-900">Vacuum Requirements</h3>
                </div>
                <div className="space-y-3">
                  {application.vacuumRequirements.pressureRange && (
                    <div className="flex items-start gap-3">
                      <Gauge className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <span className="text-gray-600 block text-sm">Pressure Range</span>
                        <span className="font-medium">{application.vacuumRequirements.pressureRange}</span>
                      </div>
                    </div>
                  )}
                  {application.vacuumRequirements.flowRate && (
                    <div className="flex items-start gap-3">
                      <Wind className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <span className="text-gray-600 block text-sm">Flow Rate</span>
                        <span className="font-medium">{application.vacuumRequirements.flowRate}</span>
                      </div>
                    </div>
                  )}
                  {application.vacuumRequirements.pumpingSpeed && (
                    <div className="flex items-start gap-3">
                      <Zap className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <span className="text-gray-600 block text-sm">Pumping Speed</span>
                        <span className="font-medium">{application.vacuumRequirements.pumpingSpeed}</span>
                      </div>
                    </div>
                  )}
                  {application.vacuumRequirements.ultimateVacuum && (
                    <div className="flex items-start gap-3">
                      <Gauge className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <span className="text-gray-600 block text-sm">Ultimate Vacuum</span>
                        <span className="font-medium">{application.vacuumRequirements.ultimateVacuum}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Process Conditions */}
            {application.processConditions && (
              Object.values(application.processConditions).some(val => val?.trim())
            ) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Process Conditions</h3>
                <div className="space-y-3">
                  {application.processConditions.temperature && (
                    <div className="flex items-start gap-3">
                      <Thermometer className="w-4 h-4 text-red-500 mt-1" />
                      <div>
                        <span className="text-gray-600 block text-sm">Temperature Range</span>
                        <span className="font-medium">{application.processConditions.temperature}</span>
                      </div>
                    </div>
                  )}
                  {application.processConditions.duration && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-blue-500 mt-1" />
                      <div>
                        <span className="text-gray-600 block text-sm">Process Duration</span>
                        <span className="font-medium">{application.processConditions.duration}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Related Products */}
            {application.products && application.products.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Related Products</h3>
                <div className="space-y-2">
                  {application.products.map((product, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {product.url ? (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 transition-colors cursor-pointer"
                        >
                          {product.name}
                        </a>
                      ) : (
                        <span className="text-gray-700">{product.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Projects */}
            {application.projects && application.projects.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Related Projects</h3>
                <div className="space-y-2">
                  {application.projects.map((project, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {project.url ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 transition-colors cursor-pointer"
                        >
                          {project.name}
                        </a>
                      ) : (
                        <span className="text-gray-700">{project.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Industries */}
            {application.recommendedIndustries && application.recommendedIndustries.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building className="w-6 h-6 text-secondary-500" />
                  <h3 className="text-xl font-bold text-gray-900">Recommended Industries</h3>
                </div>
                <div className="space-y-2">
                  {application.recommendedIndustries.map((industry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{industry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact CTA */}
            <div className="bg-primary-900 rounded-xl text-white p-6">
              <h3 className="text-xl font-bold mb-4">Need This Application Solution?</h3>
              <p className="text-primary-100 mb-4">
                Let our experts help you implement this vacuum pump application for your specific needs.
              </p>
              <div className="space-y-3">
                <Link 
                  href="/contact"
                  className="block w-full bg-white text-primary-600 text-center px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Technical Consultation
                </Link>
                <Link 
                  href="/contact"
                  className="block w-full border-2 border-white text-white text-center px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
