import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('✅ Already connected to MongoDB');
    return;
  }

  // Read MONGODB_URI at runtime, not at module load time
  const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/noteswift';
  
  console.log('🔗 Connecting to:', MONGODB_URI.substring(0, 30) + '...');

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB:', conn.connection.host);
    console.log('📊 Database:', conn.connection.db?.databaseName || 'unknown');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
