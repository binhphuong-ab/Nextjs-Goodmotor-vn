import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { getDatabase } from '@/lib/mongodb'
import BusinessType from '@/models/BusinessType'
import Customer from '@/models/Customer'

async function updateBusinessTypeRelations() {
  try {
    await getDatabase()
    
    console.log('Starting business type relationship update...')
    
    // Get all business types
    const businessTypes = await BusinessType.find({})
    console.log(`Found ${businessTypes.length} business types`)
    
    // Get all customers
    const customers = await Customer.find({}, 'businessType name')
    console.log(`Found ${customers.length} customers`)
    
    // Update each business type with its customer IDs
    for (const businessType of businessTypes) {
      const customerIds = customers
        .filter(customer => customer.businessType?.toString() === businessType._id.toString())
        .map(customer => customer._id)
      
      await BusinessType.findByIdAndUpdate(
        businessType._id,
        { customerIds },
        { runValidators: false }
      )
      
      console.log(`Updated "${businessType.name}": ${customerIds.length} customers`)
      
      if (customerIds.length > 0) {
        const customerNames = customers
          .filter(customer => customer.businessType?.toString() === businessType._id.toString())
          .map(customer => customer.name)
          .join(', ')
        console.log(`  - Customers: ${customerNames}`)
      }
    }
    
    console.log('\n✅ Business type relationships updated successfully!')
    
    // Verify the updates
    console.log('\n📊 Final verification:')
    const updatedBusinessTypes = await BusinessType.find({}).populate('customerIds', 'name')
    
    for (const bt of updatedBusinessTypes) {
      const customerCount = bt.customerIds ? bt.customerIds.length : 0
      console.log(`${bt.name}: ${customerCount} customers`)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error updating business type relationships:', error)
    process.exit(1)
  }
}

// Run the update
updateBusinessTypeRelations() 