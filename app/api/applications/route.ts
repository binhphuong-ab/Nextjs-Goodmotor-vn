/**
 * Applications API Endpoint
 * 
 * This API provides access to vacuum pump applications for public viewing.
 * 
 * FRONTEND-BACKEND RELATIONSHIP:
 * - This API (route.ts) serves data TO → /app/applications/page.tsx
 * - The applications page makes HTTP GET requests to this endpoint
 * - This creates a clean separation between UI and data logic
 * 
 * DATA FLOW:
 * 1. Frontend page.tsx calls: fetch('/api/applications')
 * 2. Next.js routes the request to this file (route.ts)
 * 3. This file queries MongoDB for active applications
 * 4. Returns JSON data back to the frontend
 * 5. Frontend updates UI with the received data
 * 
 * SECURITY & FILTERING:
 * - Only returns applications with 'isActive: true' status (hides inactive)
 * - Sorts featured applications first for better UX
 * - Excludes internal MongoDB fields from public response
 * - Populates industry references for rich data
 * 
 * USED BY:
 * - /applications page (main consumer)
 * - Admin dashboard (for management)
 * - Homepage (application showcase links)
 */

import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Application from '@/models/Application'
import Industry from '@/models/Industry' // Import Industry model to register schema
import connectToDatabase from '@/lib/mongoose'

/**
 * GET /api/applications
 * 
 * PUBLIC API ENDPOINT - Serves application data to the frontend applications page
 * 
 * FRONTEND CONSUMPTION:
 * - Called by /app/applications/page.tsx via fetch('/api/applications')
 * - Applications page displays this data in a portfolio grid layout
 * - Enables dynamic filtering and statistics calculation on frontend
 * 
 * QUERY BEHAVIOR:
 * - Only returns applications with isActive: true (public portfolio)
 * - Excludes internal MongoDB fields (__v)
 * - Sorts by featured flag (desc), display order (asc), then name (asc)
 * - Uses .lean() for better performance (plain JS objects)
 * - Populates recommendedIndustries for rich data display
 * 
 * RESPONSE FORMAT:
 * - Returns JSON array of application objects
 * - Each application includes: name, description, specs, images, etc.
 * - Frontend TypeScript interface matches this structure
 * 
 * @returns {Array} Array of active application objects for frontend consumption
 * @returns {Object} Error object with 500 status on failure
 */
export async function GET() {
  try {
    // Establish database connection
    await connectToDatabase()
    
    // Ensure models are registered for population
    // This fixes the MissingSchemaError by forcing model registration
    Industry.modelName // Access Industry model to ensure it's registered
    
    // Query for active applications only (public portfolio)
    // This data will be consumed by /app/applications/page.tsx
    const applications = await Application.find({ isActive: true })
      .select('-__v')  // Exclude MongoDB version field from response
      .populate('recommendedIndustries', 'name slug')  // Populate industry references
      .sort({ 
        featured: -1,        // Featured first
        displayOrder: 1,     // Then by display order
        name: 1             // Finally by name alphabetically
      })
      .lean()  // Return plain JavaScript objects for better performance
    
    // Return applications in JSON format for frontend consumption
    return NextResponse.json(applications)
  } catch (error) {
    // Log error for debugging while keeping user-friendly message
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
