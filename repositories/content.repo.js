const sql = require('../configs/database.config');

async function getHero() {
  return sql`SELECT id, name, title, subtitle, bio FROM portfolio.hero LIMIT 1`;
}

async function putHero({ id, name, title, subtitle }) {
  console.table({ id, name, title, subtitle });
  const result = await sql`
    UPDATE portfolio.hero
    SET name = ${name},
        title = ${title},
        subtitle = ${subtitle}
    WHERE id = ${id}
    RETURNING id, name, title, subtitle
  `;
  return result[0] || null;
}

async function getContactInfo() {
  return sql`SELECT
    id,
    email,
    linkedin_url AS "linkedin",
    github_url AS "github",
    location
  FROM portfolio.contact_information
  LIMIT 1`;
}

async function putContactInfo({ id, email, linkedin, github, location }) {
  const result = await sql`
    UPDATE portfolio.contact_information
    SET email = ${email},
        linkedin_url = ${linkedin},
        github_url = ${github},
        location = ${location}
    WHERE id = ${id}
    RETURNING id, email, linkedin_url AS "linkedin", github_url AS "github", location
  `;
  return result[0] || null;
}

async function getSkills() {
  return sql`SELECT
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
  ORDER BY display_order, name;`;
}

async function getCompanies() {
  return sql`SELECT
    comp.id,
    comp.name,
    comp.role,
    comp.period,
    comp.location,
    comp.logo,
    comp.brand_color AS "accentColor",
    comp.description,
    comp.display_order AS "displayOrder",
    COALESCE(
      json_agg(
        json_build_object(
          'id', proj.id,
          'number', proj.number,
          'title', proj.title,
          'description', proj.description,
          'link', proj.link,
          'displayOrder', proj.display_order,
          'tech', proj.technologies
        )
        ORDER BY proj.display_order
      ) FILTER (WHERE proj.id IS NOT NULL),
      '[]'
    ) AS projects
  FROM portfolio.companies comp
  LEFT JOIN portfolio.company_projects proj
    ON comp.id = proj.company_id
    AND proj.is_active = true
  WHERE comp.is_active = true
  GROUP BY comp.id
  ORDER BY comp.display_order;`;
}

async function getPersonalProjects() {
  return sql`SELECT
    id,
    title,
    description,
    technologies AS "tech",
    github_link AS "githubUrl",
    live_link AS "liveUrl",
    status,
    type,
    featured,
    year,
    display_order AS "displayOrder"
  FROM portfolio.personal_projects
  WHERE is_active = true
  ORDER BY featured DESC, display_order;`;
}

async function getExperience() {
  return sql`SELECT
    id,
    period,
    location,
    role,
    organisation AS "company",
    description,
    display_order AS "displayOrder"
  FROM portfolio.experience
  WHERE is_active = true
  ORDER BY display_order, organisation;`;
}

async function getStats() {
  return sql`SELECT
    id,
    value,
    suffix,
    label
  FROM portfolio.stats
  WHERE is_active = true;`;
}

async function getCertification(){
  return sql`SELECT
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
  ORDER BY display_order, issue_year DESC;`;
}

async function getTestimonials() {
  return sql`SELECT
    id,
    name,
    role,
    company,
    avatar,
    quote,
    rating,
    status,
    display_order AS "displayOrder"
  FROM portfolio.testimonials
  WHERE is_active = true AND status = 'Approved'
  ORDER BY display_order, rating DESC;`;
}

async function getBlogPosts() {
  return sql`SELECT
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
    author
  FROM portfolio.blog_posts
  -- WHERE is_active = true AND published = true
  ORDER BY published_at DESC;`;
}

async function getAnalytics() {
  return sql`SELECT
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
}

async function getPendingTestimonials() {
  return sql`SELECT
    id,
    name,
    role,
    company,
    avatar,
    quote,
    rating,
    status,
    display_order AS "displayOrder",
    created_at AS "createdAt"
  FROM portfolio.testimonials
  WHERE is_active = true AND status = 'Pending'
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
  getCertification,
  getTestimonials,
  getBlogPosts,
  getAnalytics,
  getPendingTestimonials,
  putHero,
  putContactInfo,
};
