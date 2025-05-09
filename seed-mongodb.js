// This is a simple wrapper script to run the MongoDB seed
// Using require instead of import to ensure CommonJS compatibility
const { execSync } = require('child_process');

console.log('Running MongoDB seed script...');

try {
  // Execute the TypeScript seed file using ts-node
  execSync('npx ts-node prisma/mongodb-seed.ts', { 
    stdio: 'inherit', 
    env: {
      ...process.env,
      // Force CommonJS mode for ts-node
      TS_NODE_COMPILER_OPTIONS: '{"module":"CommonJS"}',
      TS_NODE_TRANSPILE_ONLY: 'true'
    }
  });
  console.log('MongoDB seeding completed successfully!');
} catch (error) {
  console.error('Error seeding MongoDB database:', error.message);
  process.exit(1);
}
