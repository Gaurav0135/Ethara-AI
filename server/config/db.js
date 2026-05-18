import mongoose from 'mongoose'
import dns from 'dns'

// Configure Node.js DNS for local Windows environment to fix SRV records lookup.
// In production cloud environments like Render, use the native system DNS resolvers.
if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) {
  try {
    dns.setServers(['10.96.241.29', '8.8.8.8', '1.1.1.1'])
  } catch (error) {
    console.warn('DNS setServers warning:', error.message)
  }
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI ||
        'mongodb+srv://team-task-manager:Teamtask@cluster0.t5dzobo.mongodb.net/team-task-manager?appName=Cluster0'
    )
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
