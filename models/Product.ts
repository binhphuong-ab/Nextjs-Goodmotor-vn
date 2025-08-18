import { Schema, model, models, Types } from 'mongoose'

export interface IProduct {
  _id: string
  name: string
  slug: string // URL-friendly identifier (e.g., "rotary-vane-pump-rv-2000")
  description?: string
  brand?: Types.ObjectId // Optional reference to Brand _id
  productLineId?: string // Optional reference to specific product line within brand
  pumpType?: Types.ObjectId // Optional reference to PumpType _id
  subPumpType?: Types.ObjectId // Optional reference to specific sub pump type _id
  specifications: {
    flowRate?: string // CFM
    vacuumLevel?: string // torr or mbar
    power?: string // <400W, 400W, 550W, 0.75Kw, 1.1Kw, 1.5kw, 2.2Kw, 3Kw, 3.7Kw, 5.5Kw, 7.5Kw, 9Kw, 11Kw, 15Kw, 22Kw, >22Kw
    inletSize?: string // inches
    weight?: string // lbs or kg
    country?: string // Germany, Japan, Korea, United States, UK, France, China, Vietnam, Other
    equipment?: string // Bơm chân không, Phụ tùng bơm, Thiết bị chân không
    status?: string // Hàng mới 100%, Hàng cũ
  }
  features: string[]
  repairParts: Array<{
    name: string
    image?: string
    url?: string
  }>
  applications: Array<{
    name: string
    url?: string
  }>
  images: Array<{
    url: string
    alt?: string
    caption?: string
    isPrimary?: boolean
  }>
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
  subPumpType: {
    type: Schema.Types.ObjectId,
    required: false,
    validate: {
      validator: function(v: Types.ObjectId) {
        if (!v) return true // subPumpType is optional
        return Types.ObjectId.isValid(v)
      },
      message: 'Please provide a valid sub pump type ID'
    }
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
      trim: true,
      enum: ['<400W', '400W', '550W', '0.75Kw', '1.1Kw', '1.5kw', '2.2Kw', '3Kw', '3.7Kw', '5.5Kw', '7.5Kw', '9Kw', '11Kw', '15Kw', '22Kw', '>22Kw']
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
    },
    country: {
      type: String,
      required: false,
      trim: true,
      enum: ['Germany', 'Japan', 'Korea', 'United States', 'UK', 'France', 'China', 'Vietnam', 'Other']
    },
    equipment: {
      type: String,
      required: false,
      trim: true,
      enum: ['Bơm chân không', 'Phụ tùng bơm', 'Thiết bị chân không'],
      default: 'Bơm chân không'
    },
    status: {
      type: String,
      required: false,
      trim: true,
      enum: ['Hàng mới 100%', 'Hàng cũ'],
      default: 'Hàng cũ'
    }
  },
  features: [{
    type: String,
    trim: true
  }],
  repairParts: [{
    name: {
      type: String,
      required: [true, 'Repair part name is required'],
      trim: true
    },
    image: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true // image is optional
          // Allow both full URLs (http/https) and relative paths starting with /
          // Must end with valid image extensions
          return /^(https?:\/\/.+|\/[\w\-\/\.]+)\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v);
        },
        message: 'Please provide a valid image URL or path (relative paths must start with / and end with .jpg, .jpeg, .png, .gif, .webp, or .svg)'
      }
    },
    url: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true // url is optional
          // Allow both full URLs (http/https) and relative/absolute paths
          return /^(https?:\/\/.+|\/[\w\-\/\.]+|[\w\-\/\.]+)$/.test(v);
        },
        message: 'Please provide a valid URL (http://... or https://...) or path (relative or absolute)'
      }
    }
  }],
  applications: [{
    name: {
      type: String,
      required: [true, 'Application name is required'],
      trim: true
    },
    url: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true // url is optional
          // Allow both full URLs (http/https) and relative/absolute paths
          return /^(https?:\/\/.+|\/[\w\-\/\.]+|[\w\-\/\.]+)$/.test(v);
        },
        message: 'Please provide a valid URL (http://... or https://...) or path (relative or absolute)'
      }
    }
  }],
  images: [{
    url: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          // Allow both full URLs (http/https) and relative paths starting with /
          // Must end with valid image extensions
          return /^(https?:\/\/.+|\/[\w\-\/\.]+)\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v);
        },
        message: 'Please provide a valid image URL or path (relative paths must start with / and end with .jpg, .jpeg, .png, .gif, .webp, or .svg)'
      }
    },
    alt: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  price: {
    type: Number,
    min: [0, 'Price cannot be negative']
  }
}, {
  timestamps: true
})

// Indexes for better query performance
// Note: Removed duplicate basic indexes for optional fields - using sparse indexes instead
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
ProductSchema.index({ subPumpType: 1 }, { sparse: true })

// Input interface for creating/updating products
export interface IProductInput {
  name: string
  slug: string
  description?: string
  brand?: string // Brand ID as string
  productLineId?: string // Product line ID as string
  pumpType?: string // PumpType ID as string
  subPumpType?: string // Sub pump type ID as string
  specifications: IProduct['specifications']
  features: string[]
  repairParts: Array<{
    name: string
    image?: string
    url?: string
  }>
  applications: Array<{
    name: string
    url?: string
  }>
  images: Array<{
    url: string
    alt?: string
    caption?: string
    isPrimary?: boolean
  }>
  price?: number
}

export default models.Product || model<IProduct>('Product', ProductSchema) 