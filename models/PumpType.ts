import { Schema, model, models } from 'mongoose'

export interface IPumpType {
  _id: string
  pumpType: string
  slug: string
  productUsage?: string[] // Array of product names using this pump type
  createdAt: Date
  updatedAt: Date
}

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
  }
}, {
  timestamps: true
})

// Indexes for better query performance
// Note: pumpType and slug indexes automatically created by unique: true
PumpTypeSchema.index({ pumpType: 'text' }) // Text search on pump type
PumpTypeSchema.index({ slug: 1 }) // Fast lookup by slug

// Input interface for creating/updating pump types
export interface IPumpTypeInput {
  pumpType: string
  slug: string
}

export default models.PumpType || model<IPumpType>('PumpType', PumpTypeSchema) 