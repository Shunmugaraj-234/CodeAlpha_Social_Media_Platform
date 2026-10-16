const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pulse_db';
  try {
    // Attempt standard MongoDB connection first with short timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] Connected to MongoDB at ${uri}`);
  } catch (err) {
    console.log('[Database] Local MongoDB not detected, launching MongoMemoryServer fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to In-Memory MongoDB Server at ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Memory server connection error:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
