import { Schema, model, models } from 'mongoose'

export interface IPumpType {
  _id: string
  pumpType: string
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
  }
}, {
  timestamps: true
})

// Indexes for better query performance
// Note: pumpType index automatically created by unique: true
PumpTypeSchema.index({ pumpType: 'text' }) // Text search on pump type

// Input interface for creating/updating pump types
export interface IPumpTypeInput {
  pumpType: string
}

export default models.PumpType || model<IPumpType>('PumpType', PumpTypeSchema) 