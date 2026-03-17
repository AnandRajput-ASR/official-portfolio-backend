require('dotenv').config();
const sql = require('../configs/database.config');

(async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio.resume_meta (
        id              UUID        NOT NULL DEFAULT gen_random_uuid(),
        original_name   TEXT        NOT NULL,
        stored_name     TEXT        NOT NULL,
        size            INTEGER     NOT NULL DEFAULT 0,
        uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        single_row_lock BOOLEAN     DEFAULT true,
        CONSTRAINT resume_meta_pkey PRIMARY KEY (id),
        CONSTRAINT resume_meta_single_row_lock_key UNIQUE (single_row_lock)
      )
    `;
    console.log('✔ resume_meta table created');

    // Migrate existing meta.json if present
    const fs = require('fs');
    const path = require('path');
    const metaFile = path.join(__dirname, 'data/resume/meta.json');
    if (fs.existsSync(metaFile)) {
      const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
      await sql`
        INSERT INTO portfolio.resume_meta (original_name, stored_name, size, uploaded_at, single_row_lock)
        VALUES (${meta.originalName}, ${meta.storedName}, ${meta.size}, ${meta.uploadedAt}, true)
        ON CONFLICT (single_row_lock) DO NOTHING
      `;
      console.log('✔ Migrated existing meta.json data to DB');
    }

    await sql.end();
  } catch (e) {
    console.error('Error:', e.message);
    await sql.end();
    process.exit(1);
  }
})();
