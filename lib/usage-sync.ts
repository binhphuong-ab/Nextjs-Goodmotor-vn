import Product from '@/models/Product'
import PumpType from '@/models/PumpType'
import Brand from '@/models/Brand'
import connectToDatabase from './mongoose'
import mongoose from 'mongoose'

/**
 * USAGE TRACKING SYNCHRONIZATION UTILITIES
 * 
 * This module provides functions to synchronize usage tracking data between
 * products and their related entities (brands, pump types). Usage tracking
 * is automatically maintained during product CRUD operations, but these
 * functions can be used to rebuild the tracking data when needed.
 * 
 * WHEN TO USE:
 * - After data migration or imports
 * - When usage counts appear inconsistent
 * - After manual database modifications
 * - As part of maintenance routines
 * 
 * PERFORMANCE NOTES:
 * - These functions scan all products and can be slow with large datasets
 * - Consider running during off-peak hours for large catalogs
 * - Progress tracking could be added for very large datasets
 * 
 * FUTURE ENHANCEMENTS:
 * - Add progress callbacks for UI progress bars
 * - Implement incremental sync (only changed products)
 * - Add dry-run mode to preview changes
 * - Include detailed reporting of what was changed
 * - Add automatic scheduling/cron job support
 */

/**
 * Synchronizes usage tracking for pump types based on actual product data
 * 
 * This function rebuilds the usage tracking maps in PumpType documents:
 * - productUsage: Array of product names using this pump type
 * - subPumpTypeUsage: Map of sub pump type ID -> array of product names
 * 
 * ALGORITHM:
 * 1. Fetch all pump types from database
 * 2. For each pump type, query all products that reference it
 * 3. Rebuild productUsage array from product names
 * 4. Initialize subPumpTypeUsage map with empty arrays for all sub pump types
 * 5. Populate subPumpTypeUsage based on products' subPumpType references
 * 6. Save updated pump type document
 * 
 * @returns Promise<{success: boolean, message: string}> - Operation result
 * @throws Error if database operations fail
 */
export async function syncPumpTypeUsage() {
  await connectToDatabase()
  
  try {
    // Get all pump types - we need to process every pump type to ensure completeness
    const pumpTypes = await PumpType.find({})
    console.log(`Starting pump type usage sync for ${pumpTypes.length} pump types...`)
    
    // Process each pump type individually to avoid memory issues with large datasets
    for (const pumpType of pumpTypes) {
      // Query products using this pump type - only fetch fields we need for performance
      const products = await Product.find({ pumpType: pumpType._id }, { name: 1, subPumpType: 1 })
      
      // Update productUsage - simple array of product names
      pumpType.productUsage = products.map(product => product.name)
      
      // Reset subPumpTypeUsage - start with clean slate to avoid stale data
      const newSubPumpTypeUsage = new Map<string, string[]>()
      
      // Initialize all sub pump types with empty arrays to ensure all sub types are tracked
      // This prevents missing entries in the UI even if no products use a sub type
      if (pumpType.subPumpTypes) {
        pumpType.subPumpTypes.forEach((subType: any) => {
          newSubPumpTypeUsage.set(subType._id.toString(), [])
        })
      }
      
      // Populate usage data for each sub pump type based on actual product references
      products.forEach(product => {
        if (product.subPumpType) {
          const subPumpTypeId = product.subPumpType.toString()
          const currentUsage = newSubPumpTypeUsage.get(subPumpTypeId) || []
          currentUsage.push(product.name)
          newSubPumpTypeUsage.set(subPumpTypeId, currentUsage)
        }
      })
      
      // Save the updated usage tracking data
      pumpType.subPumpTypeUsage = newSubPumpTypeUsage
      await pumpType.save()
      
      console.log(`Synced pump type "${pumpType.pumpType}": ${products.length} products`)
    }
    
    console.log('Pump type usage sync completed successfully')
    return { success: true, message: `Usage sync completed for ${pumpTypes.length} pump types` }
  } catch (error) {
    console.error('Error syncing pump type usage:', error)
    throw error
  }
}

/**
 * Synchronizes usage tracking for brands based on actual product data
 * 
 * This function rebuilds the usage tracking maps in Brand documents:
 * - productUsage: Array of product names using this brand
 * - productLineUsage: Map of product line ID -> array of product names
 * 
 * ALGORITHM:
 * 1. Fetch all brands from database
 * 2. For each brand, query all products that reference it
 * 3. Rebuild productUsage array from product names
 * 4. Initialize productLineUsage map with empty arrays for all product lines
 * 5. Populate productLineUsage based on products' productLineId references
 * 6. Save updated brand document
 * 
 * NOTE: This mirrors the pump type sync logic but for brand-related usage tracking
 * 
 * @returns Promise<{success: boolean, message: string}> - Operation result
 * @throws Error if database operations fail
 */
export async function syncBrandUsage() {
  await connectToDatabase()
  
  try {
    // Get all brands - process every brand to ensure completeness
    const brands = await Brand.find({})
    console.log(`Starting brand usage sync for ${brands.length} brands...`)
    
    // Process each brand individually for memory efficiency
    for (const brand of brands) {
      // Query products using this brand - only fetch fields we need
      const products = await Product.find({ brand: brand._id }, { name: 1, productLineId: 1 })
      
      // Update productUsage - array of all product names for this brand
      brand.productUsage = products.map(product => product.name)
      
      // Reset productLineUsage - start fresh to avoid stale data
      const newProductLineUsage = new Map<string, string[]>()
      
      // Initialize all product lines with empty arrays to ensure complete tracking
      // This ensures UI shows all product lines even if unused
      if (brand.productLines) {
        brand.productLines.forEach((line: any) => {
          newProductLineUsage.set(line._id.toString(), [])
        })
      }
      
      // Populate usage data for each product line based on actual product references
      products.forEach(product => {
        if (product.productLineId) {
          const currentUsage = newProductLineUsage.get(product.productLineId) || []
          currentUsage.push(product.name)
          newProductLineUsage.set(product.productLineId, currentUsage)
        }
      })
      
      // Save the updated usage tracking data
      brand.productLineUsage = newProductLineUsage
      await brand.save()
      
      console.log(`Synced brand "${brand.name}": ${products.length} products`)
    }
    
    console.log('Brand usage sync completed successfully')
    return { success: true, message: `Brand usage sync completed for ${brands.length} brands` }
  } catch (error) {
    console.error('Error syncing brand usage:', error)
    throw error
  }
}

/**
 * Comprehensive sync function that updates all usage tracking
 * 
 * This is the main entry point for rebuilding all usage tracking data.
 * It combines both pump type and brand usage synchronization in the correct order.
 * 
 * USAGE SCENARIOS:
 * - Data migration: After importing products from external systems
 * - Maintenance: Weekly/monthly cleanup to ensure data consistency
 * - Troubleshooting: When usage counts don't match expectations
 * - Development: After schema changes or testing with sample data
 * 
 * EXECUTION ORDER:
 * 1. Pump type usage sync (handles pump types and sub pump types)
 * 2. Brand usage sync (handles brands and product lines)
 * 
 * The order doesn't matter functionally, but this sequence is logical.
 * 
 * ERROR HANDLING:
 * - If one sync fails, the entire operation fails (atomic-like behavior)
 * - Detailed error information is preserved from individual sync functions
 * - Database transactions are NOT used (each save() is independent)
 * 
 * @returns Promise<{success: boolean, message: string}> - Combined operation result
 * @throws Error if any sync operation fails
 */
export async function syncAllUsage() {
  try {
    console.log('Starting comprehensive usage tracking synchronization...')
    
    // Sync pump types first (arbitrary order choice)
    const pumpTypeResult = await syncPumpTypeUsage()
    
    // Sync brands second
    const brandResult = await syncBrandUsage()
    
    console.log('All usage tracking synchronization completed successfully')
    
    return { 
      success: true, 
      message: `All usage tracking synchronized successfully. ${pumpTypeResult.message}. ${brandResult.message}.`
    }
  } catch (error) {
    console.error('Error in comprehensive usage sync:', error)
    throw error
  }
}
