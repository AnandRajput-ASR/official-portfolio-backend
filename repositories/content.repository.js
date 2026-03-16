/**
 * Content repository — write operations + re-exports shared reads.
 */
const sql = require('../configs/database.config');
const sharedRepo = require('./shared.repository');

// Re-export all shared read queries
module.exports = {
  ...sharedRepo,

  async putHero({ id, name, title, subtitle }) {
    const result = await sql`
      UPDATE portfolio.hero
      SET name = ${name},
          title = ${title},
          subtitle = ${subtitle}
      WHERE id = ${id}
      RETURNING id, name, title, subtitle
    `;
    return result[0] || null;
  },

  async putContactInfo({ id, email, linkedin, github, location }) {
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
  },

  /**
   * Track a public analytics event (pageView, resumeDownload, etc.).
   * Accepts both camelCase (frontend) and snake_case names.
   * When tracking a projectClick, also upserts into project_clicks if projectName is provided.
   */
  async trackAnalyticsEvent(eventName, { projectName } = {}) {
    const normalised = eventName.replace(/([A-Z])/g, '_$1').toLowerCase();

    const columnMap = {
      page_view: 'page_views',
      resume_download: 'resume_downloads',
      contact_submit: 'contact_form_submissions',
      contact_view: 'contact_form_views',
      blog_view: 'blog_post_views',
      project_click: 'project_link_clicks',
      social_click: 'social_link_clicks',
    };

    const column = columnMap[normalised];
    if (!column) throw new Error(`Invalid analytics event: ${eventName}`);

    const result = await sql`
      UPDATE portfolio.analytics
      SET ${sql(column)} = ${sql(column)} + 1
      WHERE single_row_lock = true
      RETURNING *`;

    // Track per-project click when project name is provided
    if (normalised === 'project_click' && projectName) {
      await sql`
        INSERT INTO portfolio.project_clicks (project_name, clicks, last_clicked_at)
        VALUES (${projectName}, 1, now())
        ON CONFLICT (project_name)
        DO UPDATE SET clicks = portfolio.project_clicks.clicks + 1,
                      last_clicked_at = now()
      `;
    }

    return result[0];
  },

  /**
   * Generic reorder — update display_order for a batch of items in a section.
   * @param {string} section  - e.g. 'skills', 'experience', 'certifications'
   * @param {{ id: string, displayOrder: number }[]} items
   */
  async reorderSection(section, items) {
    const tableMap = {
      skills: 'portfolio.skills',
      companies: 'portfolio.companies',
      personalProjects: 'portfolio.personal_projects',
      experience: 'portfolio.experience',
      certifications: 'portfolio.certifications',
      testimonials: 'portfolio.testimonials',
      blogPosts: 'portfolio.blog_posts',
    };

    const table = tableMap[section];
    if (!table) throw new Error(`Unknown section: ${section}`);

    // Run all updates inside a transaction
    await sql.begin(async (tx) => {
      for (const { id, displayOrder } of items) {
        await tx`UPDATE ${sql(table)} SET display_order = ${displayOrder} WHERE id = ${id}::uuid`;
      }
    });

    return { section, updated: items.length };
  },
};
