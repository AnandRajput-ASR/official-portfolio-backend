const contentRepository = require('../repositories/content.repo');

async function getPageContent() {
  const [
    heroData,
    contactInfo,
    skills,
    companies,
    personalProjects,
    experience,
    stats,
    certification,
    testimonials,
    blogPosts,
    analytics,
    pendingTestimonials,
  ] = await Promise.all([
    contentRepository.getHero(),
    contentRepository.getContactInfo(),
    contentRepository.getSkills(),
    contentRepository.getCompanies(),
    contentRepository.getPersonalProjects(),
    contentRepository.getExperience(),
    contentRepository.getStats(),
    contentRepository.getCertification(),
    contentRepository.getTestimonials(),
    contentRepository.getBlogPosts(),
    contentRepository.getAnalytics(),
    contentRepository.getPendingTestimonials(),
  ]);

  const { id: heroId, ...heroRest } = heroData[0];
  const { id: contactInfoId, ...contactRest } = contactInfo[0];

  const hero = {
    heroId,
    contactInfoId,
    ...heroRest,
    ...contactRest,
  };
  return {
    hero,
    skills,
    companies,
    personalProjects,
    experience,
    stats,
    certification,
    testimonials,
    blogPosts,
    analytics,
    pendingTestimonials,
  };
}

// Hero
async function getHero() {
  const heroData = await contentRepository.getHero();
  return heroData[0] || null;
}

async function putHero(heroContent) {
  return await contentRepository.putHero(heroContent);
}

async function getContactInfo() {
  const contactInfo = await contentRepository.getContactInfo();
  return (await contactInfo[0]) || null;
}

async function putContactInfo(contactInfo) {
  return await contentRepository.putContactInfo(contactInfo);
}

async function getSkills() {
  return await contentRepository.getSkills();
}

async function getCompanies() {
  return await contentRepository.getCompanies();
}

async function getPersonalProjects() {
  return await contentRepository.getPersonalProjects();
}

async function getExperience() {
  return await contentRepository.getExperience();
}

async function getStats() {
  return await contentRepository.getStats();
}

async function getCertification() {
  return await contentRepository.getCertification();
}

async function getTestimonials() {
  return await contentRepository.getTestimonials();
}

async function getBlogPosts() {
  return await contentRepository.getBlogPosts();
}

async function getAnalytics() {
  return await contentRepository.getAnalytics();
}

async function getPendingTestimonials() {
  return await contentRepository.getPendingTestimonials();
}
module.exports = {
  getPageContent,
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
