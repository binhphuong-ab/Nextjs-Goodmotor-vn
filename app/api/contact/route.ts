import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Contact, ContactInput } from '@/models/Contact'

export async function POST(request: NextRequest) {
  try {
    const contactInput: ContactInput = await request.json()
    
    // Basic validation
    if (!contactInput.name || !contactInput.email || !contactInput.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const collection = db.collection<Contact>('contacts')
    
    const contact: Omit<Contact, '_id'> = {
      ...contactInput,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await collection.insertOne(contact)
    
    return NextResponse.json(
      { message: 'Contact form submitted successfully', id: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection<Contact>('contacts')
    
    const contacts = await collection.find({}).sort({ createdAt: -1 }).toArray()
    
    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
} 