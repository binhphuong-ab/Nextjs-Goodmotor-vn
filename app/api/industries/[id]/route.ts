import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Industry from '@/models/Industry'
import Customer from '@/models/Customer'

// Connect to MongoDB using Mongoose
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return
  }
  
  await mongoose.connect(process.env.MONGODB_URI as string)
}

// GET /api/industries/[id] - Fetch individual industry
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const includeCustomers = searchParams.get('includeCustomers') === 'true'
    const updateStats = searchParams.get('updateStats') === 'true'
    
    let industryQuery = Industry.findById(params.id)
    
    // Optionally populate customers
    if (includeCustomers) {
      industryQuery = industryQuery.populate('customers', 'name slug businessType customerStatus contactInfo.primaryEmail')
    }
    
    const industry = await industryQuery
    
    if (!industry) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      )
    }
    
    // Optionally update customer count in stats
    if (updateStats) {
      await industry.updateCustomerCount()
    }
    
    return NextResponse.json(industry)
  } catch (error) {
    console.error('Error fetching industry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch industry' },
      { status: 500 }
    )
  }
}

// PUT /api/industries/[id] - Update industry
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    
    const updateData = await request.json()
    
    const industry = await Industry.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!industry) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(industry)
  } catch (error) {
    console.error('Error updating industry:', error)
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Industry name or slug already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update industry' },
      { status: 500 }
    )
  }
}

// DELETE /api/industries/[id] - Delete industry
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    
    // Check if any customers are using this industry
    const customerCount = await Customer.countDocuments({ industry: params.id })
    
    if (customerCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete industry',
          message: `This industry is currently assigned to ${customerCount} customer(s). Please reassign or remove these customers first.`
        },
        { status: 400 }
      )
    }
    
    const industry = await Industry.findByIdAndDelete(params.id)
    
    if (!industry) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Industry deleted successfully' })
  } catch (error) {
    console.error('Error deleting industry:', error)
    return NextResponse.json(
      { error: 'Failed to delete industry' },
      { status: 500 }
    )
  }
} 