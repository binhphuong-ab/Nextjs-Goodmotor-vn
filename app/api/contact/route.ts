import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Contact, { IContactInput } from '@/models/Contact'
import connectToDatabase from '@/lib/mongoose'

export async function POST(request: NextRequest) {
  try {
    const contactInput: IContactInput = await request.json()
    
    // Basic validation
    if (!contactInput.name || !contactInput.email || !contactInput.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }
    
    await connectToDatabase()
    
    const contact = new Contact(contactInput)
    await contact.save()
    
    return NextResponse.json(
      { message: 'Contact form submitted successfully', contact },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting contact form:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await connectToDatabase()
    
    const contacts = await Contact.find({}).sort({ createdAt: -1 })
    
    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
} 