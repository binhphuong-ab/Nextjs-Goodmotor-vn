import { Schema, model, models } from 'mongoose'

export interface IProductLine {
  _id?: string
  name: string
  description?: string
  isActive: boolean
  displayOrder: number
}

export interface IBrand {
  _id: string
  name: string
  country?: string
  yearEstablished?: number
  revenue?: string // Optional since not all brands may disclose revenue
  description?: string
  productLines: IProductLine[] // Array of product lines/groups
  productLineUsage?: Record<string, string[]> // Map of productLineId -> array of product names
  productUsage?: string[] // Array of product names using this brand
  createdAt: Date
  updatedAt: Date
}

const ProductLineSchema = new Schema<IProductLine>({
  name: {
    type: String,
    required: [true, 'Product line name is required'],
    trim: true,
    maxlength: [100, 'Product line name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Product line description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  _id: true // Allow MongoDB to generate _id for each product line
})

const BrandSchema = new Schema<IBrand>({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  country: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters']
  },
  yearEstablished: {
    type: Number,
    required: false,
    min: [1800, 'Year established cannot be before 1800'],
    max: [new Date().getFullYear(), 'Year established cannot be in the future'],
    validate: {
      validator: function(value: number) {
        return value === undefined || Number.isInteger(value);
      },
      message: 'Year established must be a valid integer'
    }
  },
  revenue: {
    type: String,
    trim: true,
    maxlength: [200, 'Revenue description cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  productLines: [ProductLineSchema] // Embedded array of product lines
}, {
  timestamps: true
})

// Indexes for better query performance
// Note: name index automatically created by unique: true
BrandSchema.index({ country: 1 })
BrandSchema.index({ yearEstablished: 1 })
BrandSchema.index({ name: 'text', description: 'text' }) // Text search on name and description
BrandSchema.index({ 'productLines.name': 1 }) // Index for product line names

// Methods to manage product lines
BrandSchema.methods.addProductLine = function(productLineData: Omit<IProductLine, '_id'>) {
  this.productLines.push(productLineData)
  return this.save()
}

BrandSchema.methods.updateProductLine = function(productLineId: string, updateData: Partial<IProductLine>) {
  const productLine = this.productLines.id(productLineId)
  if (productLine) {
    Object.assign(productLine, updateData)
    return this.save()
  }
  throw new Error('Product line not found')
}

BrandSchema.methods.removeProductLine = function(productLineId: string) {
  this.productLines.pull(productLineId)
  return this.save()
}

BrandSchema.methods.getActiveProductLines = function() {
  return this.productLines
    .filter((line: IProductLine) => line.isActive)
    .sort((a: IProductLine, b: IProductLine) => a.displayOrder - b.displayOrder)
}

// Product line usage is now handled directly in the API for better reliability

// Input interface for creating/updating brands
export interface IBrandInput {
  name: string
  country?: string
  yearEstablished?: number
  revenue?: string
  description?: string
  productLines?: Omit<IProductLine, '_id'>[]
}

export default models.Brand || model<IBrand>('Brand', BrandSchema) 