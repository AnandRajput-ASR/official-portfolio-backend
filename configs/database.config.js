require('dotenv').config();
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

async function init() {
  try {
    await sql`SET search_path TO portfolio,public`;
  } catch (err) {
    console.error('[DB] Failed to set search_path:', err.message);
  }
}

init();

module.exports = sql;
