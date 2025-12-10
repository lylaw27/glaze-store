require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'Set' : 'Not set');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('\nTesting Supabase database connection...');
    console.log('Attempting to connect...');
    
    // Test the connection by executing a simple query
    await prisma.$connect();
    console.log('✓ Successfully connected to Supabase database!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT current_database(), version()`;
    console.log('✓ Query executed successfully');
    console.log('Database info:', result);
    
    await prisma.$disconnect();
    console.log('✓ Connection closed successfully');
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if the database server is accessible');
    console.error('2. Verify your credentials are correct');
    console.error('3. Check if your IP is allowed in Supabase');
    console.error('4. Try using DIRECT_URL instead of DATABASE_URL');
    process.exit(1);
  }
}

testConnection();
