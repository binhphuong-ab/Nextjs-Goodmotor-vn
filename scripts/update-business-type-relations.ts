import mongoose from 'mongoose'
import connectToDatabase from '@/lib/mongoose'
import BusinessType from '../models/BusinessType'
import Customer from '../models/Customer'

async function updateBusinessTypeRelations() {
  try {
    await connectToDatabase()
    
    console.log('Starting BusinessType relations update...')
    
    // Get all business types
    const businessTypes = await BusinessType.find({})
    
    for (const businessType of businessTypes) {
      // Get customers that reference this business type using virtual field
      const customers = await Customer.find({ businessType: businessType._id })
      
      console.log(`Processing "${businessType.name}": Found ${customers.length} customers`)
      
      if (customers.length > 0) {
        const customerNames = customers.map(c => c.name).join(', ')
        console.log(`  Customers: ${customerNames}`)
      }
    }
    
    // Test virtual field population
    console.log('\nTesting virtual field population...')
    const businessTypesWithCustomers = await BusinessType.find({})
      .populate({
        path: 'customers',
        select: 'name slug'
      })
    
    businessTypesWithCustomers.forEach(bt => {
      const customerCount = bt.customers ? bt.customers.length : 0
      console.log(`"${bt.name}": ${customerCount} customers`)
      
      if (customerCount > 0) {
        const customerNames = (bt.customers as any[]).map(c => c.name).join(', ')
        console.log(`  Customers: ${customerNames}`)
      }
    })
    
    console.log('\nBusinessType relations update completed successfully!')
    
  } catch (error) {
    console.error('Error updating BusinessType relations:', error)
    throw error
  }
}

// Run the update
updateBusinessTypeRelations() 
  .then(() => {
    console.log('Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 