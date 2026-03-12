const contentRepository = require('../repositories/content.repository');

async function getPageContent() {
  const [hero, skills, companies, personalProjects] = await Promise.all([
    contentRepository.getHero(),
    contentRepository.getSkills(),
    contentRepository.getCompanies(),
    contentRepository.getPersonalProjects(),
  ]);

  return {
    hero: hero[0] || {},
    skills,
    companies,
    personalProjects,
  };
}

module.exports = {
  getPageContent,
};
