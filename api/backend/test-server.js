import dotenv from 'dotenv';
import database from './src/database/connection.js';

// Load environment variables
dotenv.config();

console.log('🧪 Testing backend server...');

// Test database connection
async function testDatabase() {
  try {
    console.log('Testing database connection...');
    await database.connect();
    console.log('Database connection successful');
    
    const status = database.getConnectionStatus();
    console.log('Database status:', status);
    
    await database.disconnect();
    console.log('Database disconnection successful');
  } catch (error) {
    console.error('Database test failed:', error.message);
  }
}

// Test server startup
async function testServer() {
  try {
    console.log('Testing server startup...');
    
    // Import the app
    const app = await import('./src/index.js');
    console.log('Server import successful');
    
    // Wait a bit for server to start
    setTimeout(() => {
      console.log('Server startup test completed');
      process.exit(0);
    }, 2000);
    
  } catch (error) {
    console.error('Server test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
async function runTests() {
  console.log('=' * 50);
  console.log('BACKEND SERVER TEST');
  console.log('=' * 50);
  
  await testDatabase();
  await testServer();
}

runTests().catch(console.error);
