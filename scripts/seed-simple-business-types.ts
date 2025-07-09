import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { getDatabase } from '@/lib/mongodb'
import BusinessType from '@/models/BusinessType'

const simpleBusinessTypes = [
  'Manufacturing',
  'Pharmaceutical',
  'Semiconductor',
  'Food Processing',
  'Chemical',
  'Automotive',
  'Aerospace',
  'Research',
  'Machine Builder',
  'Distributor',
  'Technology',
  'Other'
]

async function seedBusinessTypes() {
  try {
    await getDatabase()
    
    console.log('Starting business type seeding...')
    
    // Clear existing business types
    await BusinessType.deleteMany({})
    console.log('Cleared existing business types')
    
    // Create new business types
    const businessTypes = []
    for (const name of simpleBusinessTypes) {
      const businessType = new BusinessType({ name })
      await businessType.save()
      businessTypes.push(businessType)
      console.log(`Created: ${name}`)
    }
    
    console.log(`\n✅ Successfully created ${businessTypes.length} business types`)
    
    // Display created business types
    console.log('\nCreated business types:')
    businessTypes.forEach((bt, index) => {
      console.log(`${index + 1}. ${bt.name} (ID: ${bt._id})`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding business types:', error)
    process.exit(1)
  }
}

// Run the seeding
seedBusinessTypes() 