const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  // Get connection string from .env file or use provided argument
  const uri = process.env.DATABASE_URL;
  
  if (!uri) {
    console.error('❌ No DATABASE_URL environment variable found.');
    console.error('Make sure you have a .env file with DATABASE_URL or pass it as an environment variable.');
    return false;
  }
  
  console.log(`Connection string format: ${uri.startsWith('mongodb+srv://') ? '✅ Looks like Atlas' : '⚠️ Not using Atlas'}`);
  
  try {
    console.log('Attempting to connect to MongoDB...');
    const client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Successfully connected to MongoDB!");
    
    // Try to get database info
    const adminDb = client.db("admin");
    const result = await adminDb.command({ ping: 1 });
    console.log("✅ Database responded to ping:", result);
    
    // List available databases
    const dbs = await client.db().admin().listDatabases();
    console.log("✅ Available databases:", dbs.databases.map(db => db.name).join(', '));
    
    await client.close();
    return true;
  } catch (error) {
    console.error("❌ Connection failed:", error);
    console.error("\nTroubleshooting tips:");
    console.error("1. Check if your MongoDB Atlas IP access list includes 0.0.0.0/0 (allows all IPs)");
    console.error("2. Verify your username and password are correct");
    console.error("3. Make sure special characters in password are URL encoded");
    console.error("4. Check if your Atlas cluster is active (not paused)");
    return false;
  }
}

// Install dotenv if needed
try {
  require('dotenv');
} catch (e) {
  console.log('Installing dotenv package...');
  require('child_process').execSync('npm install --no-save dotenv');
  require('dotenv').config();
}

testConnection()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
