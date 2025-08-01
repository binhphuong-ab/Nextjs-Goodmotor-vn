import { Schema, model, models, Types } from 'mongoose'

export interface ICustomer {
  _id: string
  name: string
  slug: string
  legalName?: string
  businessType: Types.ObjectId // Single reference (one-to-one) to BusinessType
  industry?: string[] // Array of Industry IDs (optional now)
  website?: string
  logo?: string
  
  // Customer Relationship
  customerStatus: 'prospect' | 'active' | 'inactive' | 'partner' | 'distributor'
  customerTier: 'standard' | 'preferred' | 'premium' | 'enterprise'
  completeDate?: Date
  
  // Description
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [200, 'Customer name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Customer slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Slug cannot exceed 100 characters'],
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  legalName: {
    type: String,
    trim: true,
    maxlength: [300, 'Legal name cannot exceed 300 characters']
  },
  businessType: {
    type: Schema.Types.ObjectId,
    ref: 'BusinessType',
    required: [true, 'Business type is required']
  },
  industry: [{
    type: Schema.Types.ObjectId,
    ref: 'Industry'
  }],
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Please provide a valid website URL'
    }
  },
  logo: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v);
      },
      message: 'Please provide a valid logo image URL'
    }
  },
  
  // Customer Relationship
  customerStatus: {
    type: String,
    required: [true, 'Customer status is required'],
    enum: ['prospect', 'active', 'inactive', 'partner', 'distributor'],
    default: 'prospect'
  },
  customerTier: {
    type: String,
    required: [true, 'Customer tier is required'],
    enum: ['standard', 'preferred', 'premium', 'enterprise'],
    default: 'standard'
  },
  completeDate: {
    type: Date
  },
  
  // Description
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes for better query performance
CustomerSchema.index({ businessType: 1 })
CustomerSchema.index({ customerStatus: 1 })
CustomerSchema.index({ customerTier: 1 })
CustomerSchema.index({ isActive: 1 })

// Add compound indexes for common query patterns
CustomerSchema.index({ isActive: 1, customerStatus: 1 }) // Active customers by status
CustomerSchema.index({ businessType: 1, customerTier: 1 }) // Business type + tier queries
CustomerSchema.index({ customerStatus: 1, completeDate: -1 }) // Recent complete dates by status
CustomerSchema.index({ industry: 1 }) // Industry references (array field)
// Sparse indexes for optional fields (only indexes documents that have these fields)
CustomerSchema.index({ completeDate: -1 }, { sparse: true }) // Recent complete dates

// Input interface for creating/updating customers
export interface ICustomerInput {
  name: string
  slug: string
  legalName?: string
  businessType: string
  industry?: string[]
  website?: string
  logo?: string
  customerStatus?: ICustomer['customerStatus']
  customerTier?: ICustomer['customerTier']
  completeDate?: Date
  description?: string
  isActive?: boolean
}

export default models.Customer || model<ICustomer>('Customer', CustomerSchema) 