// A simple script to test MongoDB connection
const { PrismaClient } = require('./src/generated/prisma');
require('dotenv').config();

// Create a new instance of PrismaClient
const prisma = new PrismaClient({
  errorFormat: 'pretty',
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Add listener for query events (optional, for debugging)
prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
});

async function main() {
  console.log('Testing MongoDB connection...');
  console.log(`Using connection URL: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/\/\/([^@]*)@/, '//***:***@') : 'DATABASE_URL is not defined!'}`);

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
    }
    
    // Test the connection
    console.log('Attempting to connect to MongoDB...');
    await prisma.$connect();
    console.log('✅ Successfully connected to MongoDB!');

    // Try some basic queries to test functionality
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users in the database`);

    if (userCount > 0) {
      console.log('Fetching first user...');
      const firstUser = await prisma.user.findFirst({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        }
      });
      console.log('First user:', firstUser);
    }

    // Test ObjectId conversion (if any users exist)
    const { uuidToObjectId } = require('./src/lib/mongodb-helpers');
    if (userCount > 0) {
      console.log('\nTesting UUID to ObjectId conversion:');
      const testUuid = '12345678-1234-5678-1234-567812345678';
      const convertedId = uuidToObjectId(testUuid);
      console.log(`UUID ${testUuid} converts to ObjectId: ${convertedId}`);
    }

    console.log('\nMongoDB connection test completed successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
