/**
 * Projects API Endpoint
 * 
 * This API provides access to completed project case studies for public viewing.
 * 
 * FRONTEND-BACKEND RELATIONSHIP:
 * - This API (route.ts) serves data TO → /app/projects/page.tsx
 * - The projects page makes HTTP GET requests to this endpoint
 * - This creates a clean separation between UI and data logic
 * 
 * DATA FLOW:
 * 1. Frontend page.tsx calls: fetch('/api/projects')
 * 2. Next.js routes the request to this file (route.ts)
 * 3. This file queries MongoDB for completed projects
 * 4. Returns JSON data back to the frontend
 * 5. Frontend updates UI with the received data
 * 
 * SECURITY & FILTERING:
 * - Only returns projects with 'completed' status (hides ongoing/planned)
 * - Sorts featured projects first for better UX
 * - Excludes internal MongoDB fields from public response
 * 
 * USED BY:
 * - /projects page (main consumer)
 * - Admin dashboard (for management)
 * - Homepage (case study links)
 */

import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Project from '@/models/Project'

/**
 * Connects to MongoDB database if not already connected
 * Reuses existing connection to improve performance
 * 
 * @throws {Error} If MONGODB_URI environment variable is missing
 */
async function connectToDatabase() {
  // Check if already connected to avoid redundant connections
  if (mongoose.connections[0].readyState) {
    return
  }
  
  // Ensure MongoDB URI is configured
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined')
  }
  
  // Establish new connection
  await mongoose.connect(process.env.MONGODB_URI)
}

/**
 * GET /api/projects
 * 
 * PUBLIC API ENDPOINT - Serves project data to the frontend projects page
 * 
 * FRONTEND CONSUMPTION:
 * - Called by /app/projects/page.tsx via fetch('/api/projects')
 * - Projects page displays this data in a portfolio grid layout
 * - Enables dynamic filtering and statistics calculation on frontend
 * 
 * QUERY BEHAVIOR:
 * - Only returns projects with status: 'completed' (public portfolio)
 * - Excludes internal MongoDB fields (__v)
 * - Sorts by featured flag (desc) then completion date (desc)
 * - Uses .lean() for better performance (plain JS objects)
 * 
 * RESPONSE FORMAT:
 * - Returns JSON array of project objects
 * - Each project includes: title, client, industry, specs, images, etc.
 * - Frontend TypeScript interface matches this structure
 * 
 * @returns {Array} Array of completed project objects for frontend consumption
 * @returns {Object} Error object with 500 status on failure
 */
export async function GET() {
  try {
    // Establish database connection
    await connectToDatabase()
    
    // Query for completed projects only (public portfolio)
    // This data will be consumed by /app/projects/page.tsx
    const projects = await Project.find({ status: 'completed' })
      .select('-__v')  // Exclude MongoDB version field from response
      .sort({ featured: -1, completionDate: -1 })  // Featured first, then newest
      .lean()  // Return plain JavaScript objects for better performance
    
    // Return projects in JSON format for frontend consumption
    return NextResponse.json(projects)
  } catch (error) {
    // Log error for debugging while keeping user-friendly message
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
} 