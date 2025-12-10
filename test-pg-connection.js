require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL.replace(/^"(.*)"$/, '$1');

console.log('Connection string (redacted):', connectionString.replace(/:[^@]+@/, ':****@'));

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('\nAttempting to connect to PostgreSQL...');
    await client.connect();
    console.log('✓ Successfully connected!');
    
    const res = await client.query('SELECT current_database(), version()');
    console.log('✓ Query executed successfully');
    console.log('Database:', res.rows[0].current_database);
    console.log('Version:', res.rows[0].version.substring(0, 50) + '...');
    
    await client.end();
    console.log('✓ Connection closed');
  } catch (error) {
    console.error('✗ Connection failed');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    process.exit(1);
  }
}

testConnection();
