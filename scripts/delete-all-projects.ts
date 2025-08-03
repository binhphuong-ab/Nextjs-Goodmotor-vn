import mongoose from 'mongoose'
import dotenv from 'dotenv'
import connectToDatabase from '@/lib/mongoose'

// Load environment variables
dotenv.config()

// Define the Project schema directly in this script to avoid import issues
const ProjectSchema = new mongoose.Schema({}, { strict: false })
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema)

async function deleteAllProjects() {
  try {
      // Connect to MongoDB
  await connectToDatabase()
  console.log('Connected to MongoDB')

    // Delete all projects
    const result = await Project.deleteMany({})
    console.log(`Successfully deleted ${result.deletedCount} projects`)

    // Close database connection
    process.exit(0)
  } catch (error) {
    console.error('Error deleting projects:', error)
    process.exit(1)
  }
}

// Run the script
deleteAllProjects() 