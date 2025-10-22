import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  // Get MONGODB_URI at runtime, not at module load time
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/noteswift';
  
  // If already connected, verify we're on the right database
  if (isConnected && mongoose.connection.readyState === 1) {
    const currentDb = mongoose.connection.name;
    const targetDb = MONGODB_URI.split('/').pop()?.split('?')[0];
    
    if (currentDb !== targetDb) {
      console.log(`⚠️  Connected to wrong database: ${currentDb}, expected: ${targetDb}`);
      console.log('🔄 Disconnecting and reconnecting...');
      await mongoose.disconnect();
      isConnected = false;
    } else {
      console.log('✅ Already connected to MongoDB');
      return;
    }
  }

  try {
    console.log('🔗 Connecting to:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
    const conn = await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB:', conn.connection.host);
    console.log('✅ Database:', conn.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
