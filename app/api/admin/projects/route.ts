import { NextRequest, NextResponse } from 'next/server'
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

// GET /api/admin/projects - Get all projects
export async function GET() {
  try {
    await connectToDatabase()
    
    const projects = await Project.find({})
      .sort({ createdAt: -1 })
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

// POST /api/admin/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    
    const project = new Project(body)
    const savedProject = await project.save()
    
    return NextResponse.json(savedProject, { status: 201 })
  } catch (error: any) {
    console.error('Error creating project:', error)
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: errorMessages },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
} 