/**
 * Applications Portfolio Page
 * 
 * This is the PUBLIC-FACING applications showcase page that displays vacuum pump applications.
 * 
 * DATA FLOW:
 * 1. This page makes an API call to → /api/applications/route.ts
 * 2. The API returns active applications from MongoDB
 * 3. This page renders the applications in a beautiful portfolio layout
 * 
 * RELATIONSHIP WITH API:
 * - Frontend Consumer: This page (page.tsx)
 * - Backend Provider: /api/applications/route.ts
 * - Data Source: MongoDB Application collection
 * 
 * FEATURES:
 * - Category filtering
 * - Industry filtering
 * - Dynamic statistics calculation
 * - Featured application highlighting
 * - Responsive grid layout
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Calendar, 
  MapPin, 
  Building, 
  Wrench, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  Filter,
  Search,
  Beaker,
  Zap
} from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

// TypeScript interface matching the Application model from /models/Application.ts
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
  
  // Authors and case studies
  authors: string
  caseStudies?: string
  
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

export default function ApplicationsPage() {
  // State management for applications data and UI
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch applications data when component mounts
  useEffect(() => {
    fetchApplications()
  }, [])

  /**
   * MAIN DATA FETCHING FUNCTION
   * 
   * This function connects the FRONTEND (this page) with the BACKEND API.
   * 
   * API CALL FLOW:
   * 1. Makes HTTP GET request to '/api/applications'
   * 2. The request is handled by /app/api/applications/route.ts
   * 3. route.ts queries MongoDB for active applications
   * 4. route.ts returns JSON array of applications
   * 5. This page updates state and re-renders UI
   * 
   * ERROR HANDLING:
   * - Graceful failure: Shows error in console but doesn't crash page
   * - Loading state: Provides user feedback during data fetch
   */
  const fetchApplications = async () => {
    try {
      // API call to our backend route → /app/api/applications/route.ts
      const response = await fetch('/api/applications')
      if (response.ok) {
        // Parse JSON response from the API
        const applicationsData = await response.json()
        // Update component state with fetched data
        setApplications(applicationsData)
      } else {
        console.error('Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      // Always stop loading state regardless of success/failure
      setLoading(false)
    }
  }

  // Application categories
  const categories = {
    'all': 'All Applications',
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

  // Filter applications based on category and search term
  const filteredApplications = applications.filter(app => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
      app.recommendedIndustries.some(industry => industry.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="section-padding">
        <div className="container-custom">
          <div className="text-center">
            <div className="text-xl">Loading applications...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white py-20">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Vacuum Pump Applications
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto text-primary-100">
              Discover how Good Motor's vacuum pump solutions serve diverse industries and applications
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary-300">{applications.length}+</div>
                <div className="text-primary-200">Applications</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-300">{new Set(applications.map(a => a.category)).size}+</div>
                <div className="text-primary-200">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-300">
                  {new Set(applications.flatMap(a => a.recommendedIndustries.map(i => i.name))).size}+
                </div>
                <div className="text-primary-200">Industries Served</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b py-6">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {Object.entries(categories).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="text-gray-600 text-sm">
              {filteredApplications.length} of {applications.length} applications
            </div>
          </div>
        </div>
      </section>

      {/* Applications Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-16">
              <Beaker className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No applications found.</p>
              {(selectedCategory !== 'all' || searchTerm) && (
                <p className="text-gray-500 mt-2">Try adjusting your filters or search term.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredApplications.map((application) => (
                <div key={application._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                  {/* Application Header */}
                  <div className="relative">
                    {application.images && application.images.length > 0 && (
                      <Image
                        src={getImageUrl(application.images.find(img => img.isPrimary)?.url || application.images[0].url)}
                        alt={application.images[0].alt || application.name}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    {!application.images?.length && (
                      <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <Zap className="w-12 h-12 text-primary-500" />
                      </div>
                    )}
                    {application.featured && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium">Featured</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col h-full">
                    {/* Application Title & Category */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{application.name}</h3>
                      <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                        {categories[application.category as keyof typeof categories]}
                      </span>
                    </div>

                    {/* Description Preview */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                      {application.description.replace(/[#*`]/g, '').substring(0, 150)}
                      {application.description.length > 150 && '...'}
                    </p>

                    {/* Technical Specs */}
                    {application.vacuumRequirements && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Key Specifications:</h4>
                        <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                          {application.vacuumRequirements.pressureRange && (
                            <div>Pressure: {application.vacuumRequirements.pressureRange}</div>
                          )}
                          {application.vacuumRequirements.flowRate && (
                            <div>Flow Rate: {application.vacuumRequirements.flowRate}</div>
                          )}
                          {application.processConditions?.temperature && (
                            <div>Temperature: {application.processConditions.temperature}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recommended Industries */}
                    {application.recommendedIndustries && application.recommendedIndustries.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Industries:</h4>
                        <div className="flex flex-wrap gap-1">
                          {application.recommendedIndustries.slice(0, 3).map((industry, index) => (
                            <span key={index} className="px-2 py-1 bg-secondary-100 text-secondary-800 text-xs rounded">
                              {industry.name}
                            </span>
                          ))}
                          {application.recommendedIndustries.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{application.recommendedIndustries.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Authors Preview */}
                    {application.authors && application.authors.trim() && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Authors:</h4>
                        <div className="text-xs text-gray-600">
                          <div className="line-clamp-2">
                            {application.authors.replace(/[#*`]/g, '').substring(0, 100)}
                            {application.authors.length > 100 && '...'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* View Details Button */}
                    <div className="border-t pt-4 mt-auto">
                      <Link 
                        href={`/applications/${application.slug}`}
                        className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 group"
                      >
                        View Application Details
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
      <section className="bg-primary-900 text-white py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help Finding the Right Application?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-100">
            Our experts can help you identify the perfect vacuum pump solution for your specific application needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/contact"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Technical Consultation
            </Link>
            <Link 
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Request Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
