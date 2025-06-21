export interface Contact {
  _id?: string
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

export interface ContactInput {
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  inquiryType: Contact['inquiryType']
} 