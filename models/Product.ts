import { Schema, model, models } from 'mongoose'

export interface IProduct {
  _id: string
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

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Product slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Slug cannot exceed 100 characters'],
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['rotary-vane', 'scroll', 'diaphragm', 'turbomolecular', 'other']
  },
  specifications: {
    flowRate: {
      type: String,
      required: [true, 'Flow rate is required'],
      trim: true
    },
    vacuumLevel: {
      type: String,
      required: [true, 'Vacuum level is required'],
      trim: true
    },
    power: {
      type: String,
      required: [true, 'Power is required'],
      trim: true
    },
    inletSize: {
      type: String,
      required: [true, 'Inlet size is required'],
      trim: true
    },
    weight: {
      type: String,
      required: [true, 'Weight is required'],
      trim: true
    }
  },
  features: [{
    type: String,
    trim: true
  }],
  applications: [{
    type: String,
    trim: true
  }],
  image: {
    type: String,
    required: [true, 'Product image is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  inStock: {
    type: Boolean,
    required: [true, 'Stock status is required'],
    default: true
  }
}, {
  timestamps: true
})

// Indexes for better query performance
ProductSchema.index({ category: 1 })
ProductSchema.index({ inStock: 1 })
ProductSchema.index({ name: 'text', description: 'text' })

// Add compound indexes for common e-commerce query patterns
ProductSchema.index({ category: 1, inStock: 1 }) // Available products by category
ProductSchema.index({ inStock: 1, price: 1 }) // Available products by price range
ProductSchema.index({ category: 1, price: 1 }) // Category products by price

// Sparse index for optional price field (only indexes documents that have a price)
ProductSchema.index({ price: 1 }, { sparse: true })

// Input interface for creating/updating products
export interface IProductInput {
  name: string
  slug: string
  description: string
  category: IProduct['category']
  specifications: IProduct['specifications']
  features: string[]
  applications: string[]
  image: string
  price?: number
  inStock?: boolean
}

// Keep old interfaces for backward compatibility
export interface Product extends IProduct {}
export interface ProductInput extends IProductInput {}

export default models.Product || model<IProduct>('Product', ProductSchema) 