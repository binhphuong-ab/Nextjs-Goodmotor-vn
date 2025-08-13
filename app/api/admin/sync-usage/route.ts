import { NextRequest, NextResponse } from 'next/server'
import { syncAllUsage } from '@/lib/usage-sync'

/**
 * USAGE TRACKING SYNCHRONIZATION API ENDPOINT
 * 
 * POST /api/admin/sync-usage
 * 
 * This endpoint provides administrative access to rebuild usage tracking data
 * for all brands and pump types based on current product data.
 * 
 * USAGE TRACKING SYSTEM:
 * - Automatically maintained during product CRUD operations
 * - Tracks which products use each brand, product line, pump type, and sub pump type
 * - Displayed in admin interface as usage counts and product lists
 * - Used to prevent deletion of entities still in use
 * 
 * WHEN TO USE THIS ENDPOINT:
 * - After data imports or migrations
 * - When usage counts appear incorrect in the admin interface
 * - As part of maintenance routines
 * - After manual database modifications
 * 
 * SECURITY CONSIDERATIONS:
 * - Should be restricted to admin users only
 * - Consider adding authentication middleware
 * - Log all sync operations for audit trails
 * 
 * PERFORMANCE NOTES:
 * - Can be slow with large product catalogs
 * - Scans all products and updates all brands/pump types
 * - Consider running during off-peak hours
 * - No pagination - processes entire dataset
 * 
 * FUTURE ENHANCEMENTS:
 * - Add authentication/authorization checks
 * - Add rate limiting to prevent abuse
 * - Include progress reporting for long operations
 * - Add selective sync (only specific entities)
 * - Implement queued/background processing
 */

export async function POST(request: NextRequest) {
  try {
    // Execute the comprehensive usage synchronization
    // This rebuilds all usage tracking data from scratch
    const result = await syncAllUsage()
    
    // Return success response with detailed message
    return NextResponse.json(result)
  } catch (error) {
    // Log the error for debugging and monitoring
    console.error('Error in usage sync API:', error)
    
    // Return user-friendly error response
    return NextResponse.json(
      { error: 'Failed to sync usage tracking' },
      { status: 500 }
    )
  }
}
