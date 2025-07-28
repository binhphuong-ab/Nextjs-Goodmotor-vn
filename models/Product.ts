import { Schema, model, models, Types } from 'mongoose'

export interface IProduct {
  _id: string
  name: string
  slug: string // URL-friendly identifier (e.g., "rotary-vane-pump-rv-2000")
  description?: string
  brand?: Types.ObjectId // Optional reference to Brand _id
  productLineId?: string // Optional reference to specific product line within brand
  pumpType?: Types.ObjectId // Optional reference to PumpType _id
  specifications: {
    flowRate?: string // CFM
    vacuumLevel?: string // torr or mbar
    power?: string // HP or kW
    inletSize?: string // inches
    weight?: string // lbs or kg
  }
  features: string[]
  applications: string[]
  image: string
  price?: number
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
    required: false,
    trim: true
  },
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: false
  },
  productLineId: {
    type: String,
    required: false
  },
  pumpType: {
    type: Schema.Types.ObjectId,
    ref: 'PumpType',
    required: false
  },
  specifications: {
    flowRate: {
      type: String,
      required: false,
      trim: true
    },
    vacuumLevel: {
      type: String,
      required: false,
      trim: true
    },
    power: {
      type: String,
      required: false,
      trim: true
    },
    inletSize: {
      type: String,
      required: false,
      trim: true
    },
    weight: {
      type: String,
      required: false,
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
  }
}, {
  timestamps: true
})

// Indexes for better query performance
ProductSchema.index({ pumpType: 1 })
ProductSchema.index({ brand: 1 })
ProductSchema.index({ productLineId: 1 })
ProductSchema.index({ name: 'text', description: 'text' })

// Add compound indexes for common e-commerce query patterns
ProductSchema.index({ pumpType: 1, price: 1 }) // Pump type products by price
ProductSchema.index({ brand: 1, pumpType: 1 }) // Products by brand and pump type
ProductSchema.index({ brand: 1, productLineId: 1 }) // Products by brand and product line

// Sparse index for optional fields (only indexes documents that have the field)
ProductSchema.index({ price: 1 }, { sparse: true })
ProductSchema.index({ brand: 1 }, { sparse: true })
ProductSchema.index({ productLineId: 1 }, { sparse: true })
ProductSchema.index({ pumpType: 1 }, { sparse: true })

// Input interface for creating/updating products
export interface IProductInput {
  name: string
  slug: string
  description?: string
  brand?: string // Brand ID as string
  productLineId?: string // Product line ID as string
  pumpType?: string // PumpType ID as string
  specifications: IProduct['specifications']
  features: string[]
  applications: string[]
  image: string
  price?: number
}

// Keep old interfaces for backward compatibility
export interface Product extends IProduct {}
export interface ProductInput extends IProductInput {}

export default models.Product || model<IProduct>('Product', ProductSchema) 