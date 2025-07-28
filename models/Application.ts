import { Schema, model, models, Types } from 'mongoose'

export interface IApplication {
  _id: string
  name: string
  slug: string
  description: string
  category: 'freeze-drying' | 'distillation' | 'packaging' | 'coating' | 'degassing' | 'filtration' | 'drying' | 'metallurgy' | 'electronics' | 'medical' | 'research' | 'other'
  
  // Technical specifications
  vacuumRequirements: {
    pressureRange?: string          // e.g., "10^-3 to 10^-6 mbar"
    flowRate?: string              // e.g., "500-2000 CFM"
    pumpingSpeed?: string          // e.g., "100 m³/h"
    ultimateVacuum?: string        // e.g., "10^-6 mbar"
  }
  
  // Application characteristics
  processConditions?: {
    temperature?: string           // e.g., "-80°C to +150°C"
    duration?: string             // e.g., "2-24 hours"
  }
  
  // Industry references
  recommendedIndustries: Types.ObjectId[] // References to Industry documents
  
  // Products and projects
  products?: {
    name: string
    url?: string
  }[]
  projects?: {
    name: string
    url?: string
  }[]
  
  // Benefits and challenges
  benefits: string[]              // Key advantages of vacuum technology for this application
  challenges?: string[]           // Common challenges or considerations
  
  // Media and resources
  images?: {
    url: string
    alt?: string
    caption?: string
    isPrimary?: boolean
  }[]
  downloadDocuments?: {
    title: string
    url: string
    imageUrl?: string              // Thumbnail/cover image URL
    description?: string
  }[]
  
  // SEO and content
  keywords?: string[]            // SEO keywords
  
  // Status and organization
  isActive: boolean
  featured: boolean
  displayOrder: number
  
  // Statistics
  stats?: {
    viewCount?: number
    inquiryCount?: number
    lastUpdated?: Date
  }
  
  createdAt: Date
  updatedAt: Date
}

const ApplicationSchema = new Schema<IApplication>({
  name: {
    type: String,
    required: [true, 'Application name is required'],
    trim: true,
    maxlength: [200, 'Application name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Application slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Slug cannot exceed 100 characters'],
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    required: [true, 'Application description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Application category is required'],
    enum: [
      'freeze-drying',
      'distillation', 
      'packaging',
      'coating',
      'degassing',
      'filtration',
      'drying',
      'metallurgy',
      'electronics',
      'medical',
      'research',
      'other'
    ]
  },
  
  // Technical specifications
  vacuumRequirements: {
    pressureRange: {
      type: String,
      trim: true
    },
    flowRate: {
      type: String,
      trim: true
    },
    pumpingSpeed: {
      type: String,
      trim: true
    },
    ultimateVacuum: {
      type: String,
      trim: true
    }
  },
  
  // Process conditions
  processConditions: {
    temperature: {
      type: String,
      trim: true
    },
    duration: {
      type: String,
      trim: true
    }
  },
  
  // Industry references
  recommendedIndustries: [{
    type: Schema.Types.ObjectId,
    ref: 'Industry',
    required: true
  }],
  
  // Products and projects
  products: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: false,
      trim: true
    }
  }],
  projects: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: false,
      trim: true
    }
  }],
  
  // Benefits and challenges
  benefits: [{
    type: String,
    required: true,
    trim: true
  }],
  challenges: [{
    type: String,
    trim: true
  }],
  
  // Media and resources
  images: [{
    url: {
      type: String,
      required: true
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
  downloadDocuments: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  
  // SEO and content
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // Statistics
  stats: {
    viewCount: {
      type: Number,
      default: 0
    },
    inquiryCount: {
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

// Indexes for better query performance
ApplicationSchema.index({ category: 1 })
ApplicationSchema.index({ isActive: 1, featured: -1, displayOrder: 1 })
ApplicationSchema.index({ targetIndustries: 1 })
ApplicationSchema.index({ recommendedIndustries: 1 })
ApplicationSchema.index({ name: 'text', description: 'text', keywords: 'text' })

// Input interface for creating/updating applications
export interface IApplicationInput {
  name: string
  slug: string
  description: string
  category: IApplication['category']
  vacuumRequirements?: IApplication['vacuumRequirements']
  processConditions?: IApplication['processConditions']
  recommendedIndustries: string[] // Array of Industry ObjectId strings
  products?: IApplication['products']
  projects?: IApplication['projects']
  benefits: string[]
  challenges?: string[]
  images?: IApplication['images']
  downloadDocuments?: IApplication['downloadDocuments']
  keywords?: string[]
  isActive?: boolean
  featured?: boolean
  displayOrder?: number
}

export default models.Application || model<IApplication>('Application', ApplicationSchema) 