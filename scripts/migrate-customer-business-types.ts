import { config } from 'dotenv'
import path from 'path'

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') })

import mongoose from 'mongoose'
import connectToDatabase from '@/lib/mongoose'
import Customer from '@/models/Customer'
import BusinessType from '@/models/BusinessType'

async function migrateCustomerBusinessTypes() {
  try {
    console.log('🔄 Starting Customer BusinessType migration...')
    
    await connectToDatabase()
    const db = mongoose.connection.db
    
    // Fetch all business types to create mapping
    const businessTypes = await BusinessType.find({})
    console.log(`📊 Found ${businessTypes.length} business types`)
    
    // Create mapping from old slug values to new ObjectId values
    const slugToIdMapping: { [key: string]: string } = {}
    businessTypes.forEach(bt => {
      slugToIdMapping[bt.slug] = bt._id.toString()
    })
    
    console.log('🗺️  Business Type Mapping:')
    Object.entries(slugToIdMapping).forEach(([slug, id]) => {
      console.log(`   ${slug} → ${id}`)
    })
    
    // Fetch all customers
    const customers = await Customer.find({})
    console.log(`👥 Found ${customers.length} customers to migrate`)
    
    let migratedCount = 0
    let skippedCount = 0
    let errorCount = 0
    
    for (const customer of customers) {
      try {
        const currentBusinessType = customer.businessType.toString()
        
        // Check if it's already an ObjectId (24 characters hex)
        if (currentBusinessType.length === 24 && /^[0-9a-fA-F]{24}$/.test(currentBusinessType)) {
          console.log(`   ⏭️  Skipping ${customer.name} - already migrated`)
          skippedCount++
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
        } else {
          console.log(`   ⚠️  Unknown business type for ${customer.name}: ${currentBusinessType}`)
          errorCount++
        }
      } catch (error) {
        console.error(`   ❌ Error migrating ${customer.name}:`, error)
        errorCount++
      }
    }
    
    console.log('\n📈 Migration Summary:')
    console.log(`   ✅ Migrated: ${migratedCount}`)
    console.log(`   ⏭️  Skipped (already migrated): ${skippedCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📊 Total: ${customers.length}`)
    
    if (migratedCount > 0) {
      console.log('\n🎉 Migration completed successfully!')
    } else {
      console.log('\n💡 No migration needed - all customers already up to date')
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    throw error
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateCustomerBusinessTypes()
    .then(() => {
      console.log('🏁 Customer BusinessType migration finished')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Customer BusinessType migration failed:', error)
      process.exit(1)
    })
}

export { migrateCustomerBusinessTypes } 