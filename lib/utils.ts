/**
 * Utility functions for the application
 */

/**
 * Generate a URL-friendly slug from a string
 * Standardized implementation used across all admin forms
 * Supports Vietnamese characters by properly handling accents and special characters
 * 
 * @param input - The string to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')                     // separate accents from characters
    .replace(/[\u0300-\u036f]/g, '')      // remove accent marks
    .replace(/đ/g, 'd')                   // Vietnamese: đ → d
    .replace(/[^a-z0-9\s-]/g, '')         // remove non-alphanumeric chars
    .trim()
    .replace(/\s+/g, '-')                 // replace spaces with hyphens
    .replace(/-+/g, '-')                  // collapse multiple hyphens
    .replace(/^-|-$/g, '')                // remove leading/trailing hyphens
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
 * Validate image URL or path
 * Supports both absolute URLs and relative/absolute paths
 * Used across all admin forms for consistent image validation
 * 
 * @param imagePath - The image path or URL to validate
 * @param options - Optional configuration
 * @returns Validation result with error message if invalid
 */
export function validateImageUrl(
  imagePath: string, 
  options: { 
    context?: string; 
    allowEmpty?: boolean;
    supportedFormats?: string[];
  } = {}
): { isValid: boolean; error?: string } {
  const { 
    context = 'Image', 
    allowEmpty = true,
    supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  } = options
  
  // Handle empty/undefined values
  if (!imagePath || !imagePath.trim()) {
    return allowEmpty 
      ? { isValid: true } 
      : { isValid: false, error: `${context} is required` }
  }
  
  const imageValue = imagePath.trim()
  
  // Create format pattern based on supported formats
  const formatsPattern = supportedFormats.join('|')
  
  // Validation patterns
  const urlPattern = /^https?:\/\/.+/
  const relativePathPattern = new RegExp(`^[^\\/].+\\.(${formatsPattern})$`, 'i')
  const absolutePathPattern = new RegExp(`^\\/[^\\/].+\\.(${formatsPattern})$`, 'i')
  
  // Check if matches any valid pattern
  if (urlPattern.test(imageValue) || 
      relativePathPattern.test(imageValue) || 
      absolutePathPattern.test(imageValue)) {
    return { isValid: true }
  }
  
  return {
    isValid: false,
    error: `${context} must be a valid URL or path to an image file (${supportedFormats.join(', ')})`
  }
}

/**
 * Legacy function - maintained for backward compatibility
 * @deprecated Use validateImageUrl instead
 */
export function validateImagePath(imagePath: string, context: string = 'Image'): { isValid: boolean; normalizedPath: string; error?: string } {
  const result = validateImageUrl(imagePath, { context, allowEmpty: true })
  return {
    isValid: result.isValid,
    normalizedPath: imagePath?.trim() || '',
    error: result.error
  }
}

/**
 * Get full image URL for display
 * Handles both absolute URLs and relative paths
 * 
 * @param imagePath - The image path (can be URL or relative path)
 * @param baseUrl - Base URL for relative paths (optional, defaults to current origin)
 * @returns Full URL for the image
 */
export function getImageUrl(imagePath: string, baseUrl?: string): string {
  if (!imagePath) return ''
  
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // For relative paths, prepend base URL or current origin
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  
  // Ensure proper path formatting
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  
  return `${base}${normalizedPath}`
}

/**
 * Image validation constants used across the application
 */
export const IMAGE_VALIDATION = {
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  PATTERNS: {
    URL: /^https?:\/\/.+/,
    RELATIVE_PATH: /^[^\/].+\.(jpg|jpeg|png|gif|webp|svg)$/i,
    ABSOLUTE_PATH: /^\/[^\/].+\.(jpg|jpeg|png|gif|webp|svg)$/i
  },
  MESSAGES: {
    INVALID_FORMAT: (context: string, formats: string[]) => 
      `${context} must be a valid URL or path to an image file (${formats.join(', ')})`,
    REQUIRED: (context: string) => `${context} is required`,
    LOAD_ERROR: '⚠️ Unable to load image. Please check the URL or path.'
  }
} as const

/**
 * Create image validation function with custom context
 * Useful for creating reusable validators for specific form fields
 * 
 * @param context - Context for error messages (e.g., 'Pump type image', 'Product image')
 * @param options - Validation options
 * @returns Validation function that takes image URL and returns error message or null
 */
export function createImageValidator(
  context: string, 
  options: { allowEmpty?: boolean; supportedFormats?: string[] } = {}
) {
  return (imageUrl: string): string | null => {
    const result = validateImageUrl(imageUrl, { context, ...options })
    return result.isValid ? null : result.error || `Invalid ${context.toLowerCase()}`
  }
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