/**
 * db-setup.js — Emergency database recovery script.
 *
 * Reads scripts/schema.sql and executes it against the DATABASE_URL
 * to recreate the entire portfolio schema from scratch.
 *
 * Usage:  npm run db:setup
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not set in .env');
    process.exit(1);
  }

  if (!fs.existsSync(SCHEMA_FILE)) {
    console.error(`❌ Schema file not found: ${SCHEMA_FILE}`);
    process.exit(1);
  }

  const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

  try {
    console.log('🔌 Connecting to database…');
    await sql`SELECT 1`;
    console.log('✅ Connected.\n');

    const schema = fs.readFileSync(SCHEMA_FILE, 'utf-8');

    console.log('🏗️  Running schema.sql — creating tables, indexes, triggers, RLS, seed data…');
    await sql.unsafe(schema);

    console.log('\n✅ Schema setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Insert your admin user (if fresh DB):');
    console.log('      INSERT INTO portfolio.admin_users (username, password_hash, email)');
    console.log("      VALUES ('admin', '<bcrypt_hash>', 'you@email.com');");
    console.log('   2. Start the server: npm run dev');
  } catch (err) {
    console.error('\n❌ Schema setup failed:', err.message);
    if (err.position) {
      const lines = fs.readFileSync(SCHEMA_FILE, 'utf-8').substring(0, parseInt(err.position)).split('\n');
      console.error(`   Near line ${lines.length} in schema.sql`);
    }
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
