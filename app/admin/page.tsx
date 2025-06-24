'use client'

import { useState, useEffect } from 'react'
import ProductForm from '@/components/admin/ProductForm'
import ProductList from '@/components/admin/ProductList'
import ProjectForm from '@/components/admin/ProjectForm'
import ProjectList from '@/components/admin/ProjectList'
import { Product, ProductInput } from '@/models/Product'

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
  const [activeTab, setActiveTab] = useState<'products' | 'projects'>('products')
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
              {activeTab === 'products' ? (
                <button
                  onClick={handleAddProduct}
                  className="btn-primary"
                >
                  Add New Product
                </button>
              ) : (
                <button
                  onClick={handleAddProject}
                  className="btn-primary"
                >
                  Add New Project
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
            </nav>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {activeTab === 'products' ? (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Products ({products.length})</h2>
                <ProductList
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Projects ({projects.length})</h2>
                <ProjectList
                  projects={projects}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                />
              </>
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
    </div>
  )
} 