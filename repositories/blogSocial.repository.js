const crypto = require('crypto');
const sql = require('../configs/database.config');

function clampCount(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  if (numeric < 0) return 0;
  return Math.trunc(numeric);
}

async function ensureStatsRow(tx, slug) {
  await tx`
    INSERT INTO portfolio.blog_post_social_stats (post_slug)
    VALUES (${slug})
    ON CONFLICT (post_slug) DO NOTHING
  `;
}

async function getPostExists(tx, slug) {
  const rows = await tx`
    SELECT slug
    FROM portfolio.blog_posts
    WHERE slug = ${slug}
      AND is_active = true
      AND COALESCE(is_deleted, false) = false
    LIMIT 1
  `;

  return Boolean(rows[0]);
}

async function getComments(tx, slug) {
  return await tx`
    SELECT
      id::text AS id,
      name,
      message,
      created_at AS "createdAt"
    FROM portfolio.blog_post_comments
    WHERE post_slug = ${slug}
      AND moderation_status = 'visible'
    ORDER BY created_at DESC, id DESC
  `;
}

async function getState(tx, slug, visitorId) {
  const statsRows = await tx`
    SELECT
      GREATEST(0, COALESCE(likes_count, 0))::int AS likes,
      GREATEST(0, COALESCE(shares_count, 0))::int AS shares
    FROM portfolio.blog_post_social_stats
    WHERE post_slug = ${slug}
    LIMIT 1
  `;

  const viewerRows = await tx`
    SELECT EXISTS (
      SELECT 1
      FROM portfolio.blog_post_reactions
      WHERE post_slug = ${slug}
        AND visitor_id = ${visitorId}
        AND liked = true
    ) AS "viewerLiked"
  `;

  const comments = await getComments(tx, slug);
  const stats = statsRows[0] || { likes: 0, shares: 0 };

  return {
    slug,
    likes: clampCount(stats.likes),
    shares: clampCount(stats.shares),
    viewerLiked: Boolean(viewerRows[0]?.viewerLiked),
    comments,
  };
}

async function getSocialStateBySlug(slug, visitorId) {
  return await sql.begin(async (tx) => {
    const exists = await getPostExists(tx, slug);
    if (!exists) return null;

    await ensureStatsRow(tx, slug);
    return await getState(tx, slug, visitorId);
  });
}

async function toggleLikeBySlug(slug, visitorId) {
  return await sql.begin(async (tx) => {
    const exists = await getPostExists(tx, slug);
    if (!exists) return null;

    await ensureStatsRow(tx, slug);

    const removed = await tx`
      DELETE FROM portfolio.blog_post_reactions
      WHERE post_slug = ${slug}
        AND visitor_id = ${visitorId}
        AND liked = true
      RETURNING visitor_id
    `;

    if (removed.length > 0) {
      await tx`
        UPDATE portfolio.blog_post_social_stats
        SET likes_count = GREATEST(0, likes_count - 1),
            updated_at = now()
        WHERE post_slug = ${slug}
      `;
    } else {
      const inserted = await tx`
        INSERT INTO portfolio.blog_post_reactions (post_slug, visitor_id, liked)
        VALUES (${slug}, ${visitorId}, true)
        ON CONFLICT (post_slug, visitor_id)
        DO UPDATE SET liked = true, updated_at = now()
        WHERE portfolio.blog_post_reactions.liked = false
        RETURNING visitor_id
      `;

      if (inserted.length > 0) {
        await tx`
          UPDATE portfolio.blog_post_social_stats
          SET likes_count = likes_count + 1,
              updated_at = now()
          WHERE post_slug = ${slug}
        `;
      }
    }

    return await getState(tx, slug, visitorId);
  });
}

async function createCommentBySlug(slug, payload, visitorId) {
  return await sql.begin(async (tx) => {
    const exists = await getPostExists(tx, slug);
    if (!exists) return null;

    await ensureStatsRow(tx, slug);

    await tx`
      INSERT INTO portfolio.blog_post_comments (id, post_slug, name, message)
      VALUES (${crypto.randomUUID()}, ${slug}, ${payload.name}, ${payload.message})
    `;

    return await getState(tx, slug, visitorId);
  });
}

async function incrementShareBySlug(slug, visitorId) {
  return await sql.begin(async (tx) => {
    const exists = await getPostExists(tx, slug);
    if (!exists) return null;

    await ensureStatsRow(tx, slug);

    await tx`
      UPDATE portfolio.blog_post_social_stats
      SET shares_count = shares_count + 1,
          updated_at = now()
      WHERE post_slug = ${slug}
    `;

    return await getState(tx, slug, visitorId);
  });
}

module.exports = {
  getSocialStateBySlug,
  toggleLikeBySlug,
  createCommentBySlug,
  incrementShareBySlug,
};
