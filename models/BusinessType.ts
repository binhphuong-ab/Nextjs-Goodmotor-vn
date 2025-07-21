import { Schema, model, models, Types } from 'mongoose'

export interface IBusinessType {
  _id: string
  name: string
  // Virtual field for customers referencing this business type
  customers?: any[] // Will be populated with Customer documents
  // Methods
  getCustomers?: () => Promise<any[]>
  getCustomerCount?: () => Promise<number>
  updateCustomerCount?: () => Promise<IBusinessType>
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
  }
}, {
  timestamps: true
})

// Virtual field to populate customers that reference this business type
BusinessTypeSchema.virtual('customers', {
  ref: 'Customer',
  localField: '_id',
  foreignField: 'businessType',
  justOne: false
})

// Method to get customers for this business type
BusinessTypeSchema.methods.getCustomers = async function() {
  const Customer = models.Customer || model('Customer')
  return await Customer.find({ businessType: this._id }).populate('businessType', 'name')
}

// Method to get customer count for this business type
BusinessTypeSchema.methods.getCustomerCount = async function() {
  const Customer = models.Customer || model('Customer')
  return await Customer.countDocuments({ businessType: this._id })
}

// Method to update customer count in stats (if needed for caching)
BusinessTypeSchema.methods.updateCustomerCount = async function() {
  const count = await this.getCustomerCount()
  // You can add stats field if needed for caching
  return this
}

// Ensure virtual fields are serialized
BusinessTypeSchema.set('toJSON', { virtuals: true })
BusinessTypeSchema.set('toObject', { virtuals: true })

// Indexes for better query performance
// Note: name field has unique: true which automatically creates an index

// Input interface for creating/updating business types
export interface IBusinessTypeInput {
  name: string
}

export default models.BusinessType || model<IBusinessType>('BusinessType', BusinessTypeSchema) 