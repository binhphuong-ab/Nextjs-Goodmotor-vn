'use client'

import React, { useState } from 'react'

/**
 * USAGE SYNC COMPONENT
 * 
 * This component provides an admin interface for manually triggering
 * usage tracking synchronization. It's designed to be included in
 * admin dashboards or maintenance panels.
 * 
 * FUNCTIONALITY:
 * - Triggers comprehensive sync of all usage tracking data
 * - Shows loading state during sync operation
 * - Displays success/error notifications
 * - Prevents multiple simultaneous sync operations
 * 
 * USAGE TRACKING CONTEXT:
 * The system automatically tracks which products use each:
 * - Brand (and specific product lines within brands)
 * - Pump type (and specific sub pump types within pump types)
 * 
 * This data is used to:
 * - Show usage counts in admin lists
 * - Prevent deletion of entities still in use
 * - Display tooltips with product names
 * - Validate business rules
 * 
 * WHY MANUAL SYNC IS NEEDED:
 * - Data imports bypass automatic tracking
 * - Database modifications outside the application
 * - Recovery from data corruption
 * - Migration from systems without usage tracking
 * 
 * DESIGN DECISIONS:
 * - Simple single-button interface (not overwhelming)
 * - Clear explanation of what the sync does
 * - Visual feedback during operation
 * - Integration with notification system
 * 
 * FUTURE ENHANCEMENTS:
 * - Progress bar for long operations
 * - Detailed sync results (what was changed)
 * - Scheduling options (automatic sync)
 * - Selective sync (brands only, pump types only)
 * - Dry-run mode (preview changes without applying)
 */

interface UsageSyncProps {
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void
}

export default function UsageSync({ onShowNotification }: UsageSyncProps) {
  // State to prevent multiple simultaneous sync operations
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handles the manual sync trigger
   * 
   * PROCESS:
   * 1. Prevent multiple simultaneous syncs
   * 2. Show loading state to user
   * 3. Call the sync API endpoint
   * 4. Handle success/error responses
   * 5. Show appropriate notifications
   * 6. Reset loading state
   * 
   * ERROR HANDLING:
   * - Network errors (API unreachable)
   * - Server errors (sync operation failed)
   * - Timeout scenarios (long-running operations)
   * 
   * USER FEEDBACK:
   * - Loading spinner and disabled button during operation
   * - Success notification with operation details
   * - Error notification with helpful message
   */
  const handleSync = async () => {
    // Prevent multiple simultaneous sync operations
    if (isLoading) return

    setIsLoading(true)
    
    try {
      // Call the usage sync API endpoint
      const response = await fetch('/api/admin/sync-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        // Success: show positive feedback with details
        onShowNotification?.('success', result.message || 'Usage tracking synchronized successfully')
      } else {
        // API returned error status: show specific error message
        throw new Error(result.error || 'Failed to sync usage tracking')
      }
    } catch (error) {
      // Handle network errors, parsing errors, or thrown errors
      console.error('Error syncing usage:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      onShowNotification?.('error', `Failed to sync usage tracking: ${errorMessage}`)
    } finally {
      // Always reset loading state, regardless of success/failure
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Usage Tracking Sync</h3>
          <p className="text-sm text-gray-600 mt-1">
            Synchronize usage tracking data for brands and pump types based on current products.
            Use this if you notice inconsistencies in usage counts.
          </p>
          {/* Additional context for administrators */}
          <p className="text-xs text-gray-500 mt-2">
            This rebuilds the tracking data that shows which products use each brand/pump type.
            The operation scans all products and may take time with large catalogs.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isLoading}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isLoading ? (
            <>
              {/* Loading spinner - indicates operation in progress */}
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Syncing...
            </>
          ) : (
            'Sync Usage Data'
          )}
        </button>
      </div>
    </div>
  )
}
