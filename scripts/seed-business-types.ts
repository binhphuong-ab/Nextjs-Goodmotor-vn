import { config } from 'dotenv'
import path from 'path'

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') })

import mongoose from 'mongoose'
import connectToDatabase from '@/lib/mongoose'
import BusinessType from '@/models/BusinessType'

const businessTypes = [
  {
    name: 'Machine Builder',
    slug: 'machine-builder',
    description: 'Companies that design and manufacture industrial machinery and equipment',
    category: 'manufacturing',
    displayOrder: 1
  },
  {
    name: 'Factory',
    slug: 'factory',
    description: 'Production facilities and manufacturing plants',
    category: 'manufacturing',
    displayOrder: 2
  },
  {
    name: 'Manufacturing',
    slug: 'manufacturing',
    description: 'General manufacturing companies and production facilities',
    category: 'manufacturing',
    displayOrder: 3
  },
  {
    name: 'Pharmaceutical',
    slug: 'pharmaceutical',
    description: 'Drug manufacturing and pharmaceutical companies',
    category: 'healthcare',
    displayOrder: 4
  },
  {
    name: 'Semiconductor',
    slug: 'semiconductor',
    description: 'Chip manufacturing and semiconductor companies',
    category: 'technology',
    displayOrder: 5
  },
  {
    name: 'Food Processing',
    slug: 'food-processing',
    description: 'Food and beverage processing companies',
    category: 'manufacturing',
    displayOrder: 6
  },
  {
    name: 'Chemical',
    slug: 'chemical',
    description: 'Chemical processing and specialty chemical companies',
    category: 'manufacturing',
    displayOrder: 7
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    description: 'Automotive manufacturers and parts suppliers',
    category: 'manufacturing',
    displayOrder: 8
  },
  {
    name: 'Aerospace',
    slug: 'aerospace',
    description: 'Aerospace and defense manufacturers',
    category: 'manufacturing',
    displayOrder: 9
  },
  {
    name: 'Research',
    slug: 'research',
    description: 'Research institutions, universities, and R&D facilities',
    category: 'service',
    displayOrder: 10
  },
  {
    name: 'Distributor',
    slug: 'distributor',
    description: 'Equipment distributors and resellers',
    category: 'distribution',
    displayOrder: 11
  },
  {
    name: 'Other',
    slug: 'other',
    description: 'Other business types not specifically categorized',
    category: 'other',
    displayOrder: 12
  }
]

export async function seedBusinessTypes() {
  try {
    console.log('🌱 Starting BusinessType seeding...')
    
    await connectToDatabase()
  const db = mongoose.connection.db
    
    // Check if business types already exist
    const existingCount = await BusinessType.countDocuments()
    if (existingCount > 0) {
      console.log(`📊 Found ${existingCount} existing business types, skipping seed`)
      return
    }
    
    // Insert business types
    const result = await BusinessType.insertMany(businessTypes)
    console.log(`✅ Successfully seeded ${result.length} business types`)
    
    // Log the created business types
    result.forEach((bt, index) => {
      console.log(`   ${index + 1}. ${bt.name} (${bt.category})`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding business types:', error)
    throw error
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedBusinessTypes()
    .then(() => {
      console.log('🎉 BusinessType seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 BusinessType seeding failed:', error)
      process.exit(1)
    })
} 