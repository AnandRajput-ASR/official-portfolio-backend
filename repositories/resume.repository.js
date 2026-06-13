const sql = require('../configs/database.config');

async function getMeta() {
  const rows = await sql`
    SELECT
      original_name AS "originalName",
      stored_name   AS "storedName",
      download_name AS "downloadName",
      size,
      uploaded_at   AS "uploadedAt"
    FROM portfolio.resume_meta
    WHERE singleton_key = 'default'
    LIMIT 1
  `;
  if (rows[0]) return rows[0];

  const fallback = await sql`
    SELECT
      original_name AS "originalName",
      stored_name   AS "storedName",
      download_name AS "downloadName",
      size,
      uploaded_at   AS "uploadedAt"
    FROM portfolio.resume_meta
    LIMIT 1
  `;
  return fallback[0] || null;
}

async function upsertMeta({ originalName, storedName, size }) {
  const rows = await sql`
    INSERT INTO portfolio.resume_meta (original_name, stored_name, size, uploaded_at, single_row_lock, singleton_key)
    VALUES (${originalName}, ${storedName}, ${size}, now(), true, 'default')
    ON CONFLICT (single_row_lock)
    DO UPDATE SET
      original_name = EXCLUDED.original_name,
      stored_name   = EXCLUDED.stored_name,
      size          = EXCLUDED.size,
      uploaded_at   = now(),
      singleton_key = 'default'
    RETURNING
      original_name AS "originalName",
      stored_name   AS "storedName",
      download_name AS "downloadName",
      size,
      uploaded_at   AS "uploadedAt"
  `;
  return rows[0];
}

async function updateDownloadName(downloadName) {
  const rows = await sql`
    UPDATE portfolio.resume_meta
    SET download_name = ${downloadName || null}
    WHERE singleton_key = 'default'
    RETURNING
      original_name AS "originalName",
      stored_name   AS "storedName",
      download_name AS "downloadName",
      size,
      uploaded_at   AS "uploadedAt"
  `;
  if (rows[0]) return rows[0];

  const fallback = await sql`
    UPDATE portfolio.resume_meta
    SET download_name = ${downloadName || null}
    WHERE single_row_lock = true
    RETURNING
      original_name AS "originalName",
      stored_name   AS "storedName",
      download_name AS "downloadName",
      size,
      uploaded_at   AS "uploadedAt"
  `;
  return fallback[0] || null;
}

async function deleteMeta() {
  const deleted = await sql`
    DELETE FROM portfolio.resume_meta
    WHERE singleton_key = 'default'
    RETURNING id
  `;
  if (deleted.length > 0) return;

  await sql`
    DELETE FROM portfolio.resume_meta
    WHERE single_row_lock = true
  `;
}

module.exports = { getMeta, upsertMeta, updateDownloadName, deleteMeta };
