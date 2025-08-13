'use client'

import { useState, useEffect } from 'react'
import { SUCCESS_MESSAGES, ERROR_MESSAGES, extractApiError } from '@/lib/utils'
import ProductForm from '@/components/admin/ProductForm'
import ProductList from '@/components/admin/ProductList'
import ProjectForm from '@/components/admin/ProjectForm'
import ProjectList from '@/components/admin/ProjectList'
import CustomerForm from '@/components/admin/CustomerForm'
import CustomerList from '@/components/admin/CustomerList'
import IndustryForm from '@/components/admin/IndustryForm'
import IndustryList from '@/components/admin/IndustryList'

import BrandForm from '@/components/admin/BrandForm'
import BrandList from '@/components/admin/BrandList'
import PumpTypeForm from '@/components/admin/PumpTypeForm'
import PumpTypeList from '@/components/admin/PumpTypeList'
import ApplicationForm from '@/components/admin/ApplicationForm'
import ApplicationList from '@/components/admin/ApplicationList'
import NotificationContainer from '@/components/NotificationContainer'
import ConfirmDialog from '@/components/ConfirmDialog'
import { IApplication, IApplicationInput } from '@/models/Application'
import { IProduct, IProductInput } from '@/models/Product'
import { ICustomer, ICustomerInput } from '@/models/Customer'
import { IIndustry, IIndustryInput } from '@/models/Industry'

import { IBrand, IBrandInput } from '@/models/Brand'
import { IPumpType, IPumpTypeInput } from '@/models/PumpType'
import { IProject } from '@/models/Project'

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

interface LoginCredentials {
  email: string
  password: string
}

export default function AdminPage() {
  const [products, setProducts] = useState<IProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false)
  const [customers, setCustomers] = useState<ICustomer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null)
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false)
  const [customerSubTab, setCustomerSubTab] = useState<'customers' | 'industries'>('customers')
  const [productSubTab, setProductSubTab] = useState<'products' | 'brands' | 'pump-types'>('products')

  const [brands, setBrands] = useState<IBrand[]>([])
  const [selectedBrand, setSelectedBrand] = useState<IBrand | null>(null)
  const [isBrandFormOpen, setIsBrandFormOpen] = useState(false)
  const [pumpTypes, setPumpTypes] = useState<IPumpType[]>([])
  const [selectedPumpType, setSelectedPumpType] = useState<IPumpType | null>(null)
  const [isPumpTypeFormOpen, setIsPumpTypeFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'projects' | 'customers' | 'applications'>('products')
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [loginError, setLoginError] = useState('')
  const [applications, setApplications] = useState<IApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<IApplication | null>(null)
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false)
  
  // Notification system
  const [showNotification, setShowNotification] = useState<((notification: { type: 'success' | 'error' | 'info'; message: string; duration?: number }) => void) | null>(null)
  
  // Confirmation dialogs for all entities
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'product' | 'project' | 'customer' | 'brand' | 'pumpType' | 'industry' | null
    entity: any
    entityName: string
  }>({
    isOpen: false,
    type: null,
    entity: null,
    entityName: ''
  })

  useEffect(() => {
    // Check if user is already authenticated (using localStorage)
    const authStatus = localStorage.getItem('adminAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      fetchProducts()
      fetchProjects()
      fetchCustomers()
      fetchIndustries()
  
      fetchBrands()
      fetchPumpTypes()
      fetchApplications()
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
  
      fetchBrands()
      fetchPumpTypes()
      fetchApplications()
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



  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/admin/brands')
      if (response.ok) {
        const brandsData = await response.json()
        setBrands(brandsData)
      } else {
        console.error('Failed to fetch brands')
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const fetchPumpTypes = async () => {
    try {
      const response = await fetch('/api/admin/pump-types')
      if (response.ok) {
        const pumpTypesData = await response.json()
        setPumpTypes(pumpTypesData)
      } else {
        console.error('Failed to fetch pump types')
      }
    } catch (error) {
      console.error('Error fetching pump types:', error)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications')
      if (response.ok) {
        const applicationsData = await response.json()
        setApplications(applicationsData)
      } else {
        console.error('Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  // Generic confirmation dialog handlers
  const showConfirmDialog = (type: typeof confirmDialog.type, entity: any, entityName: string) => {
    setConfirmDialog({
      isOpen: true,
      type,
      entity,
      entityName
    })
  }

  const handleConfirmAction = () => {
    const { type, entity } = confirmDialog
    
    switch (type) {
      case 'product':
        executeDeleteProduct(entity._id)
        break
      case 'project':
        executeDeleteProject(entity._id)
        break
      case 'customer':
        executeDeleteCustomer(entity._id)
        break

      case 'brand':
        executeDeleteBrand(entity._id)
        break
      case 'pumpType':
        executeDeletePumpType(entity._id)
        break
      case 'industry':
        executeDeleteIndustry(entity._id)
        break
    }
    
    setConfirmDialog({ isOpen: false, type: null, entity: null, entityName: '' })
  }

  const handleCancelAction = () => {
    setConfirmDialog({ isOpen: false, type: null, entity: null, entityName: '' })
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  const handleEditProduct = (product: IProduct) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p._id === productId)
    if (product) {
      showConfirmDialog('product', product, product.name)
    }
  }

  const executeDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setProducts(products.filter(product => product._id !== productId))
        showNotification?.({ type: 'success', message: 'Product deleted successfully!' })
      } else {
        const error = await response.json()
        showNotification?.({ type: 'error', message: `Error deleting product: ${error.error}` })
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      showNotification?.({ type: 'error', message: 'Error deleting product' })
    }
  }

  const handleSaveProduct = async (productData: IProductInput) => {
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
          showNotification?.({ type: 'success', message: 'Product updated successfully!' })
        } else {
          const error = await response.json()
          showNotification?.({ type: 'error', message: `Error updating product: ${error.error}` })
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
          showNotification?.({ type: 'success', message: 'Product added successfully!' })
        } else {
          const error = await response.json()
          showNotification?.({ type: 'error', message: `Error adding product: ${error.error}` })
        }
      }
      setIsFormOpen(false)
      setSelectedProduct(null)
          } catch (error) {
        console.error('Error saving product:', error)
        showNotification?.({ type: 'error', message: 'Error saving product' })
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
    const project = projects.find(p => p._id === projectId)
    if (project) {
      showConfirmDialog('project', project, project.title)
    }
  }

  const executeDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setProjects(projects.filter(project => project._id !== projectId))
        showNotification?.({ type: 'success', message: 'Project deleted successfully!' })
      } else {
        const error = await response.json()
        showNotification?.({ type: 'error', message: `Error deleting project: ${error.error}` })
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      showNotification?.({ type: 'error', message: 'Error deleting project' })
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
          showNotification?.({ type: 'success', message: 'Project updated successfully!' })
        } else {
          const error = await response.json()
          showNotification?.({ type: 'error', message: `Error updating project: ${error.error}` })
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
          showNotification?.({ type: 'success', message: 'Project added successfully!' })
        } else {
          const error = await response.json()
          showNotification?.({ type: 'error', message: `Error adding project: ${error.error}` })
        }
      }
      setIsProjectFormOpen(false)
      setSelectedProject(null)
    } catch (error) {
      console.error('Error saving project:', error)
      showNotification?.({ type: 'error', message: 'Error saving project' })
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
    const customer = customers.find(c => c._id === customerId)
    if (customer) {
      showConfirmDialog('customer', customer, customer.name)
    }
  }

  const executeDeleteCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setCustomers(customers.filter(customer => customer._id !== customerId))
    
    
        showNotification?.({ type: 'success', message: 'Customer deleted successfully!' })
      } else {
        const error = await response.json()
        showNotification?.({ type: 'error', message: `Error deleting customer: ${error.error}` })
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      showNotification?.({ type: 'error', message: 'Error deleting customer' })
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
      
      
          showNotification?.({ type: 'success', message: SUCCESS_MESSAGES.UPDATED('Customer') })
        } else {
          const error = await response.json()
          console.error('Customer update error:', error)
                      showNotification?.({ type: 'error', message: ERROR_MESSAGES.UPDATE_FAILED('Customer') + ': ' + extractApiError(error) })
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
      
      
          showNotification?.({ type: 'success', message: 'Customer added successfully!' })
        } else {
          const error = await response.json()
          console.error('Customer creation error:', error)
                      showNotification?.({ type: 'error', message: `Error adding customer: ${error.error || error.message || 'Unknown error'}` })
        }
      }
      setIsCustomerFormOpen(false)
      setSelectedCustomer(null)
    } catch (error) {
      console.error('Error saving customer:', error)
              showNotification?.({ type: 'error', message: 'Error saving customer' })
    }
  }



  // Brand management functions
  const handleAddBrand = () => {
    setSelectedBrand(null)
    setIsBrandFormOpen(true)
  }

  const handleEditBrand = (brand: IBrand) => {
    setSelectedBrand(brand)
    setIsBrandFormOpen(true)
  }

  const handleDeleteBrand = async (brandId: string) => {
    // BrandList component handles its own confirmation dialog
    await executeDeleteBrand(brandId)
  }

  const executeDeleteBrand = async (brandId: string) => {
    try {
      const response = await fetch(`/api/admin/brands?id=${brandId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        const result = await response.json()
        setBrands(brands.filter(b => b._id !== brandId))
        showNotification?.({ type: 'success', message: `Brand "${result.deletedBrand}" deleted successfully!` })
      } else {
        const error = await response.json()
        showNotification?.({ type: 'error', message: `Error deleting brand: ${error.error}` })
      }
    } catch (error) {
      console.error('Error deleting brand:', error)
      showNotification?.({ type: 'error', message: 'Error deleting brand' })
    }
  }

  const handleSaveBrand = async (brandData: IBrandInput) => {
    try {
      if (selectedBrand) {
        // Update existing brand
        const response = await fetch(`/api/admin/brands?id=${selectedBrand._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(brandData),
        })
        
        if (response.ok) {
          const updatedBrand = await response.json()
          setBrands(brands.map(b => 
            b._id === selectedBrand._id ? updatedBrand : b
          ))
          showNotification?.({ type: 'success', message: 'Brand updated successfully!' })
        } else {
          const error = await response.json()
          showNotification?.({ type: 'error', message: `Error updating brand: ${error.error}` })
        }
      } else {
        // Create new brand
        const response = await fetch('/api/admin/brands', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(brandData),
        })
        
        if (response.ok) {
          const newBrand = await response.json()
          setBrands([...brands, newBrand])
          showNotification?.({ type: 'success', message: 'Brand created successfully!' })
        } else {
          const error = await response.json()
          showNotification?.({ type: 'error', message: `Error creating brand: ${error.error}` })
        }
      }
      
      setIsBrandFormOpen(false)
      setSelectedBrand(null)
    } catch (error) {
      console.error('Error saving brand:', error)
      showNotification?.({ type: 'error', message: 'Error saving brand. Please try again.' })
    }
  }

  // PumpType management functions
  const handleAddPumpType = () => {
    setSelectedPumpType(null)
    setIsPumpTypeFormOpen(true)
  }

  const handleEditPumpType = (pumpType: IPumpType) => {
    setSelectedPumpType(pumpType)
    setIsPumpTypeFormOpen(true)
  }

  const handleDeletePumpType = async (pumpTypeId: string) => {
    // PumpTypeList component handles its own confirmation dialog
    await executeDeletePumpType(pumpTypeId)
  }

  const executeDeletePumpType = async (pumpTypeId: string) => {
    try {
      const response = await fetch(`/api/admin/pump-types?id=${pumpTypeId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        const result = await response.json()
        setPumpTypes(pumpTypes.filter(pt => pt._id !== pumpTypeId))
        showNotification?.({ type: 'success', message: `Pump type "${result.deletedPumpType}" deleted successfully!` })
      } else {
        const error = await response.json()
        showNotification?.({ type: 'error', message: `Error deleting pump type: ${error.error}` })
      }
    } catch (error) {
      console.error('Error deleting pump type:', error)
      showNotification?.({ type: 'error', message: 'Error deleting pump type' })
    }
  }

  const handleSavePumpType = async (pumpTypeData: IPumpTypeInput) => {
    try {
      if (selectedPumpType) {
        // Update existing pump type
        const response = await fetch(`/api/admin/pump-types?id=${selectedPumpType._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pumpTypeData),
        })
        
        if (response.ok) {
          const updatedPumpType = await response.json()
          setPumpTypes(pumpTypes.map(pt => 
            pt._id === selectedPumpType._id ? updatedPumpType : pt
          ))
          showNotification?.({ type: 'success', message: 'Pump type updated successfully!' })
        } else {
          const error = await response.json()
          showNotification?.({ type: 'error', message: `Error updating pump type: ${error.error}` })
        }
      } else {
        // Create new pump type
        const response = await fetch('/api/admin/pump-types', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pumpTypeData),
        })
        
        if (response.ok) {
          const newPumpType = await response.json()
          setPumpTypes([...pumpTypes, newPumpType])
          showNotification?.({ type: 'success', message: 'Pump type created successfully!' })
        } else {
          const error = await response.json()
          showNotification?.({ type: 'error', message: `Error creating pump type: ${error.error}` })
        }
      }
      
      setIsPumpTypeFormOpen(false)
      setSelectedPumpType(null)
    } catch (error) {
      console.error('Error saving pump type:', error)
      showNotification?.({ type: 'error', message: 'Error saving pump type. Please try again.' })
    }
  }

  // Industry management state
  const [industries, setIndustries] = useState<IIndustry[]>([])
  const [selectedIndustry, setSelectedIndustry] = useState<IIndustry | null>(null)
  const [isIndustryFormOpen, setIsIndustryFormOpen] = useState(false)

  // Fetch industries function
  const fetchIndustries = async () => {
    try {
      const response = await fetch('/api/industries?updateStats=true&includeCustomers=true&includeApplications=true')
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
    // IndustryList component handles its own confirmation dialog
    await executeDeleteIndustry(industryId)
  }

  const executeDeleteIndustry = async (industryId: string) => {
    try {
      const response = await fetch(`/api/industries/${industryId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchIndustries() // Refetch to get updated data
        showNotification?.({ type: 'success', message: 'Industry deleted successfully!' })
      } else {
        const error = await response.json()
        showNotification?.({ type: 'error', message: `Error deleting industry: ${error.error}` })
      }
    } catch (error) {
      console.error('Error deleting industry:', error)
      showNotification?.({ type: 'error', message: 'Error deleting industry' })
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
          showNotification?.({ type: 'success', message: 'Industry updated successfully!' })
        } else {
          const error = await response.json()
          showNotification?.({ type: 'error', message: `Error updating industry: ${error.error}` })
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
          showNotification?.({ type: 'success', message: 'Industry added successfully!' })
        } else {
          const error = await response.json()
          showNotification?.({ type: 'error', message: `Error adding industry: ${error.error}` })
        }
      }
      setIsIndustryFormOpen(false)
      setSelectedIndustry(null)
    } catch (error) {
      console.error('Error saving industry:', error)
      showNotification?.({ type: 'error', message: 'Error saving industry' })
    }
  }

  // Application management functions
  const handleAddApplication = () => {
    setSelectedApplication(null)
    setIsApplicationFormOpen(true)
  }

  const handleEditApplication = (application: IApplication) => {
    setSelectedApplication(application)
    setIsApplicationFormOpen(true)
  }

  const executeDeleteApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setApplications(applications.filter(application => application._id !== applicationId))
        showNotification?.({ type: 'success', message: 'Application deleted successfully!' })
      } else {
        const error = await response.json()
        showNotification?.({ type: 'error', message: `Error deleting application: ${error.error}` })
      }
    } catch (error) {
      console.error('Error deleting application:', error)
      showNotification?.({ type: 'error', message: 'Error deleting application' })
    }
  }

  const handleSaveApplication = async (applicationData: IApplicationInput) => {
    try {
      if (selectedApplication) {
        // Update existing application
        const response = await fetch(`/api/admin/applications/${selectedApplication._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(applicationData),
        })
        
        if (response.ok) {
          const updatedApplication = await response.json()
          const updatedApplications = applications.map(application =>
            application._id === selectedApplication._id ? updatedApplication : application
          )
          setApplications(updatedApplications)
          showNotification?.({ type: 'success', message: 'Application updated successfully!' })
        } else {
          const error = await response.json()
          showNotification?.({ type: 'error', message: `Error updating application: ${error.error}` })
        }
      } else {
        // Add new application
        const response = await fetch('/api/admin/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(applicationData),
        })
        
        if (response.ok) {
          const newApplication = await response.json()
          setApplications([...applications, newApplication])
          showNotification?.({ type: 'success', message: 'Application added successfully!' })
        } else {
          const error = await response.json()
          showNotification?.({ type: 'error', message: `Error adding application: ${error.error}` })
        }
      }
      setIsApplicationFormOpen(false)
      setSelectedApplication(null)
    } catch (error) {
      console.error('Error saving application:', error)
      showNotification?.({ type: 'error', message: 'Error saving application' })
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
              {activeTab === 'products' && productSubTab === 'products' && (
                <button
                  onClick={handleAddProduct}
                  className="btn-primary"
                >
                  Add New Product
                </button>
              )}
              {activeTab === 'products' && productSubTab === 'brands' && (
                <button
                  onClick={handleAddBrand}
                  className="btn-primary"
                >
                  Add New Brand
                </button>
              )}
              {activeTab === 'products' && productSubTab === 'pump-types' && (
                <button
                  onClick={handleAddPumpType}
                  className="btn-primary"
                >
                  Add New Pump Type
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

              {activeTab === 'customers' && customerSubTab === 'industries' && (
                <button
                  onClick={handleAddIndustry}
                  className="btn-primary"
                >
                  Add New Industry
                </button>
              )}
              {activeTab === 'applications' && (
                <button
                  onClick={handleAddApplication}
                  className="btn-primary"
                >
                  Add New Application
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
                onClick={() => setActiveTab('applications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Applications ({applications.length})
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
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Management</h2>
                  
                  {/* Product Sub-tabs */}
                  <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setProductSubTab('products')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          productSubTab === 'products'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Products ({products.length})
                      </button>
                      <button
                        onClick={() => setProductSubTab('brands')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          productSubTab === 'brands'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Brands ({brands.length})
                      </button>
                      <button
                        onClick={() => setProductSubTab('pump-types')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          productSubTab === 'pump-types'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Pump Types ({pumpTypes.length})
                      </button>
                    </nav>
                  </div>
                </div>

                {productSubTab === 'products' && (
                <ProductList
                  products={products}
                  onEdit={handleEditProduct}
                  onDelete={executeDeleteProduct}
                />
                )}

                {productSubTab === 'brands' && (
                  <BrandList
                    brands={brands}
                    onEdit={handleEditBrand}
                    onDelete={executeDeleteBrand}
                  />
                )}

                {productSubTab === 'pump-types' && (
                  <PumpTypeList
                    pumpTypes={pumpTypes}
                    onEdit={handleEditPumpType}
                    onDelete={executeDeletePumpType}
                  />
                )}
              </>
            )}
            {activeTab === 'projects' && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Projects ({projects.length})</h2>
                <ProjectList
                  projects={projects}
                  onEdit={handleEditProject}
                  onDelete={executeDeleteProject}
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
                        onClick={() => setCustomerSubTab('industries')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          customerSubTab === 'industries'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Industries ({industries.length})
                      </button>
                    </nav>
                  </div>
                </div>

                {customerSubTab === 'customers' && (
                  <CustomerList
                    customers={customers}
                    onEdit={handleEditCustomer}
                    onDelete={executeDeleteCustomer}
                  />
                )}



                {customerSubTab === 'industries' && (
                  <IndustryList
                    industries={industries as any[]}
                    onEdit={handleEditIndustry as any}
                    onDelete={executeDeleteIndustry}
                    onCreate={handleAddIndustry}
                  />
                )}
              </>
            )}
            {activeTab === 'applications' && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Applications ({applications.length})</h2>
                <ApplicationList
                  applications={applications}
                  onEdit={handleEditApplication}
                  onDelete={executeDeleteApplication}
                  onCreate={handleAddApplication}
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
          onShowNotification={(type, message) => showNotification?.({ type, message })}
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
          onShowNotification={(type, message) => showNotification?.({ type, message })}
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
          onShowNotification={(type, message) => showNotification?.({ type, message })}
        />
      )}



      {isBrandFormOpen && (
        <BrandForm
          brand={selectedBrand}
          onSave={handleSaveBrand}
          onCancel={() => {
            setIsBrandFormOpen(false)
            setSelectedBrand(null)
          }}
          onShowNotification={(type, message) => showNotification?.({ type, message })}
        />
      )}

      {isPumpTypeFormOpen && (
        <PumpTypeForm
          pumpType={selectedPumpType}
          onSave={handleSavePumpType}
          onCancel={() => {
            setIsPumpTypeFormOpen(false)
            setSelectedPumpType(null)
          }}
          onShowNotification={(type, message) => showNotification?.({ type, message })}
        />
      )}

      {isApplicationFormOpen && (
        <ApplicationForm
          application={selectedApplication}
          onSave={handleSaveApplication}
          onCancel={() => {
            setIsApplicationFormOpen(false)
            setSelectedApplication(null)
          }}
          onShowNotification={(type, message) => showNotification?.({ type, message })}
        />
      )}
      
      {/* Notification Container */}
      <NotificationContainer
        onNotificationAdd={(addNotification) => setShowNotification(() => addNotification)}
      />
      
      {/* Global Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={`Delete ${confirmDialog.type ? confirmDialog.type.charAt(0).toUpperCase() + confirmDialog.type.slice(1) : 'Item'}`}
        message={`Are you sure you want to delete "${confirmDialog.entityName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        danger={true}
      />
    </div>
  )
}