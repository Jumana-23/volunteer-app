const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // MongoDB connection string - using local MongoDB by default
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteer_management';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed through app termination');
      } catch (error) {
        console.log('MongoDB was not connected');
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    
    // If MongoDB is not running locally, provide helpful message
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB Connection Tips:');
      console.log('1. Make sure MongoDB is installed and running locally');
      console.log('2. Start MongoDB with: mongod');
      console.log('3. Or use MongoDB Atlas cloud database');
      console.log('4. Set MONGODB_URI environment variable if using custom connection\n');
    }
    
    console.log('⚠️  Running without MongoDB - some features may not work');
    // Don't exit the process, allow server to run without MongoDB
  }
};

module.exports = connectDB;