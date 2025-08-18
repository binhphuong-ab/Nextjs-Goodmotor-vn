import { Schema, model, models, Types } from 'mongoose'

export interface IProject {
  _id: string
  title: string
  slug: string
  description: string
  client: string
  location: string
  completionDate: Date
  projectType: string
  pumpModels: Array<{
    name: string
    url: string
  }>
  applications: Array<{
    name: string
    url: string
  }>
  images: Array<{
    url: string
    alt?: string
    caption?: string
    isPrimary?: boolean
  }>
  specifications: {
    flowRate?: string
    vacuumLevel?: string
    power?: string
    quantity?: string
  }
  challenges: string
  solutions: string
  results: string
  featured: boolean
  status: 'completed' | 'ongoing' | 'planned'
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Project slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Slug cannot exceed 100 characters'],
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  client: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Project location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  completionDate: {
    type: Date,
    required: [true, 'Completion date is required']
  },
  projectType: {
    type: String,
    required: [true, 'Project type is required'],
    enum: [
      'new-installation',
      'system-upgrade',
      'maintenance-contract',
      'emergency-repair',
      'consultation',
      'custom-solution'
    ]
  },
  pumpModels: [{
    name: {
      type: String,
      required: [true, 'Pump model name is required'],
      trim: true,
      maxlength: [100, 'Pump model name cannot exceed 100 characters']
    },
    url: {
      type: String,
      required: [true, 'Pump model URL is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid URL starting with http:// or https://'
      }
    }
  }],
  applications: [{
    name: {
      type: String,
      required: [true, 'Application name is required'],
      trim: true,
      maxlength: [100, 'Application name cannot exceed 100 characters']
    },
    url: {
      type: String,
      required: [true, 'Application URL is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid URL starting with http:// or https://'
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
          // Allow both absolute URLs and relative paths
          return /^(https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$|\/.*\.(jpg|jpeg|png|gif|webp)$)/i.test(v);
        },
        message: 'Please provide a valid image URL or path'
      }
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [200, 'Alt text cannot exceed 200 characters']
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [500, 'Caption cannot exceed 500 characters']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  specifications: {
    flowRate: {
      type: String,
      trim: true
    },
    vacuumLevel: {
      type: String,
      trim: true
    },
    power: {
      type: String,
      trim: true
    },
    quantity: {
      type: String,
      trim: true
    }
  },
  challenges: {
    type: String,
    required: [true, 'Project challenges description is required'],
    trim: true
  },
  solutions: {
    type: String,
    required: [true, 'Solutions description is required'],
    trim: true
  },
  results: {
    type: String,
    required: [true, 'Results description is required'],
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    required: [true, 'Project status is required'],
    enum: ['completed', 'ongoing', 'planned'],
    default: 'completed'
  }
}, {
  timestamps: true
})

// Index for better query performance
ProjectSchema.index({ featured: -1, completionDate: -1 })
ProjectSchema.index({ status: 1 })

export default models.Project || model<IProject>('Project', ProjectSchema) 