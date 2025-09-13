// Simple script to fix the MongoDB index issue
// Run this once to remove the problematic phone_number index

const mongoose = require('mongoose');

async function fixIndex() {
    try {
        // Connect to MongoDB using the same connection string as the app
        await mongoose.connect('mongodb://localhost:27017/clsnoteswiftdb');
        console.log('Connected to MongoDB');
        
        // Get the students collection
        const db = mongoose.connection.db;
        const studentsCollection = db.collection('students');
        
        // Try to drop the phone_number_1 index
        try {
            await studentsCollection.dropIndex('phone_number_1');
            console.log('✅ Successfully dropped phone_number_1 index');
        } catch (error) {
            console.log('Index may not exist:', error.message);
        }
        
        // List remaining indexes
        const indexes = await studentsCollection.listIndexes().toArray();
        console.log('Remaining indexes:');
        indexes.forEach(idx => console.log(`  - ${idx.name}`));
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixIndex();
