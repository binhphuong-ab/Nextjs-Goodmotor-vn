/**
 * Seed script to populate the database with sample brands and pump types
 * Run with: node scripts/seed-data.js
 */

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/good-motor', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// Sample brands data
const sampleBrands = [
  {
    name: 'Busch',
    slug: 'busch-vacuum',
    country: 'Germany',
    yearEstablished: 1963,
    revenue: '$1.5B+ annually',
    website: 'https://www.busch-vacuum.com',
    description: 'Leading manufacturer of vacuum pumps and systems',
    logo: 'https://example.com/busch-logo.png',
    productLines: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'R5 Series',
        description: 'Rotary vane vacuum pumps',
        isActive: true,
        displayOrder: 1
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Mink Claw',
        description: 'Dry claw vacuum pumps',
        isActive: true,
        displayOrder: 2
      }
    ],
    isActive: true
  },
  {
    name: 'Edwards',
    slug: 'edwards-vacuum',
    country: 'UK',
    yearEstablished: 1919,
    revenue: '$800M+ annually',
    website: 'https://www.edwardsvacuum.com',
    description: 'Advanced vacuum and exhaust management solutions',
    logo: 'https://example.com/edwards-logo.png',
    productLines: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'RV Series',
        description: 'Rotary vane pumps',
        isActive: true,
        displayOrder: 1
      }
    ],
    isActive: true
  },
  {
    name: 'Pfeiffer Vacuum',
    slug: 'pfeiffer-vacuum',
    country: 'Germany',
    yearEstablished: 1890,
    revenue: '$600M+ annually',
    website: 'https://www.pfeiffer-vacuum.com',
    description: 'Vacuum solutions for industry and research',
    logo: 'https://example.com/pfeiffer-logo.png',
    productLines: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'HiPace Series',
        description: 'Turbomolecular pumps',
        isActive: true,
        displayOrder: 1
      }
    ],
    isActive: true
  }
]

// Sample pump types data
const samplePumpTypes = [
  {
    pumpType: 'Rotary Vane Pump',
    slug: 'rotary-vane-pump',
    description: 'Oil-sealed rotary vane vacuum pumps for general industrial applications',
    subPumpTypes: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Single Stage',
        description: 'Single stage rotary vane pumps',
        isActive: true,
        displayOrder: 1
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Two Stage',
        description: 'Two stage rotary vane pumps for higher vacuum',
        isActive: true,
        displayOrder: 2
      }
    ],
    isActive: true
  },
  {
    pumpType: 'Dry Screw Pump',
    slug: 'dry-screw-pump',
    description: 'Oil-free dry screw vacuum pumps',
    subPumpTypes: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Standard Series',
        description: 'Standard dry screw pumps',
        isActive: true,
        displayOrder: 1
      }
    ],
    isActive: true
  },
  {
    pumpType: 'Turbomolecular Pump',
    slug: 'turbomolecular-pump',
    description: 'High vacuum turbomolecular pumps',
    subPumpTypes: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Magnetic Bearing',
        description: 'Magnetic bearing turbo pumps',
        isActive: true,
        displayOrder: 1
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Hybrid Bearing',
        description: 'Hybrid bearing turbo pumps',
        isActive: true,
        displayOrder: 2
      }
    ],
    isActive: true
  }
]

// Brand schema (simplified)
const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  country: String,
  yearEstablished: Number,
  revenue: String,
  website: String,
  description: String,
  logo: String,
  productLines: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 }
  }],
  isActive: { type: Boolean, default: true },
  productUsage: [String],
  productLineUsage: Map
}, { timestamps: true })

// PumpType schema (simplified)  
const PumpTypeSchema = new mongoose.Schema({
  pumpType: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  subPumpTypes: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 }
  }],
  isActive: { type: Boolean, default: true },
  productUsage: [String],
  subPumpTypeUsage: Map
}, { timestamps: true })

const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema)
const PumpType = mongoose.models.PumpType || mongoose.model('PumpType', PumpTypeSchema)

// Seed function
const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Clear existing data
    await Brand.deleteMany({})
    await PumpType.deleteMany({})
    console.log('🧹 Cleared existing data')
    
    // Insert sample brands
    const insertedBrands = await Brand.insertMany(sampleBrands)
    console.log(`✅ Inserted ${insertedBrands.length} brands`)
    
    // Insert sample pump types
    const insertedPumpTypes = await PumpType.insertMany(samplePumpTypes)
    console.log(`✅ Inserted ${insertedPumpTypes.length} pump types`)
    
    console.log('🎉 Database seeding completed successfully!')
    
    // Show summary
    console.log('\n📊 Summary:')
    console.log(`- Brands: ${insertedBrands.length}`)
    insertedBrands.forEach(brand => {
      console.log(`  • ${brand.name} (${brand.country}) - ${brand.productLines.length} product lines`)
    })
    console.log(`- Pump Types: ${insertedPumpTypes.length}`)
    insertedPumpTypes.forEach(pumpType => {
      console.log(`  • ${pumpType.pumpType} - ${pumpType.subPumpTypes.length} sub types`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

// Run the seed script
const main = async () => {
  await connectToDatabase()
  await seedData()
}

main().catch(console.error)
