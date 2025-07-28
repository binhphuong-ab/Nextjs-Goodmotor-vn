import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not defined')
  process.exit(1)
}

// Define the Project schema directly in this script to avoid import issues
const ProjectSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  client: String,
  location: String,
  completionDate: Date,
  projectType: String,
  pumpTypes: [String],
  images: [String],
  specifications: {
    flowRate: String,
    vacuumLevel: String,
    power: String,
    quantity: String
  },
  challenges: String,
  solutions: String,
  results: String,
  featured: Boolean,
  status: String
}, { 
  timestamps: true,
  strict: false 
})

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema)

async function createSampleProject() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI as string)
    console.log('Connected to MongoDB')

    // Sample project data (without industry field)
    const sampleProject = {
      title: "Pharmaceutical Vacuum System Upgrade",
      slug: "pharmaceutical-vacuum-system-upgrade",
      description: "<p>Comprehensive upgrade of vacuum systems for a leading pharmaceutical manufacturing facility, improving production efficiency and product quality.</p>",
      client: "PharmaLabs Inc.",
      location: "Boston, MA",
      completionDate: new Date("2023-06-15"),
      projectType: "system-upgrade",
      pumpTypes: ["rotary-vane", "liquid-ring"],
      images: [
        "https://example.com/images/pharma-project1.jpg",
        "https://example.com/images/pharma-project2.jpg"
      ],
      specifications: {
        flowRate: "1200 CFM",
        vacuumLevel: "10^-2 mbar",
        power: "75 kW",
        quantity: "6 units"
      },
      challenges: "<p>The client faced significant downtime due to aging vacuum equipment and inconsistent vacuum levels affecting product quality.</p>",
      solutions: "<p>We designed and implemented a redundant vacuum system with modern rotary vane and liquid ring pumps, complete with advanced monitoring and control systems.</p>",
      results: "<p>The upgrade resulted in a 30% reduction in energy consumption, 25% increase in production throughput, and virtual elimination of vacuum-related quality issues.</p>",
      featured: true,
      status: "completed"
    }

    // Create the project in MongoDB
    const newProject = new Project(sampleProject)
    const savedProject = await newProject.save()
    
    console.log('Created sample project:')
    console.log(JSON.stringify(savedProject.toObject(), null, 2))

    // Disconnect from MongoDB
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
    
    process.exit(0)
  } catch (error) {
    console.error('Error creating sample project:', error)
    process.exit(1)
  }
}

// Run the script
createSampleProject() 