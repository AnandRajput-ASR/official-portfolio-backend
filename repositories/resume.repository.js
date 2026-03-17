const sql = require('../configs/database.config');

async function getMeta() {
  const rows = await sql`
    SELECT
      original_name AS "originalName",
      stored_name   AS "storedName",
      size,
      uploaded_at   AS "uploadedAt"
    FROM portfolio.resume_meta
    LIMIT 1
  `;
  return rows[0] || null;
}

async function upsertMeta({ originalName, storedName, size }) {
  const rows = await sql`
    INSERT INTO portfolio.resume_meta (original_name, stored_name, size, uploaded_at, single_row_lock)
    VALUES (${originalName}, ${storedName}, ${size}, now(), true)
    ON CONFLICT (single_row_lock)
    DO UPDATE SET
      original_name = EXCLUDED.original_name,
      stored_name   = EXCLUDED.stored_name,
      size          = EXCLUDED.size,
      uploaded_at   = now()
    RETURNING
      original_name AS "originalName",
      stored_name   AS "storedName",
      size,
      uploaded_at   AS "uploadedAt"
  `;
  return rows[0];
}

async function deleteMeta() {
  await sql`DELETE FROM portfolio.resume_meta`;
}

module.exports = { getMeta, upsertMeta, deleteMeta };
