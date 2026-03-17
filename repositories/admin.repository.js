const sql = require('../configs/database.config');

async function putHeroSection({ name, title, subtitle, bio, email, linkedin, github, location }) {
  const result = await sql`
    WITH hero_update AS (
      UPDATE portfolio.hero
      SET
        name = ${name},
        title = ${title},
        subtitle = ${subtitle},
        bio = ${bio},
        updated_at = now()
      WHERE single_row_lock = true
      RETURNING
        id AS "heroId",
        name,
        title,
        subtitle,
        bio
    ),
    contact_update AS (
      UPDATE portfolio.contact_information
      SET
        email = ${email},
        linkedin_url = ${linkedin},
        github_url = ${github},
        location = ${location},
        updated_at = now()
      WHERE single_row_lock = true
      RETURNING
        id AS "contactInfoId",
        email,
        linkedin_url,
        github_url,
        location
    )
    SELECT *
    FROM hero_update
    CROSS JOIN contact_update
  `;

  return result[0] || null;
}

async function putSkills(skills) {
  const result = await sql`
    UPDATE portfolio.skills s
    SET
        name = data.name,
        icon = data.icon,
        accent_color = data."accentColor",
        description = data.description,
        proficiency = data.proficiency,
        years_experience = data."yearsExp",
        tags = data.tags,
        display_order = data."displayOrder",
        updated_at = now()
    FROM json_to_recordset(${skills})
    AS data(
        id uuid,
        name text,
        icon text,
        "accentColor" text,
        description text,
        tags text[],
        "displayOrder" int,
        proficiency int,
        "yearsExp" text
    )
    WHERE s.id = data.id
    RETURNING
        s.id,
        s.name,
        s.icon,
        s.accent_color AS "accentColor",
        s.description,
        s.tags,
        s.display_order AS "displayOrder",
        s.proficiency,
        s.years_experience AS "yearsExp";
    `;
  return result;
}

async function postSkill({ name, icon, accentColor, description, tags, proficiency, yearsExp, displayOrder }) {
  const result = await sql`
        INSERT INTO portfolio.skills (
            name,
            icon,
            accent_color,
            description,
            proficiency,
            years_experience,
            tags,
            display_order
        )
        VALUES (
            ${name},
            ${icon},
            ${accentColor},
            ${description},
            ${proficiency},
            ${yearsExp},
            ${tags}::text[],
            ${displayOrder}
        )
        RETURNING
            id,
            name,
            icon,
            accent_color AS "accentColor",
            description,
            tags,
            proficiency,
            years_experience AS "yearsExp",
            display_order AS "displayOrder";
    `;

  return result[0];
}

async function deleteSkillById(id) {
  const result = await sql`
        UPDATE portfolio.skills
        SET
            is_active = false,
            updated_at = now()
        WHERE id = ${id}
        RETURNING
            id,
            name,
            icon,
            accent_color AS "accentColor",
            description,
            tags,
            proficiency,
            years_experience AS "yearsExp",
            display_order AS "displayOrder";
    `;

  return result[0] || null;
}

async function putCompanies(companies) {
  return await sql.begin(async tx => {
    for (const company of companies) {
      const { id, name, role, period, location, logo, accentColor, description, displayOrder, projects } = company;

      // update company
      await tx`
                UPDATE portfolio.companies
                SET
                    name = ${name},
                    role = ${role},
                    period = ${period},
                    location = ${location},
                    logo = ${logo},
                    brand_color = ${accentColor},
                    description = ${description},
                    display_order = ${displayOrder},
                    updated_at = now()
                WHERE id = ${id}
            `;

      // update projects
      if (projects?.length) {
        for (const project of projects) {
          const { id: projectId, title, description: projectDescription, tech, link, displayOrder: projectOrder, number } = project;

          await tx`
                        UPDATE portfolio.company_projects
                        SET
                            title = ${title},
                            description = ${projectDescription},
                            technologies = ${tech}::text[],
                            link = ${link},
                            display_order = ${projectOrder},
                            number = ${number},
                            updated_at = now()
                        WHERE id = ${projectId}
                    `;
        }
      }
    }

    return { updated: true };
  });
}

async function postCompany({ name, role, period, location, logo, accentColor, current, description }) {
  const result = await sql`
        INSERT INTO portfolio.companies (
            name,
            role,
            period,
            location,
            logo,
            brand_color,
            currently_working,
            description,
            display_order
        )
        VALUES (
            ${name},
            ${role},
            ${period},
            ${location},
            ${logo},
            ${accentColor},
            ${current},
            ${description},
            (SELECT COALESCE(MAX(display_order), -1) + 1 FROM portfolio.companies)
        )
        RETURNING
            id,
            name,
            role,
            period,
            location,
            logo,
            brand_color AS "accentColor",
            currently_working AS "current",
            description,
            display_order AS "displayOrder";
    `;

  return result[0];
}

async function deleteCompanyById(companyId) {
  return await sql.begin(async tx => {
    // soft delete company
    const company = await tx`
            UPDATE portfolio.companies
            SET
                is_active = false,
                updated_at = now()
            WHERE id = ${companyId}
            RETURNING
                id,
                name,
                display_order AS "displayOrder"
        `;

    if (!company.length) {
      return null;
    }

    // soft delete all projects under company
    await tx`
            UPDATE portfolio.company_projects
            SET
                is_active = false,
                updated_at = now()
            WHERE company_id = ${companyId}
        `;

    return company[0];
  });
}

async function postCompanyProject({ companyId, title, description, tech, link }) {
  const result = await sql`
        INSERT INTO portfolio.company_projects (
            company_id,
            title,
            description,
            technologies,
            link,
            display_order
        )
        VALUES (
            ${companyId},
            ${title},
            ${description},
            ${tech}::text[],
            ${link},
            (
                SELECT COALESCE(MAX(display_order), -1) + 1
                FROM portfolio.company_projects
                WHERE company_id = ${companyId}
            )
        )
        RETURNING
            id,
            company_id AS "companyId",
            title,
            description,
            technologies AS "tech",
            link,
            display_order AS "displayOrder";
    `;

  return result[0];
}

async function deleteProjectById(projectId) {
  const result = await sql`
        UPDATE portfolio.company_projects
        SET
            is_active = false,
            updated_at = now()
        WHERE id = ${projectId}
        RETURNING
            id,
            company_id AS "companyId",
            title,
            display_order AS "displayOrder";
    `;

  return result[0] || null;
}

async function putPersonalProjects(projects) {
  return await sql.begin(async tx => {
    for (const project of projects) {
      const { id, title, description, tech, githubUrl, liveUrl, status, type, featured, year, displayOrder } = project;

      await tx`
                UPDATE portfolio.personal_projects
                SET
                    title = ${title},
                    description = ${description},
                    technologies = ${tech}::text[],
                    github_link = ${githubUrl},
                    live_link = ${liveUrl},
                    status = ${status},
                    type = ${type},
                    featured = ${featured},
                    year = ${year},
                    display_order = ${displayOrder},
                    updated_at = now()
                WHERE id = ${id}
            `;
    }

    return { updated: true };
  });
}

async function postPersonalProject({ title, description, tech, githubUrl, liveUrl, status, type, featured, year }) {
  const result = await sql`
        INSERT INTO portfolio.personal_projects (
            title,
            description,
            technologies,
            github_link,
            live_link,
            status,
            type,
            featured,
            year,
            display_order
        )
        VALUES (
            ${title},
            ${description},
            ${tech}::text[],
            ${githubUrl},
            ${liveUrl},
            ${status},
            ${type},
            ${featured},
            ${year},
            (
                SELECT COALESCE(MAX(display_order), -1) + 1
                FROM portfolio.personal_projects
                WHERE is_active = true
            )
        )
        RETURNING
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
            display_order AS "displayOrder";
    `;

  return result[0];
}

async function deletePersonalProjectById(id) {
  const result = await sql`
        UPDATE portfolio.personal_projects
        SET
            is_active = false,
            updated_at = now()
        WHERE id = ${id}
        RETURNING
            id,
            title,
            display_order AS "displayOrder";
    `;

  return result[0] || null;
}

async function putExperience(experiences) {
  return await sql.begin(async tx => {
    for (const exp of experiences) {
      const { id, period, location, role, company, description, displayOrder } = exp;

      await tx`
                UPDATE portfolio.experience
                SET
                    period = ${period},
                    location = ${location},
                    role = ${role},
                    organisation = ${company},
                    description = ${description},
                    display_order = ${displayOrder},
                    updated_at = now()
                WHERE id = ${id}
            `;
    }

    return { updated: true };
  });
}

async function postExperience({ period, location, role, company, description }) {
  const result = await sql`
        INSERT INTO portfolio.experience (
            period,
            location,
            role,
            organisation,
            description,
            display_order
        )
        VALUES (
            ${period},
            ${location},
            ${role},
            ${company},
            ${description},
            (
                SELECT COALESCE(MAX(display_order), -1) + 1
                FROM portfolio.experience
                WHERE is_active = true
            )
        )
        RETURNING
            id,
            period,
            location,
            role,
            organisation AS "company",
            description,
            display_order AS "displayOrder";
    `;

  return result[0];
}

async function deleteExperienceById(id) {
  const result = await sql`
        UPDATE portfolio.experience
        SET
            is_active = false,
            updated_at = now()
        WHERE id = ${id}
        RETURNING
            id,
            role,
            organisation AS "company",
            display_order AS "displayOrder";
    `;

  return result[0] || null;
}

async function syncStats(stats) {
  return await sql.begin(async tx => {
    const payloadIds = [];

    for (const stat of stats) {
      const { id, value, suffix, label } = stat;

      const isUuid = /^[0-9a-fA-F-]{36}$/.test(id);

      if (isUuid) {
        const updated = await tx`
                    UPDATE portfolio.stats
                    SET
                        value = ${value},
                        suffix = ${suffix},
                        label = ${label},
                        updated_at = now()
                    WHERE id = ${id}
                    RETURNING id
                `;

        if (updated.length) {
          payloadIds.push(id);
          continue;
        }
      }

      // insert new stat
      const inserted = await tx`
                INSERT INTO portfolio.stats (
                    value,
                    suffix,
                    label
                )
                VALUES (
                    ${value},
                    ${suffix},
                    ${label}
                )
                RETURNING id
            `;

      payloadIds.push(inserted[0].id);
    }

    // soft delete removed stats
    await tx`
            UPDATE portfolio.stats
            SET
                is_active = false,
                updated_at = now()
            WHERE id NOT IN ${tx(payloadIds)}
        `;

    // return fresh dataset
    const allStats = await tx`
            SELECT
                id,
                value,
                suffix,
                label
            FROM portfolio.stats
            WHERE is_active = true
            ORDER BY created_at
        `;

    return allStats;
  });
}

async function putCertification(certifications) {
  return await sql.begin(async tx => {
    for (const cert of certifications) {
      const { id, name, code, issuer, level, issueYear, expirationYear, credlyLink, accentColor, badgeLink, badgeType, displayOrder } =
        cert;

      await tx`
                UPDATE portfolio.certifications
                SET
                    name = ${name},
                    code = ${code},
                    issuer = ${issuer},
                    level = ${level},
                    issue_year = ${issueYear},
                    expiration_year = ${expirationYear},
                    credly_link = ${credlyLink},
                    accent_color = ${accentColor},
                    badge_link = ${badgeLink},
                    badge_type = ${badgeType},
                    display_order = ${displayOrder},
                    updated_at = now()
                WHERE id = ${id}
            `;
    }

    return { updated: true };
  });
}

async function postCertification({ name, code, issuer, level, issueYear, credlyLink, accentColor, badgeLink, badgeType }) {
  const result = await sql`
        INSERT INTO portfolio.certifications (
            name,
            code,
            issuer,
            level,
            issue_year,
            credly_link,
            accent_color,
            badge_link,
            badge_type,
            display_order
        )
        VALUES (
            ${name},
            ${code},
            ${issuer},
            ${level},
            ${issueYear},
            ${credlyLink},
            ${accentColor},
            ${badgeLink},
            ${badgeType},
            (
                SELECT COALESCE(MAX(display_order), -1) + 1
                FROM portfolio.certifications
                WHERE is_active = true
            )
        )
        RETURNING
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
            display_order AS "displayOrder";
    `;

  return result[0];
}

async function deleteCertificationById(id) {
  const result = await sql`
        UPDATE portfolio.certifications
        SET
            is_active = false,
            updated_at = now()
        WHERE id = ${id}
        RETURNING
            id,
            name,
            issuer,
            display_order AS "displayOrder";
    `;

  return result[0] || null;
}

async function getAllTestimonials() {
  const approved = await sql`
        SELECT
            id,
            name,
            role,
            company,
            avatar,
            quote,
            rating,
            status,
            visible,
            display_order AS "displayOrder"
        FROM portfolio.testimonials
        WHERE is_active = true
        AND status = 'Approved'
        ORDER BY display_order
    `;

  const pending = await sql`
        SELECT
            id,
            name,
            role,
            company,
            avatar,
            quote,
            rating,
            status,
            visible,
            created_at
        FROM portfolio.testimonials
        WHERE is_active = true
        AND status = 'Pending'
        ORDER BY created_at DESC
    `;

  return {
    approved,
    pending,
  };
}

async function updateTestimonials(testimonials) {
  return await sql.begin(async tx => {
    for (const t of testimonials) {
      const id = t.id;
      const name = t.name ?? null;
      const role = t.role ?? null;
      const company = t.company ?? null;
      const avatar = t.avatar ?? null;
      const quote = t.quote ?? null;
      const rating = t.rating ?? 5;
      const displayOrder = t.displayOrder ?? 0;

      await tx`
                UPDATE portfolio.testimonials
                SET
                    name = ${name},
                    role = ${role},
                    company = ${company},
                    avatar = ${avatar},
                    quote = ${quote},
                    rating = ${rating},
                    display_order = ${displayOrder},
                    updated_at = now()
                WHERE id = ${id}
            `;
    }

    return { updated: true };
  });
}

async function createTestimonial({ name, role, company, avatar, quote, rating }) {
  const result = await sql`
        INSERT INTO portfolio.testimonials (
            name,
            role,
            company,
            avatar,
            quote,
            rating,
            status,
            display_order
        )
        VALUES (
            ${name},
            ${role},
            ${company},
            ${avatar},
            ${quote},
            ${rating},
            'Approved',
            (
                SELECT COALESCE(MAX(display_order), -1) + 1
                FROM portfolio.testimonials
                WHERE status = 'Approved'
            )
        )
        RETURNING
            id,
            name,
            role,
            company,
            avatar,
            quote,
            rating,
            status,
            display_order AS "displayOrder"
    `;

  return result[0];
}

async function enableTestimonialById(id, { visible }) {
  const result = await sql`
        UPDATE portfolio.testimonials
        SET
            visible = ${visible},
            updated_at = now()
        WHERE id = ${id}
        RETURNING
            id,
            name,
            role,
            company,
            avatar,
            quote,
            rating,
            visible
    `;

  return result[0];
}

async function deleteTestimonial(id) {
  const result = await sql`
        UPDATE portfolio.testimonials
        SET
            is_active = false,
            updated_at = now()
        WHERE id = ${id}
        RETURNING id
    `;

  return result[0];
}

async function submitTestimonial({ name, role, company, quote, rating, avatar }) {
  const result = await sql`
        INSERT INTO portfolio.testimonials (
            name,
            role,
            company,
            avatar,
            quote,
            rating,
            status,
            visible
        )
        VALUES (
            ${name},
            ${role},
            ${company},
            ${avatar || null},
            ${quote},
            ${rating},
            'Pending',
            False
        )
        RETURNING
            id,
            name,
            role,
            company,
            avatar,
            quote,
            rating,
            status,
            visible
    `;

  return result[0];
}

async function approveTestimonial(id) {
  const result = await sql`
        UPDATE portfolio.testimonials
        SET
            status = 'Approved',
            visible = True,
            updated_at = now(),
            display_order = (
                SELECT COALESCE(MAX(display_order), -1) + 1
                FROM portfolio.testimonials
                WHERE status = 'Approved'
            )
        WHERE id = ${id}
        RETURNING
            id,
            name,
            role,
            company,
            avatar,
            quote,
            rating,
            status,
            visible,
            display_order AS "displayOrder"
    `;

  return result[0];
}

async function rejectTestimonial(id) {
  const result = await sql`
        UPDATE portfolio.testimonials
        SET
            status = 'Rejected',
            updated_at = now()
        WHERE id = ${id}
        RETURNING id, status
    `;

  return result[0];
}

async function deletePendingTestimonial(id) {
  const result = await sql`
        UPDATE portfolio.testimonials
        SET
            is_active = false,
            updated_at = now()
        WHERE id = ${id}
        RETURNING id
    `;

  return result[0];
}

async function createBlogPost({ title, slug, excerpt, content, tags, coverImage, published, readingTime, displayOrder }) {
  const result = await sql`
        INSERT INTO portfolio.blog_posts (
            title,
            slug,
            excerpt,
            content,
            tags,
            cover_image,
            published,
            published_at,
            reading_time,
            display_order
        )
        VALUES (
            ${title},
            ${slug},
            ${excerpt},
            ${content},
            ${tags}::text[],
            ${coverImage},
            ${published},
            CASE WHEN ${published} = true THEN now() ELSE NULL END,
            ${readingTime},
            COALESCE(${displayOrder}, 0)
        )
        RETURNING
            id,
            title,
            slug,
            excerpt,
            content,
            tags,
            cover_image AS "coverImage",
            published,
            published_at AS "publishedAt",
            reading_time AS "readingTime",
            display_order AS "displayOrder"
    `;

  return result[0];
}

async function updateBlogPostById(
  id,
  { title, slug, excerpt, content, tags, coverImage, published, publishedAt, readingTime, author, displayOrder }
) {
  const result = await sql`
        UPDATE portfolio.blog_posts
        SET
            title = ${title},
            slug = ${slug},
            excerpt = ${excerpt},
            content = ${content},
            tags = ${tags}::text[],
            cover_image = ${coverImage},
            published = ${published},
            published_at = ${publishedAt},
            reading_time = ${readingTime},
            author = ${author},
            display_order = COALESCE(${displayOrder}, display_order),
            updated_at = now()
        WHERE id = ${id}
        RETURNING
            id,
            title,
            slug,
            excerpt,
            content,
            tags,
            cover_image AS "coverImage",
            published,
            published_at AS "publishedAt",
            reading_time AS "readingTime",
            author,
            display_order AS "displayOrder"
    `;

  return result[0];
}

async function updateBlogPosts(posts) {
  return await sql.begin(async tx => {
    for (const post of posts) {
      const { id, title, slug, excerpt, content, tags, coverImage, published, readingTime, author, displayOrder } = post;

      await tx`
                UPDATE portfolio.blog_posts
                SET
                    title = ${title},
                    slug = ${slug},
                    excerpt = ${excerpt},
                    content = ${content},
                    tags = ${tags}::text[],
                    cover_image = ${coverImage},
                    published = ${published},
                    published_at = now(),
                    reading_time = ${readingTime},
                    author = ${author},
                    display_order = COALESCE(${displayOrder}, display_order),
                    updated_at = now()
                WHERE id = ${id}
            `;
    }

    return { updated: true };
  });
}

async function deleteBlogPost(id) {
  const result = await sql`
        UPDATE portfolio.blog_posts
        SET
            is_active = false,
            updated_at = now()
        WHERE id = ${id}
        RETURNING id
    `;

  return result[0];
}

async function getAnalytics() {
  const [analyticsResult, clicksResult] = await Promise.all([
    sql`
        SELECT
            page_views AS "pageViews",
            resume_downloads AS "resumeDownloads",
            contact_form_submissions AS "contactFormSubmissions",
            contact_form_views AS "contactFormViews",
            blog_post_views AS "blogPostViews",
            project_link_clicks AS "projectLinkClicks",
            social_link_clicks AS "socialLinkClicks",
            last_reset AS "lastReset"
        FROM portfolio.analytics
        WHERE single_row_lock = true
        LIMIT 1
    `,
    sql`
        SELECT project_name, clicks
        FROM portfolio.project_clicks
        ORDER BY clicks DESC
    `,
  ]);

  const analytics = analyticsResult[0] || null;
  if (analytics) {
    const projectClicks = {};
    for (const row of clicksResult) {
      projectClicks[row.project_name] = row.clicks;
    }
    analytics.projectClicks = projectClicks;
  }

  return analytics;
}

async function resetAnalytics() {
  const result = await sql`
        UPDATE portfolio.analytics
        SET
            page_views = 0,
            resume_downloads = 0,
            contact_form_submissions = 0,
            contact_form_views = 0,
            blog_post_views = 0,
            project_link_clicks = 0,
            social_link_clicks = 0,
            last_reset = now()
        WHERE single_row_lock = true
        RETURNING *
    `;

  // Also reset per-project click counters
  await sql`DELETE FROM portfolio.project_clicks`;

  return result[0];
}

async function trackAnalyticsEvent(type, { projectName } = {}) {
  // Normalise camelCase (frontend) → snake_case (DB column map)
  const normalised = type.replace(/([A-Z])/g, '_$1').toLowerCase();

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

  if (!column) {
    throw new Error(`Invalid analytics event type: ${type}`);
  }

  const result = await sql`
        UPDATE portfolio.analytics
        SET ${sql(column)} = ${sql(column)} + 1
        WHERE single_row_lock = true
        RETURNING *
    `;

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
}

module.exports = {
  putHeroSection,
  putSkills,
  postSkill,
  deleteSkillById,
  putCompanies,
  postCompany,
  deleteCompanyById,
  postCompanyProject,
  deleteProjectById,
  putPersonalProjects,
  postPersonalProject,
  deletePersonalProjectById,
  putExperience,
  postExperience,
  deleteExperienceById,
  syncStats,
  putCertification,
  postCertification,
  deleteCertificationById,
  getAllTestimonials,
  updateTestimonials,
  createTestimonial,
  enableTestimonialById,
  deleteTestimonial,
  submitTestimonial,
  approveTestimonial,
  rejectTestimonial,
  deletePendingTestimonial,
  createBlogPost,
  updateBlogPostById,
  updateBlogPosts,
  deleteBlogPost,
  getAnalytics,
  resetAnalytics,
  trackAnalyticsEvent,
};
