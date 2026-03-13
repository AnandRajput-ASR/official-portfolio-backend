require('dotenv').config({ path: '../.env' });

const sql = require('../configs/database.config');

async function run() {
  try {
    console.log('Testing database connection...');

    const schema = await sql`SHOW search_path`;
    console.log(schema);
    
    const result = await sql`
      SELECT id, email
      FROM portfolio.admin_users
    `;

    console.log('Query Result:');
    console.table(result);

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();