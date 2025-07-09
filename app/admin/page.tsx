'use client'

import { useState, useEffect } from 'react'
import ProductForm from '@/components/admin/ProductForm'
import ProductList from '@/components/admin/ProductList'
import ProjectForm from '@/components/admin/ProjectForm'
import ProjectList from '@/components/admin/ProjectList'
import CustomerForm from '@/components/admin/CustomerForm'
import CustomerList from '@/components/admin/CustomerList'
import IndustryForm from '@/components/admin/IndustryForm'
import IndustryList from '@/components/admin/IndustryList'
import BusinessTypeForm from '@/components/admin/BusinessTypeForm'
import BusinessTypeList from '@/components/admin/BusinessTypeList'
import { Product, ProductInput } from '@/models/Product'
import { ICustomer, ICustomerInput } from '@/models/Customer'
import { IIndustry, IIndustryInput } from '@/models/Industry'
import { IBusinessType, IBusinessTypeInput } from '@/models/BusinessType'

interface Project {
  _id: string
  title: string
  slug: string
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
  createdAt: string
  updatedAt: string
}

interface LoginCredentials {
  email: string
  password: string
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false)
  const [customers, setCustomers] = useState<ICustomer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null)
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false)
  const [customerSubTab, setCustomerSubTab] = useState<'customers' | 'business-types'>('customers')
  const [businessTypes, setBusinessTypes] = useState<any[]>([])
  const [selectedBusinessType, setSelectedBusinessType] = useState<IBusinessType | null>(null)
  const [isBusinessTypeFormOpen, setIsBusinessTypeFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'projects' | 'customers' | 'industries'>('products')
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    // Check if user is already authenticated (using localStorage)
    const authStatus = localStorage.getItem('adminAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      fetchProducts()
      fetchProjects()
      fetchCustomers()
      fetchIndustries()
      fetchBusinessTypes()
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    
    // Hardcoded credentials check
    if (loginData.email === 'goodmotor.vn@gmail.com' && loginData.password === 'minato123') {
      setIsAuthenticated(true)
      localStorage.setItem('adminAuthenticated', 'true')
      fetchProducts()
      fetchProjects()
      fetchCustomers()
      fetchIndustries()
      fetchBusinessTypes()
    } else {
      setLoginError('Invalid email or password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('adminAuthenticated')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData({
      ...loginData,
      [name]: value
    })
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const productsData = await response.json()
        setProducts(productsData)
      } else {
        console.error('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects')
      if (response.ok) {
        const projectsData = await response.json()
        setProjects(projectsData)
      } else {
        console.error('Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers')
      if (response.ok) {
        const customersData = await response.json()
        setCustomers(customersData)
      } else {
        console.error('Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchBusinessTypes = async () => {
    try {
      const response = await fetch('/api/admin/business-types')
      if (response.ok) {
        const businessTypesData = await response.json()
        setBusinessTypes(businessTypesData)
      } else {
        console.error('Failed to fetch business types')
      }
    } catch (error) {
      console.error('Error fetching business types:', error)
    }
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setProducts(products.filter(product => product._id !== productId))
          alert('Product deleted successfully!')
        } else {
          const error = await response.json()
          alert(`Error deleting product: ${error.error}`)
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Error deleting product')
      }
    }
  }

  const handleSaveProduct = async (productData: ProductInput) => {
    try {
      if (selectedProduct) {
        // Update existing product
        const response = await fetch(`/api/admin/products/${selectedProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })
        
        if (response.ok) {
          const updatedProduct = await response.json()
          const updatedProducts = products.map(product =>
            product._id === selectedProduct._id ? updatedProduct : product
          )
          setProducts(updatedProducts)
          alert('Product updated successfully!')
        } else {
          const error = await response.json()
          alert(`Error updating product: ${error.error}`)
        }
      } else {
        // Add new product
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })
        
        if (response.ok) {
          const newProduct = await response.json()
          setProducts([...products, newProduct])
          alert('Product added successfully!')
        } else {
          const error = await response.json()
          alert(`Error adding product: ${error.error}`)
        }
      }
      setIsFormOpen(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product')
    }
  }

  // Project management functions
  const handleAddProject = () => {
    setSelectedProject(null)
    setIsProjectFormOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setIsProjectFormOpen(true)
  }

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`/api/admin/projects/${projectId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setProjects(projects.filter(project => project._id !== projectId))
          alert('Project deleted successfully!')
        } else {
          const error = await response.json()
          alert(`Error deleting project: ${error.error}`)
        }
      } catch (error) {
        console.error('Error deleting project:', error)
        alert('Error deleting project')
      }
    }
  }

  const handleSaveProject = async (projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedProject) {
        // Update existing project
        const response = await fetch(`/api/admin/projects/${selectedProject._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        })
        
        if (response.ok) {
          const updatedProject = await response.json()
          const updatedProjects = projects.map(project =>
            project._id === selectedProject._id ? updatedProject : project
          )
          setProjects(updatedProjects)
          alert('Project updated successfully!')
        } else {
          const error = await response.json()
          alert(`Error updating project: ${error.error}`)
        }
      } else {
        // Add new project
        const response = await fetch('/api/admin/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        })
        
        if (response.ok) {
          const newProject = await response.json()
          setProjects([...projects, newProject])
          alert('Project added successfully!')
        } else {
          const error = await response.json()
          alert(`Error adding project: ${error.error}`)
        }
      }
      setIsProjectFormOpen(false)
      setSelectedProject(null)
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Error saving project')
    }
  }

  // Customer management functions
  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    setIsCustomerFormOpen(true)
  }

  const handleEditCustomer = (customer: ICustomer) => {
    setSelectedCustomer(customer)
    setIsCustomerFormOpen(true)
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`/api/admin/customers/${customerId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setCustomers(customers.filter(customer => customer._id !== customerId))
          // Refresh business types to update customer counts
          fetchBusinessTypes()
          alert('Customer deleted successfully!')
        } else {
          const error = await response.json()
          alert(`Error deleting customer: ${error.error}`)
        }
      } catch (error) {
        console.error('Error deleting customer:', error)
        alert('Error deleting customer')
      }
    }
  }

  const handleSaveCustomer = async (customerData: ICustomerInput) => {
    try {
      console.log('Saving customer data:', customerData)
      if (selectedCustomer) {
        // Update existing customer
        const response = await fetch(`/api/admin/customers/${selectedCustomer._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        })
        
        if (response.ok) {
          const updatedCustomer = await response.json()
          const updatedCustomers = customers.map(customer =>
            customer._id === selectedCustomer._id ? updatedCustomer : customer
          )
          setCustomers(updatedCustomers)
          // Refresh business types to update customer counts
          fetchBusinessTypes()
          alert('Customer updated successfully!')
        } else {
          const error = await response.json()
          console.error('Customer update error:', error)
          alert(`Error updating customer: ${error.error || error.message || 'Unknown error'}`)
        }
      } else {
        // Add new customer
        const response = await fetch('/api/admin/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        })
        
        if (response.ok) {
          const newCustomer = await response.json()
          setCustomers([...customers, newCustomer])
          // Refresh business types to update customer counts
          fetchBusinessTypes()
          alert('Customer added successfully!')
        } else {
          const error = await response.json()
          console.error('Customer creation error:', error)
          alert(`Error adding customer: ${error.error || error.message || 'Unknown error'}`)
        }
      }
      setIsCustomerFormOpen(false)
      setSelectedCustomer(null)
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Error saving customer')
    }
  }

  // BusinessType management functions
  const handleAddBusinessType = () => {
    setSelectedBusinessType(null)
    setIsBusinessTypeFormOpen(true)
  }

  const handleEditBusinessType = (businessType: IBusinessType) => {
    setSelectedBusinessType(businessType)
    setIsBusinessTypeFormOpen(true)
  }

  const handleDeleteBusinessType = async (businessTypeId: string) => {
    try {
      const response = await fetch(`/api/admin/business-types?id=${businessTypeId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        const result = await response.json()
        setBusinessTypes(businessTypes.filter(bt => bt._id !== businessTypeId))
        alert(`Business type "${result.deletedBusinessType}" deleted successfully!`)
      } else {
        const error = await response.json()
        if (response.status === 409) {
          // Customer reference conflict
          alert(`${error.error}`)
        } else {
          alert(`Error deleting business type: ${error.error}`)
        }
      }
    } catch (error) {
      console.error('Error deleting business type:', error)
      alert('Error deleting business type. Please try again.')
    }
  }

  const handleSaveBusinessType = async (businessTypeData: IBusinessTypeInput) => {
    try {
      if (selectedBusinessType) {
        // Update existing business type
        const response = await fetch('/api/admin/business-types', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ _id: selectedBusinessType._id, ...businessTypeData }),
        })
        
        if (response.ok) {
          const updatedBusinessType = await response.json()
          setBusinessTypes(businessTypes.map(bt => 
            bt._id === selectedBusinessType._id ? updatedBusinessType : bt
          ))
          alert('Business type updated successfully!')
        } else {
          const error = await response.json()
          alert(`Error updating business type: ${error.error}`)
        }
      } else {
        // Create new business type
        const response = await fetch('/api/admin/business-types', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(businessTypeData),
        })
        
        if (response.ok) {
          const newBusinessType = await response.json()
          setBusinessTypes([...businessTypes, newBusinessType])
          alert('Business type created successfully!')
        } else {
          const error = await response.json()
          alert(`Error creating business type: ${error.error}`)
        }
      }
      
      setIsBusinessTypeFormOpen(false)
      setSelectedBusinessType(null)
    } catch (error) {
      console.error('Error saving business type:', error)
      alert('Error saving business type')
    }
  }

  // Industry management state
  const [industries, setIndustries] = useState<IIndustry[]>([])
  const [selectedIndustry, setSelectedIndustry] = useState<IIndustry | null>(null)
  const [isIndustryFormOpen, setIsIndustryFormOpen] = useState(false)

  // Fetch industries function
  const fetchIndustries = async () => {
    try {
      const response = await fetch('/api/industries?updateStats=true&includeCustomers=true')
      if (response.ok) {
        const industriesData = await response.json()
        setIndustries(industriesData)
      } else {
        console.error('Failed to fetch industries')
      }
    } catch (error) {
      console.error('Error fetching industries:', error)
    }
  }

  // Industry management functions
  const handleAddIndustry = () => {
    setSelectedIndustry(null)
    setIsIndustryFormOpen(true)
  }

  const handleEditIndustry = (industry: IIndustry) => {
    setSelectedIndustry(industry)
    setIsIndustryFormOpen(true)
  }

  const handleDeleteIndustry = async (industryId: string) => {
    if (window.confirm('Are you sure you want to delete this industry?')) {
      try {
        const response = await fetch(`/api/industries/${industryId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          await fetchIndustries() // Refetch to get updated data
          alert('Industry deleted successfully!')
        } else {
          const error = await response.json()
          alert(`Error deleting industry: ${error.error}`)
        }
      } catch (error) {
        console.error('Error deleting industry:', error)
        alert('Error deleting industry')
      }
    }
  }

  const handleSaveIndustry = async (industryData: IIndustryInput) => {
    try {
      if (selectedIndustry) {
        // Update existing industry
        const response = await fetch(`/api/industries/${selectedIndustry._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(industryData),
        })
        
        if (response.ok) {
          await fetchIndustries() // Refetch to get updated customer data
          alert('Industry updated successfully!')
        } else {
          const error = await response.json()
          alert(`Error updating industry: ${error.error}`)
        }
      } else {
        // Add new industry
        const response = await fetch('/api/industries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(industryData),
        })
        
        if (response.ok) {
          await fetchIndustries() // Refetch to get updated customer data
          alert('Industry added successfully!')
        } else {
          const error = await response.json()
          alert(`Error adding industry: ${error.error}`)
        }
      }
      setIsIndustryFormOpen(false)
      setSelectedIndustry(null)
    } catch (error) {
      console.error('Error saving industry:', error)
      alert('Error saving industry')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading admin dashboard...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          
          {loginError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container-custom py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Good Motor Admin</h1>
              <p className="text-gray-600 mt-1">Manage your vacuum pump products and projects</p>
            </div>
            <div className="flex items-center space-x-4">
              {activeTab === 'products' && (
                <button
                  onClick={handleAddProduct}
                  className="btn-primary"
                >
                  Add New Product
                </button>
              )}
              {activeTab === 'projects' && (
                <button
                  onClick={handleAddProject}
                  className="btn-primary"
                >
                  Add New Project
                </button>
              )}
              {activeTab === 'customers' && customerSubTab === 'customers' && (
                <button
                  onClick={handleAddCustomer}
                  className="btn-primary"
                >
                  Add New Customer
                </button>
              )}
              {activeTab === 'customers' && customerSubTab === 'business-types' && (
                <button
                  onClick={handleAddBusinessType}
                  className="btn-primary"
                >
                  Add New Business Type
                </button>
              )}
              {activeTab === 'industries' && (
                <button
                  onClick={handleAddIndustry}
                  className="btn-primary"
                >
                  Add New Industry
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'projects'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Projects ({projects.length})
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'customers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Customers ({customers.length})
              </button>
              <button
                onClick={() => setActiveTab('industries')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'industries'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Industries ({industries.length})
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {activeTab === 'products' && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Products ({products.length})</h2>
                <ProductList
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </>
            )}
            {activeTab === 'projects' && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Projects ({projects.length})</h2>
                <ProjectList
                  projects={projects}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                />
              </>
            )}
            {activeTab === 'customers' && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Management</h2>
                  
                  {/* Customer Sub-tabs */}
                  <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setCustomerSubTab('customers')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          customerSubTab === 'customers'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Customers ({customers.length})
                      </button>
                      <button
                        onClick={() => setCustomerSubTab('business-types')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          customerSubTab === 'business-types'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Business Types ({businessTypes.length})
                      </button>
                    </nav>
                  </div>
                </div>

                {customerSubTab === 'customers' && (
                  <CustomerList
                    customers={customers}
                    onEdit={handleEditCustomer}
                    onDelete={handleDeleteCustomer}
                  />
                )}

                {customerSubTab === 'business-types' && (
                  <BusinessTypeList
                    businessTypes={businessTypes}
                    onEdit={handleEditBusinessType}
                    onDelete={handleDeleteBusinessType}
                  />
                )}
              </>
            )}
            {activeTab === 'industries' && (
              <IndustryList
                industries={industries as any[]}
                onEdit={handleEditIndustry as any}
                onDelete={handleDeleteIndustry}
                onCreate={handleAddIndustry}
              />
            )}
          </div>
        </div>
      </div>

      {isFormOpen && (
        <ProductForm
          product={selectedProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setIsFormOpen(false)
            setSelectedProduct(null)
          }}
        />
      )}

      {isProjectFormOpen && (
        <ProjectForm
          project={selectedProject}
          onSave={handleSaveProject}
          onCancel={() => {
            setIsProjectFormOpen(false)
            setSelectedProject(null)
          }}
        />
      )}

      {isCustomerFormOpen && (
        <CustomerForm
          customer={selectedCustomer}
          onSave={handleSaveCustomer}
          onCancel={() => {
            setIsCustomerFormOpen(false)
            setSelectedCustomer(null)
          }}
        />
      )}

      {isIndustryFormOpen && (
        <IndustryForm
          industry={selectedIndustry as any}
          onSubmit={handleSaveIndustry as any}
          onCancel={() => {
            setIsIndustryFormOpen(false)
            setSelectedIndustry(null)
          }}
        />
      )}

      {isBusinessTypeFormOpen && (
        <BusinessTypeForm
          businessType={selectedBusinessType}
          onSave={handleSaveBusinessType}
          onCancel={() => {
            setIsBusinessTypeFormOpen(false)
            setSelectedBusinessType(null)
          }}
        />
      )}
    </div>
  )
}