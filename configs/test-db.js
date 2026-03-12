require('dotenv').config({ path: '../.env' });

const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

const sql = postgres(connectionString);

async function testDB() {
  try {
    console.log('Testing DB connection...', connectionString);
    const result = await sql`SELECT NOW()`;
    console.log('DB Connected:', result);
  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await sql.end();
  }
}

testDB();
