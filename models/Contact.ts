import { Schema, model, models } from 'mongoose'

export interface IContact {
  _id: string
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  inquiryType: 'quote' | 'support' | 'general' | 'product-info'
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  createdAt: Date
  updatedAt: Date
}

const ContactSchema = new Schema<IContact>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
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
  company: {
    type: String,
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  inquiryType: {
    type: String,
    required: [true, 'Inquiry type is required'],
    enum: ['quote', 'support', 'general', 'product-info'],
    default: 'general'
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  }
}, {
  timestamps: true
})

// Indexes for better query performance
ContactSchema.index({ email: 1 })
ContactSchema.index({ status: 1 })
ContactSchema.index({ inquiryType: 1 })
ContactSchema.index({ createdAt: -1 })

// Input interface for creating contacts
export interface IContactInput {
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  inquiryType: IContact['inquiryType']
}

// Keep old interfaces for backward compatibility
export interface Contact extends IContact {}
export interface ContactInput extends IContactInput {}

export default models.Contact || model<IContact>('Contact', ContactSchema) 