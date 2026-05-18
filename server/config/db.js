import mongoose from 'mongoose'
import dns from 'dns'

// Configure Node.js DNS to use the working system DNS resolvers for SRV records
dns.setServers(['10.96.241.29', '8.8.8.8', '1.1.1.1'])

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
