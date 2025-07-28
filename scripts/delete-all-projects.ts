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
const ProjectSchema = new mongoose.Schema({}, { strict: false })
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema)

async function deleteAllProjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI as string)
    console.log('Connected to MongoDB')

    // Delete all projects
    const result = await Project.deleteMany({})
    console.log(`Successfully deleted ${result.deletedCount} projects`)

    // Disconnect from MongoDB
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
    
    process.exit(0)
  } catch (error) {
    console.error('Error deleting projects:', error)
    process.exit(1)
  }
}

// Run the script
deleteAllProjects() 