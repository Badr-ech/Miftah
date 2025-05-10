// A simple script to test MongoDB connection (Node.js script)
/* eslint-env node */
require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB connection URL from environment variables
const url = process.env.DATABASE_URL;
console.log(`Testing MongoDB connection...`);
console.log(`Using connection URL: ${url.replace(/(mongodb(\+srv)?:\/\/[^:]+:)([^@]+)/, '$1***')}`);

// Create MongoDB client
const client = new MongoClient(url, {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
});

// Main function to test connection
async function main() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    
    // Get the database name from the connection string
    const dbName = new URL(url).pathname.substring(1) || 'miftah';
    const db = client.db(dbName);
    
    // List collections to verify connectivity
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collection(s) in database "${dbName}":`);
    collections.forEach(coll => {
      console.log(`- ${coll.name}`);
    });
    
    return 'MongoDB connection test completed successfully';
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return 'MongoDB connection test failed';
  } finally {
    await client.close();
  }
}

// Run the main function
main()
  .then(console.log)
  .catch(console.error);

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
