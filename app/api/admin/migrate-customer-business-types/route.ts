import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import Customer from '@/models/Customer'
import BusinessType from '@/models/BusinessType'

export async function POST() {
  try {
    console.log('🔄 Starting Customer BusinessType migration...')
    
    const db = await getDatabase()
    
    // Fetch all business types to create mapping
    const businessTypes = await BusinessType.find({})
    console.log(`📊 Found ${businessTypes.length} business types`)
    
    // Create mapping from old slug values to new ObjectId values
    const slugToIdMapping: { [key: string]: string } = {}
    businessTypes.forEach(bt => {
      slugToIdMapping[bt.slug] = bt._id.toString()
    })
    
    console.log('🗺️  Business Type Mapping:', slugToIdMapping)
    
    // Fetch all customers
    const customers = await Customer.find({})
    console.log(`👥 Found ${customers.length} customers to migrate`)
    
    let migratedCount = 0
    let skippedCount = 0
    let errorCount = 0
    const migrationResults: any[] = []
    
    for (const customer of customers) {
      try {
        const currentBusinessType = customer.businessType.toString()
        
        // Check if it's already an ObjectId (24 characters hex)
        if (currentBusinessType.length === 24 && /^[0-9a-fA-F]{24}$/.test(currentBusinessType)) {
          console.log(`   ⏭️  Skipping ${customer.name} - already migrated`)
          skippedCount++
          migrationResults.push({
            customer: customer.name,
            status: 'skipped',
            reason: 'already migrated',
            businessType: currentBusinessType
          })
          continue
        }
        
        // Find the new ObjectId for this business type
        const newBusinessTypeId = slugToIdMapping[currentBusinessType]
        
        if (newBusinessTypeId) {
          await Customer.findByIdAndUpdate(
            customer._id,
            { businessType: newBusinessTypeId },
            { runValidators: false } // Skip validation during migration
          )
          console.log(`   ✅ Migrated ${customer.name}: ${currentBusinessType} → ${newBusinessTypeId}`)
          migratedCount++
          migrationResults.push({
            customer: customer.name,
            status: 'migrated',
            oldBusinessType: currentBusinessType,
            newBusinessType: newBusinessTypeId
          })
        } else {
          console.log(`   ⚠️  Unknown business type for ${customer.name}: ${currentBusinessType}`)
          errorCount++
          migrationResults.push({
            customer: customer.name,
            status: 'error',
            reason: 'unknown business type',
            businessType: currentBusinessType
          })
        }
      } catch (error) {
        console.error(`   ❌ Error migrating ${customer.name}:`, error)
        errorCount++
        migrationResults.push({
          customer: customer.name,
          status: 'error',
          reason: 'migration error',
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
    
    const summary = {
      migrated: migratedCount,
      skipped: skippedCount,
      errors: errorCount,
      total: customers.length
    }
    
    console.log('📈 Migration Summary:', summary)
    
    return NextResponse.json({
      success: true,
      message: 'Customer BusinessType migration completed',
      summary,
      results: migrationResults
    }, { status: 200 })
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 