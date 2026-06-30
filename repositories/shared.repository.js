/**
 * Shared read-only repository for portfolio content queries.
 * Used by both content (public) and admin (authenticated) services
 * to avoid duplicating identical SQL queries.
 */
const sql = require('../configs/database.config');
const { normaliseCompanyBadge } = require('../utils/siteSettings');

async function getHero() {
  const rows = await sql`
    SELECT id, name, title, subtitle, bio
    FROM portfolio.hero
    WHERE singleton_key = 'default'
    LIMIT 1
  `;
  if (rows[0]) return rows[0];

  const fallback = await sql`SELECT id, name, title, subtitle, bio FROM portfolio.hero LIMIT 1`;
  return fallback[0] || null;
}

async function getContactInfo() {
  const rows = await sql`SELECT
    id,
    email,
    linkedin_url AS "linkedin",
    github_url AS "github",
    location
  FROM portfolio.contact_information
  WHERE singleton_key = 'default'
  LIMIT 1`;
  if (rows[0]) return rows[0];

  const fallback = await sql`SELECT
    id,
    email,
    linkedin_url AS "linkedin",
    github_url AS "github",
    location
  FROM portfolio.contact_information
  LIMIT 1`;
  return fallback[0] || null;
}

async function getSkills() {
  return await sql`SELECT
    id,
    name,
    icon,
    accent_color AS "accentColor",
    description,
    tags,
    display_order AS "displayOrder",
    proficiency,
    years_experience AS "yearsExp"
  FROM portfolio.skills
  WHERE is_active = true
    AND COALESCE(is_deleted, false) = false
  ORDER BY display_order, name;`;
}

async function getCompanies() {
  return await sql`SELECT
    comp.id,
    comp.name,
    comp.role,
    comp.period,
    comp.location,
    comp.logo,
    comp.brand_color     AS "accentColor",
    comp.description,
    comp.display_order   AS "displayOrder",
    comp.currently_working AS "current",
    comp.website,
    comp.team_size       AS "teamSize",
    COALESCE(comp.start_date_d::text, comp.start_date) AS "startDate",
    COALESCE(comp.end_date_d::text, comp.end_date) AS "endDate",
    COALESCE(
      json_agg(
        json_build_object(
          'id',           proj.id,
          'number',       proj.number,
          'title',        proj.title,
          'description',  proj.description,
          'link',         proj.link,
          'displayOrder', proj.display_order,
          'tech',         proj.technologies,
          'status',       COALESCE(proj.status_v2::text, proj.status),
          'impact',       proj.impact
        )
        ORDER BY proj.display_order
      ) FILTER (WHERE proj.id IS NOT NULL),
      '[]'
    ) AS projects
  FROM portfolio.companies comp
  LEFT JOIN portfolio.company_projects proj
    ON comp.id = proj.company_id
    AND proj.is_active = true
    AND COALESCE(proj.is_deleted, false) = false
  WHERE comp.is_active = true
    AND COALESCE(comp.is_deleted, false) = false
  GROUP BY comp.id
  ORDER BY comp.display_order;`;
}

async function getPersonalProjects() {
  return await sql`SELECT
    id,
    title,
    description,
    technologies AS "tech",
    github_link AS "githubUrl",
    live_link AS "liveUrl",
    COALESCE(status_v2::text, status) AS status,
    COALESCE(type_v2::text, type) AS type,
    featured,
    year,
    display_order AS "displayOrder"
  FROM portfolio.personal_projects
  WHERE is_active = true
    AND COALESCE(is_deleted, false) = false
  ORDER BY featured DESC, display_order;`;
}

async function getExperience() {
  return await sql`SELECT
    id,
    COALESCE(
      period,
      CONCAT_WS(
        ' - ',
        COALESCE(start_date_d::text, start_date),
        COALESCE(end_date_d::text, end_date)
      )
    ) AS period,
    location,
    role,
    organisation AS "company",
    description,
    display_order AS "displayOrder"
  FROM portfolio.experience
  WHERE is_active = true
    AND COALESCE(is_deleted, false) = false
  ORDER BY display_order, organisation;`;
}

async function getStats() {
  return await sql`SELECT
    id,
    value,
    suffix,
    label
  FROM portfolio.stats
  WHERE is_active = true
    AND COALESCE(is_deleted, false) = false;`;
}

async function getCertifications() {
  return await sql`SELECT
    id,
    name,
    code,
    issuer,
    level,
    issue_year AS "issueYear",
    expiration_year AS "expirationYear",
    credly_link AS "credlyLink",
    accent_color AS "accentColor",
    badge_link AS "badgeLink",
    badge_type AS "badgeType",
    display_order AS "displayOrder"
  FROM portfolio.certifications
  WHERE is_active = true
    AND COALESCE(is_deleted, false) = false
  ORDER BY display_order, issue_year DESC;`;
}

async function getSiteSettings() {
  const result = await sql`SELECT config
    FROM portfolio.site_config
    WHERE key = 'site_settings'`;

  return normaliseCompanyBadge(result[0]?.config, { stripLegacy: true });
}

async function getTestimonials() {
  return await sql`SELECT
    id,
    name,
    role,
    company,
    avatar,
    quote,
    rating,
    COALESCE(status_v2::text, status) AS status,
    visible,
    display_order AS "displayOrder"
  FROM portfolio.testimonials
  WHERE is_active = true
    AND COALESCE(is_deleted, false) = false
    AND COALESCE(status_v2::text, status) = 'Approved'
  ORDER BY display_order, rating DESC;`;
}

async function getBlogPosts() {
  return await sql`SELECT
    id,
    title,
    slug,
    excerpt,
    content,
    tags,
    published,
    cover_image AS "coverImage",
    published_at AS "publishedAt",
    reading_time AS "readingTime",
    author,
    display_order AS "displayOrder"
  FROM portfolio.blog_posts
  WHERE is_active = true
    AND COALESCE(is_deleted, false) = false
  ORDER BY display_order, published_at DESC;`;
}

async function getPublicLiveBlogPosts() {
  return await sql`SELECT
    id,
    title,
    slug,
    excerpt,
    content,
    tags,
    cover_image AS "coverImage",
    published,
    published_at AS "publishedAt",
    unpublished_at AS "unpublishedAt",
    reading_time AS "readingTime",
    display_order AS "displayOrder"
  FROM portfolio.blog_posts
  WHERE is_active = true
    AND COALESCE(is_deleted, false) = false
    AND published = true
    AND (published_at IS NULL OR published_at <= now())
    AND (unpublished_at IS NULL OR unpublished_at > now())
  ORDER BY published_at DESC NULLS LAST, display_order ASC, created_at DESC;`;
}

async function getPublicLiveBlogPostBySlug(slug) {
  const rows = await sql`SELECT
    id,
    title,
    slug,
    excerpt,
    content,
    tags,
    cover_image AS "coverImage",
    published,
    published_at AS "publishedAt",
    unpublished_at AS "unpublishedAt",
    reading_time AS "readingTime",
    display_order AS "displayOrder"
  FROM portfolio.blog_posts
  WHERE slug = ${slug}
    AND is_active = true
    AND COALESCE(is_deleted, false) = false
    AND published = true
    AND (published_at IS NULL OR published_at <= now())
    AND (unpublished_at IS NULL OR unpublished_at > now())
  LIMIT 1;`;

  return rows[0] || null;
}

async function getAnalytics() {
  const rows = await sql`SELECT
    id,
    page_views AS "pageViews",
    resume_downloads AS "resumeDownloads",
    contact_form_submissions AS "contactFormSubmissions",
    contact_form_views AS "contactFormViews",
    blog_post_views AS "blogPostViews",
    project_link_clicks AS "projectClicks",
    social_link_clicks AS "socialLinkClicks",
    last_reset AS "lastReset"
  FROM portfolio.analytics
  WHERE singleton_key = 'default'
  LIMIT 1;`;
  if (rows[0]) return rows[0];

  const fallback = await sql`SELECT
    id,
    page_views AS "pageViews",
    resume_downloads AS "resumeDownloads",
    contact_form_submissions AS "contactFormSubmissions",
    contact_form_views AS "contactFormViews",
    blog_post_views AS "blogPostViews",
    project_link_clicks AS "projectClicks",
    social_link_clicks AS "socialLinkClicks",
    last_reset AS "lastReset"
  FROM portfolio.analytics
  LIMIT 1;`;
  return fallback[0] || null;
}

async function getPendingTestimonials() {
  return await sql`SELECT
    id,
    name,
    role,
    company,
    avatar,
    quote,
    rating,
    COALESCE(status_v2::text, status) AS status,
    visible,
    display_order AS "displayOrder",
    created_at AS "createdAt"
  FROM portfolio.testimonials
  WHERE is_active = true
    AND COALESCE(is_deleted, false) = false
    AND COALESCE(status_v2::text, status) = 'Pending'
  ORDER BY created_at DESC;`;
}

module.exports = {
  getHero,
  getContactInfo,
  getSkills,
  getCompanies,
  getPersonalProjects,
  getExperience,
  getStats,
  getCertifications,
  getSiteSettings,
  getTestimonials,
  getBlogPosts,
  getPublicLiveBlogPosts,
  getPublicLiveBlogPostBySlug,
  getAnalytics,
  getPendingTestimonials,
};
