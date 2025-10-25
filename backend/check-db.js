const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkDB() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('clsnoteswiftdb');

    const unlockCodes = await db.collection('unlockcodes').find({}).toArray();
    console.log('Unlock codes found:', unlockCodes.length);

    const enrollments = await db.collection('courseenrollments').find({}).toArray();
    console.log('Enrollments found:', enrollments.length);

    if (unlockCodes.length > 0) {
      console.log('Sample unlock code:', {
        id: unlockCodes[0]._id,
        courseId: unlockCodes[0].courseId,
        isUsed: unlockCodes[0].isUsed,
        codeHash: unlockCodes[0].codeHash ? unlockCodes[0].codeHash.substring(0, 20) + '...' : 'N/A'
      });
    }

    if (enrollments.length > 0) {
      console.log('Sample enrollment:', {
        id: enrollments[0]._id,
        courseId: enrollments[0].courseId,
        studentId: enrollments[0].studentId,
        enrolledAt: enrollments[0].enrolledAt
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkDB();