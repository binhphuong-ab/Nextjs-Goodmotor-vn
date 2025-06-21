import { Schema, model, models } from 'mongoose'

export interface IProject {
  _id: string
  title: string
  description: string
  client: string
  industry: string
  location: string
  completionDate: Date
  projectType: string
  pumpTypes: string[]
  images: string[]
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
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    enum: [
      'pharmaceutical',
      'semiconductor',
      'food-processing',
      'chemical',
      'automotive',
      'aerospace',
      'oil-gas',
      'power-generation',
      'manufacturing',
      'research',
      'other'
    ]
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
  pumpTypes: [{
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
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Please provide a valid image URL'
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
ProjectSchema.index({ industry: 1 })
ProjectSchema.index({ status: 1 })

export default models.Project || model<IProject>('Project', ProjectSchema) 