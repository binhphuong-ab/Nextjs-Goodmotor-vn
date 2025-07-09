import { Schema, model, models } from 'mongoose'

export interface IIndustry {
  _id: string
  name: string
  slug: string
  description?: string
  category?: 'manufacturing' | 'processing' | 'research' | 'energy' | 'healthcare' | 'technology' | 'other'
  
  // Industry characteristics
  characteristics?: {
    typicalVacuumRequirements: string[]
    commonApplications: string[]
    regulatoryRequirements?: string[]
    standardCertifications?: string[]
  }
  
  // Market information
  marketInfo?: {
    marketSize?: string
    growthRate?: string
    keyDrivers?: string[]
    challenges?: string[]
  }
  
  // SEO and visibility
  keywords?: string[]
  isActive: boolean
  displayOrder?: number
  
  // Statistics (computed/cached values)
  stats?: {
    customerCount?: number
    projectCount?: number
    lastUpdated?: Date
  }
  
  // Virtual field for customers referencing this industry
  customers?: any[] // Will be populated with Customer documents
  
  // Methods
  getCustomers?: () => Promise<any[]>
  getCustomerCount?: () => Promise<number>
  updateCustomerCount?: () => Promise<IIndustry>
  
  createdAt: Date
  updatedAt: Date
}

const IndustrySchema = new Schema<IIndustry>({
  name: {
    type: String,
    required: [true, 'Industry name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Industry name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Industry slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Slug cannot exceed 100 characters'],
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: ['manufacturing', 'processing', 'research', 'energy', 'healthcare', 'technology', 'other'],
    default: 'other'
  },
  
  // Industry characteristics
  characteristics: {
    typicalVacuumRequirements: [{
      type: String,
      trim: true
    }],
    commonApplications: [{
      type: String,
      trim: true
    }],
    regulatoryRequirements: [{
      type: String,
      trim: true
    }],
    standardCertifications: [{
      type: String,
      trim: true
    }]
  },
  
  // Market information
  marketInfo: {
    marketSize: {
      type: String,
      trim: true
    },
    growthRate: {
      type: String,
      trim: true
    },
    keyDrivers: [{
      type: String,
      trim: true
    }],
    challenges: [{
      type: String,
      trim: true
    }]
  },
  
  // SEO and visibility
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // Statistics (computed/cached values)
  stats: {
    customerCount: {
      type: Number,
      default: 0
    },
    projectCount: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
})

// Virtual field to populate customers that reference this industry
IndustrySchema.virtual('customers', {
  ref: 'Customer',
  localField: '_id',
  foreignField: 'industry',
  justOne: false
})

// Method to get customers for this industry
IndustrySchema.methods.getCustomers = async function() {
  const Customer = models.Customer || model('Customer')
  return await Customer.find({ industry: { $in: [this._id] } }).populate('industry', 'name slug')
}

// Method to get customer count for this industry
IndustrySchema.methods.getCustomerCount = async function() {
  const Customer = models.Customer || model('Customer')
  return await Customer.countDocuments({ industry: { $in: [this._id] } })
}

// Method to update customer count in stats
IndustrySchema.methods.updateCustomerCount = async function() {
  const count = await this.getCustomerCount()
  this.stats = {
    ...this.stats,
    customerCount: count,
    lastUpdated: new Date()
  }
  return await this.save()
}

// Ensure virtual fields are serialized
IndustrySchema.set('toJSON', { virtuals: true })
IndustrySchema.set('toObject', { virtuals: true })

// Indexes for better query performance
IndustrySchema.index({ slug: 1 })
IndustrySchema.index({ category: 1 })
IndustrySchema.index({ isActive: 1 })
IndustrySchema.index({ displayOrder: 1 })
IndustrySchema.index({ name: 'text', description: 'text', keywords: 'text' })

// Input interface for creating/updating industries
export interface IIndustryInput {
  name: string
  slug: string
  description?: string
  category?: IIndustry['category']
  characteristics?: IIndustry['characteristics']
  marketInfo?: IIndustry['marketInfo']
  keywords?: string[]
  isActive?: boolean
  displayOrder?: number
}

export default models.Industry || model<IIndustry>('Industry', IndustrySchema) 