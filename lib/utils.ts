/**
 * Utility functions for the application
 */

/**
 * Generate a URL-friendly slug from a string
 * Standardized implementation used across all admin forms
 * 
 * @param input - The string to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '')        // Remove leading/trailing hyphens
}

/**
 * Get today's date in YYYY-MM-DD format for date inputs
 * Standardized implementation used across all admin forms
 * 
 * @returns Today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

/**
 * Format validation errors into a user-friendly message
 * 
 * @param errors - Array of validation error messages or object of errors
 * @returns Formatted error message
 */
export function formatValidationErrors(errors: string[] | Record<string, string>): string {
  const errorArray = Array.isArray(errors) ? errors : Object.values(errors).filter(Boolean)
  return 'Please fix the following errors: ' + errorArray.join(', ')
}

/**
 * Common form props interface that all admin forms should extend
 */
export interface BaseFormProps {
  onShowNotification?: (type: 'success' | 'error' | 'info', message: string) => void
}

/**
 * Standard error response interface for API calls
 */
export interface ApiErrorResponse {
  error?: string
  message?: string
  details?: string | string[]
}

/**
 * Extract error message from API response with fallback
 * 
 * @param error - Error response from API
 * @param fallback - Fallback message if no error found
 * @returns User-friendly error message
 */
export function extractApiError(error: ApiErrorResponse, fallback: string = 'Unknown error'): string {
  return error.error || error.message || fallback
}

/**
 * Standard success messages for common operations
 */
export const SUCCESS_MESSAGES = {
  CREATED: (entity: string) => `${entity} added successfully!`,
  UPDATED: (entity: string) => `${entity} updated successfully!`,
  DELETED: (entity: string) => `${entity} deleted successfully!`,
} as const

/**
 * Standard error messages for common operations
 */
export const ERROR_MESSAGES = {
  CREATE_FAILED: (entity: string) => `Error adding ${entity.toLowerCase()}`,
  UPDATE_FAILED: (entity: string) => `Error updating ${entity.toLowerCase()}`,
  DELETE_FAILED: (entity: string) => `Error deleting ${entity.toLowerCase()}`,
  FETCH_FAILED: (entity: string) => `Failed to load ${entity.toLowerCase()}`,
} as const