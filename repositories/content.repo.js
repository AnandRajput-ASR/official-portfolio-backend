const sql = require('../configs/database.config');

async function getHero() {
  return sql`SELECT * FROM hero WHERE is_deleted = false LIMIT 1`;
}

async function getSkills() {
  return sql`SELECT id, name, icon, accent_color AS "accentColor", description, tags, display_order AS "order", proficiency, years_exp AS "yearsExp" FROM skills WHERE is_deleted = false ORDER BY display_order`;
}

async function getCompanies() {
  return sql`SELECT comp.id, comp.name, comp.role, comp.period, comp.location, comp.logo, comp.accent_color AS "accentColor", comp.description, comp.display_order AS "order" json_agg(json_build_object('id', proj.id, 'number', proj.project_number, 'title', proj.title, 'description', proj.description, 'link', proj.link, 'order', proj.display_order, 'tech', proj.tech)) AS projects FROM companies comp LEFT JOIN company_projects proj ON comp.id = proj.company_id WHERE comp.is_deleted = false GROUP BY comp.id`;
}

async function getPersonalProjects() {
  return sql`SELECT id, title, description, tech, github_link AS "githubUrl", live_link AS "liveUrl", status, type,featured, year, display_order AS "order" FROM personal_projects WHERE is_deleted = false ORDER BY display_order`;
}

module.exports = {
  getHero,
  getSkills,
  getCompanies,
  getPersonalProjects,
};
