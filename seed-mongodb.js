// This is a script to set up MongoDB for the project
// Using require instead of import to ensure CommonJS compatibility
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('====== MongoDB Setup Process ======');

try {
  // First generate the Prisma client
  console.log('\n1. Generating Prisma client for MongoDB...');
  execSync('npx prisma generate', { 
    stdio: 'inherit'
  });
  
  // Then run the seed script
  console.log('\n2. Running MongoDB seed script...');
  execSync('npx ts-node prisma/mongodb-seed.ts', { 
    stdio: 'inherit', 
    env: {
      ...process.env,
      // Force CommonJS mode for ts-node
      TS_NODE_COMPILER_OPTIONS: '{"module":"CommonJS"}',
      TS_NODE_TRANSPILE_ONLY: 'true'
    }
  });
  
  console.log('\n✅ MongoDB setup completed successfully!');
  
  // Add a message about running the app
  console.log('\nYou can now run the application with:');
  console.log('npm run dev');
  
} catch (error) {
  console.error('\n❌ Error during MongoDB setup:', error.message);
  console.log('\nTroubleshooting tips:');
  console.log('1. Make sure MongoDB connection string is correct in .env file');
  console.log('2. Check that the MongoDB server is running and accessible');
  console.log('3. Verify your Prisma schema is valid for MongoDB');
  process.exit(1);
}
