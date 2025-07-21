import { Schema, model, models, Types } from 'mongoose'

export interface ICustomer {
  _id: string
  name: string
  slug: string
  legalName?: string
  businessType: Types.ObjectId // Reference to BusinessType _id
  industry: string[] // References to Industry _id
  website?: string
  logo?: string
  
  // Contact Information
  contactInfo: {
    primaryEmail: string
    primaryPhone: string
    secondaryPhone?: string
    fax?: string
  }
  
  // Address Information
  addresses: {
    headquarters: {
      street: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
    billing?: {
      street: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
    shipping?: {
      street: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
  }
  
  // Business Details
  businessDetails: {
    foundedYear?: number
    employeeCount?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+'
    annualRevenue?: 'under-1m' | '1m-10m' | '10m-50m' | '50m-100m' | '100m-500m' | '500m+'
    registrationNumber?: string
    taxId?: string
  }
  
  // Key Contacts
  contacts: {
    name: string
    title: string
    email: string
    phone?: string
    department: 'purchasing' | 'engineering' | 'maintenance' | 'management' | 'finance' | 'other'
    isPrimary: boolean
  }[]
  
  // Customer Relationship
  customerStatus: 'prospect' | 'active' | 'inactive' | 'partner' | 'distributor'
  customerTier: 'standard' | 'preferred' | 'premium' | 'enterprise'
  acquisitionDate?: Date
  lastContactDate?: Date
  assignedSalesRep?: string
  
  // Technical Information
  technicalProfile: {
    primaryApplications: string[]
    requiredVacuumLevels?: string[]
    preferredPumpTypes: string[]
    typicalOrderVolume?: 'single-unit' | 'small-batch' | 'medium-batch' | 'large-batch' | 'bulk'
    technicalRequirements?: string[]
    certificationNeeds?: string[]
  }
  
  // Financial Information
  financialInfo: {
    creditRating?: 'excellent' | 'good' | 'fair' | 'poor'
    paymentTerms?: string
    creditLimit?: number
    currency: string
  }
  
  // Notes and Tags
  notes?: string
  tags: string[]
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
  
  // Contact Information
  contactInfo: {
    primaryEmail: {
      type: String,
      required: [true, 'Primary email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address'
      }
    },
    primaryPhone: {
      type: String,
      required: [true, 'Primary phone is required'],
      trim: true
    },
    secondaryPhone: {
      type: String,
      trim: true
    },
    fax: {
      type: String,
      trim: true
    }
  },
  
  // Address Information
  addresses: {
    headquarters: {
      street: {
        type: String,
        required: [true, 'Headquarters street address is required'],
        trim: true
      },
      city: {
        type: String,
        required: [true, 'Headquarters city is required'],
        trim: true
      },
      state: {
        type: String,
        trim: true
      },
      postalCode: {
        type: String,
        required: [true, 'Headquarters postal code is required'],
        trim: true
      },
      country: {
        type: String,
        required: [true, 'Headquarters country is required'],
        trim: true
      }
    },
    billing: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    shipping: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },
  
  // Business Details
  businessDetails: {
    foundedYear: {
      type: Number,
      min: [1800, 'Founded year must be after 1800'],
      max: [new Date().getFullYear(), 'Founded year cannot be in the future']
    },
    employeeCount: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    annualRevenue: {
      type: String,
      enum: ['under-1m', '1m-10m', '10m-50m', '50m-100m', '100m-500m', '500m+']
    },
    registrationNumber: {
      type: String,
      trim: true
    },
    taxId: {
      type: String,
      trim: true
    }
  },
  
  // Key Contacts
  contacts: [{
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Contact title is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address'
      }
    },
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Contact department is required'],
      enum: ['purchasing', 'engineering', 'maintenance', 'management', 'finance', 'other']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
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
  acquisitionDate: {
    type: Date
  },
  lastContactDate: {
    type: Date
  },
  assignedSalesRep: {
    type: String,
    trim: true
  },
  
  // Technical Information
  technicalProfile: {
    primaryApplications: [{
      type: String,
      trim: true
    }],
    requiredVacuumLevels: [{
      type: String,
      trim: true
    }],
    preferredPumpTypes: [{
      type: String,
      enum: [
        'rotary-vane',
        'scroll',
        'diaphragm',
        'turbomolecular',
        'liquid-ring',
        'roots-blower',
        'claw-pump',
        'other'
      ]
    }],
    typicalOrderVolume: {
      type: String,
      enum: ['single-unit', 'small-batch', 'medium-batch', 'large-batch', 'bulk']
    },
    technicalRequirements: [{
      type: String,
      trim: true
    }],
    certificationNeeds: [{
      type: String,
      trim: true
    }]
  },
  
  // Financial Information
  financialInfo: {
    creditRating: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    paymentTerms: {
      type: String,
      trim: true
    },
    creditLimit: {
      type: Number,
      min: [0, 'Credit limit cannot be negative']
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD',
      trim: true,
      uppercase: true
    }
  },
  
  // Notes and Tags
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
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
CustomerSchema.index({ 'contactInfo.primaryEmail': 1 })
CustomerSchema.index({ isActive: 1 })
CustomerSchema.index({ tags: 1 })

// Add compound indexes for common query patterns
CustomerSchema.index({ isActive: 1, customerStatus: 1 }) // Active customers by status
CustomerSchema.index({ businessType: 1, customerTier: 1 }) // Business type + tier queries
CustomerSchema.index({ customerStatus: 1, lastContactDate: -1 }) // Recent contacts by status
CustomerSchema.index({ industry: 1 }) // Industry references (array field)
CustomerSchema.index({ assignedSalesRep: 1, isActive: 1 }) // Sales rep active customers
CustomerSchema.index({ 'addresses.headquarters.country': 1, 'addresses.headquarters.state': 1 }) // Geographic queries

// Sparse indexes for optional fields (only indexes documents that have these fields)
CustomerSchema.index({ lastContactDate: -1 }, { sparse: true }) // Recent contact dates
CustomerSchema.index({ acquisitionDate: -1 }, { sparse: true }) // Customer acquisition timeline
CustomerSchema.index({ assignedSalesRep: 1 }, { sparse: true }) // Sales rep assignments

// Input interface for creating/updating customers
export interface ICustomerInput {
  name: string
  slug: string
  legalName?: string
  businessType: string
  industry: string[]
  website?: string
  logo?: string
  contactInfo: ICustomer['contactInfo']
  addresses: ICustomer['addresses']
  businessDetails?: ICustomer['businessDetails']
  contacts: ICustomer['contacts']
  customerStatus?: ICustomer['customerStatus']
  customerTier?: ICustomer['customerTier']
  acquisitionDate?: Date
  lastContactDate?: Date
  assignedSalesRep?: string
  technicalProfile?: ICustomer['technicalProfile']
  financialInfo?: ICustomer['financialInfo']
  notes?: string
  tags?: string[]
  isActive?: boolean
}

export default models.Customer || model<ICustomer>('Customer', CustomerSchema) 