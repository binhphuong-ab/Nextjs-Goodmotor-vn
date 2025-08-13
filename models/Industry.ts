import { Schema, model, models } from 'mongoose'

export interface IIndustry {
  _id: string
  name: string
  slug: string
  description?: string
  category?: 'thuc-pham' | 'nganh-nhua' | 'kim-loai' | 'y-te-duoc' | 'dien-dien-lanh' | 'phong-nghien-cuu' | 'nganh-khac'
  
  // Visibility
  displayOrder?: number
  
  // Statistics (computed/cached values)
  stats?: {
    customerCount?: number
    applicationCount?: number
    lastUpdated?: Date
  }
  
  // Virtual field for customers referencing this industry
  customers?: any[] // Will be populated with Customer documents
  
  // Virtual field for applications referencing this industry
  applications?: any[] // Will be populated with Application documents
  
  // Methods
  getCustomers?: () => Promise<any[]>
  getCustomerCount?: () => Promise<number>
  updateCustomerCount?: () => Promise<IIndustry>
  getApplications?: () => Promise<any[]>
  getApplicationCount?: () => Promise<number>
  updateApplicationCount?: () => Promise<IIndustry>
  
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
    enum: ['thuc-pham', 'nganh-nhua', 'kim-loai', 'y-te-duoc', 'dien-dien-lanh', 'phong-nghien-cuu', 'nganh-khac'],
    default: 'nganh-khac'
  },
  
  // Visibility
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
    applicationCount: {
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

// Virtual field to populate applications that reference this industry
IndustrySchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'recommendedIndustries',
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

// Method to get applications for this industry
IndustrySchema.methods.getApplications = async function() {
  const Application = models.Application || model('Application')
  return await Application.find({ recommendedIndustries: { $in: [this._id] } }).populate('recommendedIndustries', 'name slug')
}

// Method to get application count for this industry
IndustrySchema.methods.getApplicationCount = async function() {
  const Application = models.Application || model('Application')
  return await Application.countDocuments({ recommendedIndustries: { $in: [this._id] } })
}

// Method to update application count in stats
IndustrySchema.methods.updateApplicationCount = async function() {
  const count = await this.getApplicationCount()
  this.stats = {
    ...this.stats,
    applicationCount: count,
    lastUpdated: new Date()
  }
  return await this.save()
}

// Ensure virtual fields are serialized
IndustrySchema.set('toJSON', { virtuals: true })
IndustrySchema.set('toObject', { virtuals: true })

// Indexes for better query performance
IndustrySchema.index({ category: 1 })
IndustrySchema.index({ displayOrder: 1 })
IndustrySchema.index({ name: 'text', description: 'text' })

// Add compound indexes for common query patterns
IndustrySchema.index({ category: 1, displayOrder: 1 }) // Industries by category and display order

// Input interface for creating/updating industries
export interface IIndustryInput {
  name: string
  slug: string
  description?: string
  category?: IIndustry['category']
  displayOrder?: number
}

export default models.Industry || model<IIndustry>('Industry', IndustrySchema) 