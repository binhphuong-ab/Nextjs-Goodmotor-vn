import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Project from '@/models/Project'
import connectToDatabase from '@/lib/mongoose'

// GET /api/projects/[slug] - Get project by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase()
    
    const { slug } = params
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      )
    }
    
    const project = await Project.findOne({ slug: slug }).lean()
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(project)
  } catch (error: any) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
} 