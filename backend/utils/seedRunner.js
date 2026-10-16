const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });
const connectDB = require('../config/db');
const seedDatabase = require('./seedData');

const run = async () => {
  await connectDB();
  await seedDatabase();
  console.log('[SeedRunner] Seed execution finished.');
  process.exit(0);
};

run();
