export interface Product {
  _id?: string
  name: string
  slug: string // URL-friendly identifier (e.g., "rotary-vane-pump-rv-2000")
  description: string
  category: 'rotary-vane' | 'scroll' | 'diaphragm' | 'turbomolecular' | 'other'
  specifications: {
    flowRate: string // CFM
    vacuumLevel: string // torr or mbar
    power: string // HP or kW
    inletSize: string // inches
    weight: string // lbs or kg
  }
  features: string[]
  applications: string[]
  image: string
  price?: number
  inStock: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductInput {
  name: string
  slug: string
  description: string
  category: Product['category']
  specifications: Product['specifications']
  features: string[]
  applications: string[]
  image: string
  price?: number
  inStock: boolean
} 