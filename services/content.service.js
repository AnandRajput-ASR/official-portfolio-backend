/**
 * Content service — public-facing read operations + hero/contact writes.
 */
const contentRepository = require('../repositories/content.repository');

async function getPageContent() {
  const [
    heroData,
    contactInfo,
    skills,
    companies,
    personalProjects,
    experience,
    stats,
    certifications,
    siteSettings,
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
    contentRepository.getCertifications(),
    contentRepository.getSiteSettings(),
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
    certifications,
    siteSettings,
    testimonials,
    blogPosts,
    analytics,
    pendingTestimonials,
  };
}

async function getHero() {
  const heroData = await contentRepository.getHero();
  return heroData[0] || null;
}

async function putHero(heroContent) {
  return await contentRepository.putHero(heroContent);
}

async function getContactInfo() {
  const contactInfo = await contentRepository.getContactInfo();
  return contactInfo[0] || null;
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
  return await contentRepository.getCertifications();
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

async function getSiteSettings() {
  return await contentRepository.getSiteSettings();
}

async function trackAnalyticsEvent(eventName, metadata) {
  return await contentRepository.trackAnalyticsEvent(eventName, metadata);
}

async function getVisitorCount() {
  return await contentRepository.getVisitorCounts();
}

async function saveResumeLead({ email, ip, ua }) {
  return await contentRepository.saveResumeLead({ email, ip, ua });
}

async function reorderSection(section, items) {
  return await contentRepository.reorderSection(section, items);
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
  getSiteSettings,
  trackAnalyticsEvent,
  saveResumeLead,
  reorderSection,
  getVisitorCount,
};
