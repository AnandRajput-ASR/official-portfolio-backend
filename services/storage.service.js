/**
 * Storage service — wraps Supabase Storage for resume operations.
 *
 * Required setup (one-time, in Supabase Dashboard):
 *   1. Go to Storage → New Bucket
 *   2. Name: "resume"  |  Public: OFF (we serve via signed URLs)
 *   3. No RLS policy needed — backend uses service-role key which bypasses RLS
 */
const supabase = require('../configs/supabase');

const BUCKET = 'resume';

/**
 * Upload a PDF buffer to the resume bucket.
 * Overwrites any file with the same storedName (upsert: true).
 * @param {Buffer} buffer
 * @param {string} storedName  e.g. "resume_1742123456789.pdf"
 * @returns {Promise<string>}  the stored path
 */
async function uploadResume(buffer, storedName) {
  if (!supabase) throw new Error('[Storage] Supabase not configured. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.');

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storedName, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) throw new Error(`[Storage] Upload failed: ${error.message}`);
  return storedName;
}

/**
 * Generate a short-lived signed URL for downloading the resume.
 * Passing `download` makes Supabase add Content-Disposition: attachment so the
 * browser downloads the file instead of opening it inline.
 * @param {string} storedName
 * @param {string} originalName  — shown as the filename in the browser save dialog
 * @param {number} expiresIn  seconds (default 120s)
 * @returns {Promise<string>}  signed URL
 */
async function getSignedUrl(storedName, originalName, expiresIn = 120) {
  if (!supabase) throw new Error('[Storage] Supabase not configured.');

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storedName, expiresIn, {
      download: originalName || true, // true = use storedName, string = custom filename
    });

  if (error) throw new Error(`[Storage] Signed URL failed: ${error.message}`);
  return data.signedUrl;
}

/**
 * Delete a resume file from the bucket.
 * Silently ignores "not found" errors (idempotent).
 * @param {string} storedName
 */
async function deleteResume(storedName) {
  if (!supabase) return;

  const { error } = await supabase.storage.from(BUCKET).remove([storedName]);
  if (error && !error.message.includes('Not Found')) {
    console.error(`[Storage] Delete failed for ${storedName}:`, error.message);
  }
}

module.exports = { uploadResume, getSignedUrl, deleteResume };
