// A script to encode a MongoDB Atlas connection string properly
require('dotenv').config();

// Install dotenv if needed
try {
  require('dotenv');
} catch (e) {
  console.log('Installing dotenv package...');
  require('child_process').execSync('npm install --no-save dotenv');
  require('dotenv').config();
}

function encodeMongoURI() {
  // Get the connection string from .env
  const uri = process.env.DATABASE_URL;
  
  if (!uri) {
    console.error('❌ No DATABASE_URL found in your .env file');
    process.exit(1);
  }
  
  console.log('Original connection string:');
  console.log(uri);
  console.log('');
  
  // Extract parts
  try {
    // Parse the connection URI
    const regex = /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?/;
    const match = uri.match(regex);
    
    if (!match) {
      console.error('❌ Connection string format not recognized');
      process.exit(1);
    }
    
    const protocol = match[1] ? 'mongodb+srv' : 'mongodb';
    const username = match[2];
    const password = match[3];
    const host = match[4];
    const database = match[5];
    const params = match[6] || '';
    
    // Encode the username and password correctly
    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);
    
    const newUri = `${protocol}://${encodedUsername}:${encodedPassword}@${host}/${database}${params}`;
    
    console.log('Properly encoded connection string:');
    console.log(newUri);
    console.log('');
    
    if (uri !== newUri) {
      console.log('⚠️  Your connection string needed encoding!');
      console.log('Copy the encoded string above into your .env file and GitHub secrets.');
    } else {
      console.log('✅ Your connection string was already properly encoded.');
    }
  } catch (error) {
    console.error('Error processing connection string:', error);
  }
}

encodeMongoURI();
