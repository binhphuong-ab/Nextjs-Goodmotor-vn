import { Schema, model, models } from 'mongoose'

/**
 * PUMP TYPE MODEL WITH USAGE TRACKING SYSTEM
 * 
 * This model implements a comprehensive usage tracking system that automatically
 * maintains references to which products use each pump type and sub pump type.
 * 
 * USAGE TRACKING ARCHITECTURE:
 * 
 * 1. AUTOMATIC TRACKING:
 *    - Maintained automatically during product CRUD operations
 *    - Updated in real-time when products are created, updated, or deleted
 *    - No manual intervention required for normal operations
 * 
 * 2. DATA STRUCTURE:
 *    - productUsage: Array of product names using this pump type
 *    - subPumpTypeUsage: Map of sub pump type ID -> array of product names
 * 
 * 3. USE CASES:
 *    - Admin interface: Show usage counts and product lists
 *    - Validation: Prevent deletion of pump types still in use
 *    - Business logic: Understand product relationships
 *    - Reporting: Track which pump types are most popular
 * 
 * 4. SYNCHRONIZATION:
 *    - Automatic updates: During product operations (CREATE/UPDATE/DELETE)
 *    - Manual sync: Use /api/admin/sync-usage or syncAllUsage() function
 *    - Recovery: If data becomes inconsistent, sync rebuilds from scratch
 * 
 * 5. PERFORMANCE CONSIDERATIONS:
 *    - Usage data is denormalized for fast read access
 *    - Trade-off: Slightly more complex writes for much faster reads
 *    - Alternative: Calculate usage on-demand (slower but simpler)
 * 
 * 6. ERROR RESILIENCE:
 *    - Usage tracking failures don't break product operations
 *    - Inconsistencies can be repaired using sync utilities
 *    - Graceful degradation if tracking data is missing
 * 
 * FUTURE ENHANCEMENTS:
 * - Add timestamps to track when usage last changed
 * - Implement usage analytics and trending
 * - Add webhook notifications for usage changes
 * - Consider caching for very large datasets
 * - Add usage-based recommendations
 */

export interface ISubPumpType {
  _id?: string
  name: string
  slug: string
  image?: string // Optional image URL or relative path
  description?: string
  isActive: boolean
  displayOrder: number
}

export interface IPumpType {
  _id: string
  pumpType: string
  slug: string
  description?: string
  image?: string // Optional image URL or relative path
  subPumpTypes: ISubPumpType[] // Array of sub pump types
  subPumpTypeUsage?: Record<string, string[]> // Map of subPumpType _id -> array of product names
  productUsage?: string[] // Array of product names using this pump type
  createdAt: Date
  updatedAt: Date
}

const SubPumpTypeSchema = new Schema<ISubPumpType>({
  name: {
    type: String,
    required: [true, 'Sub pump type name is required'],
    trim: true,
    maxlength: [100, 'Sub pump type name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Sub pump type slug is required'],
    trim: true,
    lowercase: true,
    maxlength: [100, 'Sub pump type slug cannot exceed 100 characters'],
    match: [/^[a-z0-9-]+$/, 'Sub pump type slug can only contain lowercase letters, numbers, and hyphens']
  },
  image: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, 'Sub pump type image path cannot exceed 500 characters'],
    validate: {
      validator: function(v: string) {
        if (!v) return true // Image is optional
        // Allow URLs (http/https) or relative paths
        const urlPattern = /^https?:\/\/.+/
        const relativePathPattern = /^[^\/].+\.(jpg|jpeg|png|gif|webp|svg)$/i
        const absolutePathPattern = /^\/[^\/].+\.(jpg|jpeg|png|gif|webp|svg)$/i
        return urlPattern.test(v) || relativePathPattern.test(v) || absolutePathPattern.test(v)
      },
      message: 'Sub pump type image must be a valid URL or relative path to an image file (jpg, jpeg, png, gif, webp, svg)'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Sub pump type description cannot exceed 500 characters']
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
  _id: true // Allow MongoDB to generate _id for each sub pump type
})

const PumpTypeSchema = new Schema<IPumpType>({
  pumpType: {
    type: String,
    required: [true, 'Pump type is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Pump type cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    trim: true,
    unique: true,
    lowercase: true,
    maxlength: [100, 'Slug cannot exceed 100 characters'],
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  image: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, 'Image path cannot exceed 500 characters'],
    validate: {
      validator: function(v: string) {
        if (!v) return true // Image is optional
        // Allow URLs (http/https) or relative paths
        const urlPattern = /^https?:\/\/.+/
        const relativePathPattern = /^[^\/].+\.(jpg|jpeg|png|gif|webp|svg)$/i
        const absolutePathPattern = /^\/[^\/].+\.(jpg|jpeg|png|gif|webp|svg)$/i
        return urlPattern.test(v) || relativePathPattern.test(v) || absolutePathPattern.test(v)
      },
      message: 'Image must be a valid URL or relative path to an image file (jpg, jpeg, png, gif, webp, svg)'
    }
  },
  subPumpTypes: [SubPumpTypeSchema], // Embedded array of sub pump types
  subPumpTypeUsage: {
    type: Map,
    of: [String],
    default: new Map()
  },
  productUsage: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
})

// Indexes for better query performance
// Note: pumpType and slug indexes automatically created by unique: true
PumpTypeSchema.index({ pumpType: 'text', description: 'text' }) // Text search on pump type and description
PumpTypeSchema.index({ 'subPumpTypes.name': 1 }) // Index for sub pump type names
PumpTypeSchema.index({ 'subPumpTypes.slug': 1 }) // Index for sub pump type slugs

// Validation to ensure sub pump type slugs are unique within each pump type
PumpTypeSchema.pre('save', function(next) {
  if (this.subPumpTypes && this.subPumpTypes.length > 0) {
    const slugs = this.subPumpTypes.map((subType: ISubPumpType) => subType.slug).filter(Boolean)
    const uniqueSlugs = new Set(slugs)
    
    if (slugs.length !== uniqueSlugs.size) {
      const error = new Error('Sub pump type slugs must be unique within the same pump type')
      return next(error)
    }
  }
  next()
})

// Methods to manage sub pump types
PumpTypeSchema.methods.addSubPumpType = function(subPumpTypeData: Omit<ISubPumpType, '_id'>) {
  this.subPumpTypes.push(subPumpTypeData)
  return this.save()
}

PumpTypeSchema.methods.updateSubPumpType = function(subPumpTypeId: string, updateData: Partial<ISubPumpType>) {
  const subPumpType = this.subPumpTypes.id(subPumpTypeId)
  if (subPumpType) {
    Object.assign(subPumpType, updateData)
    return this.save()
  }
  throw new Error('Sub pump type not found')
}

PumpTypeSchema.methods.removeSubPumpType = function(subPumpTypeId: string) {
  this.subPumpTypes.pull(subPumpTypeId)
  return this.save()
}

PumpTypeSchema.methods.getActiveSubPumpTypes = function() {
  return this.subPumpTypes
    .filter((subType: ISubPumpType) => subType.isActive)
    .sort((a: ISubPumpType, b: ISubPumpType) => a.displayOrder - b.displayOrder)
}

// Input interface for creating/updating pump types
export interface IPumpTypeInput {
  pumpType: string
  slug: string
  description?: string
  image?: string
  subPumpTypes?: Omit<ISubPumpType, '_id'>[]
  subPumpTypeUsage?: Record<string, string[]>
  productUsage?: string[]
}

export default models.PumpType || model<IPumpType>('PumpType', PumpTypeSchema) 