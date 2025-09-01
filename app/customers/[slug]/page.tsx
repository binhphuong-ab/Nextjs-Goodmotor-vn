'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  BuildingOfficeIcon, 
  GlobeAltIcon,
  MapPinIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  CpuChipIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { ICustomerPopulated } from '@/types/customer'









export default function CustomerDetailPage() {
  const { slug } = useParams()
  const [customer, setCustomer] = useState<ICustomerPopulated | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (slug) {
      fetchCustomer(slug as string)
    }
  }, [slug])

  const fetchCustomer = async (customerSlug: string) => {
    try {
      const response = await fetch(`/api/customers/${customerSlug}`)
      if (response.ok) {
        const customerData = await response.json()
        setCustomer(customerData)
        
        // Set the primary image as the initial image, if available
        if (customerData.images && customerData.images.length > 0) {
          const primaryImageIndex = customerData.images.findIndex((img: any) => img.isPrimary)
          if (primaryImageIndex !== -1) {
            setCurrentImageIndex(primaryImageIndex)
          }
        }
      } else if (response.status === 404) {
        setError('Customer not found')
      } else {
        setError('Failed to fetch customer details')
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
      setError('An error occurred while loading customer details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-20">
          <div className="text-center">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {error || 'Customer not found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The customer you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/customers" className="mt-4 inline-flex items-center btn-primary">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Customers
            </Link>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/customers" className="text-gray-400 hover:text-gray-500">
                  Customers
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-900">{customer.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Enhanced Header */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {customer.logo ? (
                <img
                  src={customer.logo}
                  alt={`${customer.name} logo`}
                  className="h-20 w-20 rounded-xl object-cover border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="h-20 w-20 bg-primary-100 rounded-xl flex items-center justify-center">
                  <BuildingOfficeIcon className="h-10 w-10 text-primary-600" />
                </div>
              )}
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                {customer.legalName && customer.legalName !== customer.name && (
                  <p className="text-lg text-gray-600 mt-1">Legal Name: {customer.legalName}</p>
                )}
                {customer.address && (
                  <p className="text-lg text-gray-600 mt-1 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                    {customer.address}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full border bg-green-100 text-green-800 border-green-200">
                    {customer.nationality}
                  </span>
                  {customer.province && (
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full border bg-orange-100 text-orange-800 border-orange-200">
                      {customer.province}
                    </span>
                  )}
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                    {customer.businessType}
                  </span>
                  {customer.featured && (
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      ⭐ Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              {customer.website && (
                <a
                  href={customer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <GlobeAltIcon className="h-4 w-4 mr-2" />
                  Visit Website
                </a>
              )}
              <Link href="/customers" className="btn-secondary">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Customers
              </Link>
            </div>
          </div>
        </div>
      </div>



      {/* Content */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Image Gallery */}
            {customer.images && customer.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative">
                  <Image
                    src={customer.images[currentImageIndex].url}
                    alt={customer.images[currentImageIndex].alt || `${customer.name} - Image ${currentImageIndex + 1}`}
                    width={800}
                    height={400}
                    className="w-full h-64 lg:h-96 object-cover"
                  />
                  {customer.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {customer.images.map((_, index) => (
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
                  {customer.images[currentImageIndex].caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                      <p className="text-sm">{customer.images[currentImageIndex].caption}</p>
                    </div>
                  )}
                </div>
                {customer.images.length > 1 && (
                  <div className="p-4 bg-gray-50 flex gap-2 overflow-x-auto">
                    {customer.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative flex-shrink-0 border-2 rounded-lg overflow-hidden transition-colors ${
                          index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={image.alt || `Thumbnail ${index + 1}`}
                          width={80}
                          height={60}
                          className="w-20 h-15 object-cover"
                        />
                        {image.isPrimary && (
                          <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
                            <StarIcon className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Company Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Company Overview</h2>
              
              {customer.description ? (
                <div className="mb-6">
                  <div 
                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: customer.description }}
                  />
                </div>
              ) : (
                <p className="text-gray-500 italic mb-6">No company description available.</p>
              )}

              {/* Industries */}
              {customer.industry && customer.industry.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    {customer.industry.map((industry, index: number) => (
                      <span
                        key={index}
                        className="inline-flex px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md border border-blue-200"
                      >
                        {industry.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Projects Section */}
            {customer.projects && customer.projects.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <BriefcaseIcon className="h-6 w-6 text-primary-600 mr-2" />
                  <h2 className="text-2xl font-semibold text-gray-900">Projects</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.projects.map((project, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                      {project.url ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 text-sm hover:underline"
                        >
                          View Project →
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">No URL available</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pump Models Used Section */}
            {customer.pumpModelsUsed && customer.pumpModelsUsed.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-secondary-600 mr-2" />
                  <h2 className="text-2xl font-semibold text-gray-900">Pump Models Used</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.pumpModelsUsed.map((model, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-secondary-200 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-2">{model.name}</h3>
                      {model.url ? (
                        <a
                          href={model.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary-600 hover:text-secondary-800 text-sm hover:underline"
                        >
                          View Model →
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">No URL available</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications Section */}
            {customer.applications && customer.applications.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <CpuChipIcon className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-2xl font-semibold text-gray-900">Applications</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.applications.map((application, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-200 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-2">{application.name}</h3>
                      {application.url ? (
                        <a
                          href={application.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 text-sm hover:underline"
                        >
                          View Application →
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">No URL available</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
              
              <div className="space-y-4">
                {customer.legalName && customer.legalName !== customer.name && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-1">Legal Name</span>
                    <span className="text-sm text-gray-900">{customer.legalName}</span>
                  </div>
                )}
                
                {customer.address && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-1">Address</span>
                    <span className="text-sm text-gray-900">{customer.address}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Nationality</span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {customer.nationality}
                  </span>
                </div>
                
                {customer.province && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Province</span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      {customer.province}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Business Type</span>
                  <span className="text-sm text-gray-900">{customer.businessType}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Featured</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.featured 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {customer.featured ? '⭐ Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Projects</span>
                  <span className="text-sm font-bold text-primary-600">
                    {customer.projects?.length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Pump Models</span>
                  <span className="text-sm font-bold text-secondary-600">
                    {customer.pumpModelsUsed?.length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Applications</span>
                  <span className="text-sm font-bold text-green-600">
                    {customer.applications?.length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Industries</span>
                  <span className="text-sm font-bold text-blue-600">
                    {customer.industry?.length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Company Images</span>
                  <span className="text-sm font-bold text-purple-600">
                    {customer.images?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

