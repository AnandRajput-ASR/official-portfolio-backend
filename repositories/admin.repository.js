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
            dispaly_order
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
            (SELECT COALESCE(MAX(dispaly_order), -1) + 1 FROM portfolio.companies)
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
            display_order AS "displayOrder";;
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
};
