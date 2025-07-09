import { Schema, model, models, Types } from 'mongoose'

export interface IBusinessType {
  _id: string
  name: string
  customerIds: Types.ObjectId[] // Track which customers use this business type
  createdAt: Date
  updatedAt: Date
}

const BusinessTypeSchema = new Schema<IBusinessType>({
  name: {
    type: String,
    required: [true, 'Business type name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Business type name cannot exceed 100 characters']
  },
  customerIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Customer'
  }]
}, {
  timestamps: true
})

// Indexes for better query performance
BusinessTypeSchema.index({ name: 1 })
BusinessTypeSchema.index({ customerIds: 1 })

// Input interface for creating/updating business types
export interface IBusinessTypeInput {
  name: string
  customerIds?: string[]
}

export default models.BusinessType || model<IBusinessType>('BusinessType', BusinessTypeSchema) 