import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Project from '@/models/Project'

// Connect to MongoDB
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return
  }
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined')
  }
  
  await mongoose.connect(process.env.MONGODB_URI)
}

// GET /api/projects - Get all public projects
export async function GET() {
  try {
    await connectToDatabase()
    
    const projects = await Project.find({ status: 'completed' })
      .select('-__v')
      .sort({ featured: -1, completionDate: -1 })
      .lean()
    
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
} 