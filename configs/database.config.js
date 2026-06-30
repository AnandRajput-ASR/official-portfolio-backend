require('dotenv').config();
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;
const connectTimeoutSeconds = Number(process.env.DB_CONNECT_TIMEOUT_SECONDS || 30);
const initRetryCount = Number(process.env.DB_INIT_RETRY_COUNT || 3);
const initRetryDelayMs = Number(process.env.DB_INIT_RETRY_DELAY_MS || 1500);

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sql = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: connectTimeoutSeconds,
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function init() {
  for (let attempt = 1; attempt <= initRetryCount; attempt += 1) {
    try {
      await sql`SET search_path TO portfolio,public`;
      return;
    } catch (err) {
      const isLastAttempt = attempt === initRetryCount;
      console.error(
        `[DB] Failed to set search_path (attempt ${attempt}/${initRetryCount}):`,
        err.message
      );

      if (isLastAttempt) return;
      await wait(initRetryDelayMs);
    }
  }
}

init();

module.exports = sql;
