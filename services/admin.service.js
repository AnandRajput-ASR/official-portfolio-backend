/**
 * Admin service — protected write operations + aggregated page content.
 */
const repository = require('../repositories/admin.repository');
const sharedRepo = require('../repositories/shared.repository');

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
    sharedRepo.getHero(),
    sharedRepo.getContactInfo(),
    sharedRepo.getSkills(),
    sharedRepo.getCompanies(),
    sharedRepo.getPersonalProjects(),
    sharedRepo.getExperience(),
    sharedRepo.getStats(),
    sharedRepo.getCertifications(),
    sharedRepo.getSiteSettings(),
    sharedRepo.getTestimonials(),
    sharedRepo.getBlogPosts(),
    sharedRepo.getAnalytics(),
    sharedRepo.getPendingTestimonials(),
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

async function updateHeroSection(heroContent) {
  return await repository.putHeroSection(heroContent);
}

async function updateSkills(skills) {
  return await repository.putSkills(skills);
}

async function createSkill(skillPayload) {
  return await repository.postSkill(skillPayload);
}

async function deleteSkill(id) {
  return await repository.deleteSkillById(id);
}

async function updateCompanies(companies) {
  return await repository.putCompanies(companies);
}

async function createCompany(companyPayload) {
  return await repository.postCompany(companyPayload);
}

async function deleteCompany(companyId) {
  return await repository.deleteCompanyById(companyId);
}

async function createCompanyProject(projectPayload) {
  return await repository.postCompanyProject(projectPayload);
}

async function deleteProject(projectId) {
  return await repository.deleteProjectById(projectId);
}

async function updatePersonalProject(projects) {
  return await repository.putPersonalProjects(projects);
}

async function createPersonalProject(project) {
  return await repository.postPersonalProject(project);
}

async function deletePersonalProject(id) {
  return await repository.deletePersonalProjectById(id);
}

async function updateExperience(experiences) {
  return await repository.putExperience(experiences);
}

async function createExperience(payload) {
  return await repository.postExperience(payload);
}

async function deleteExperience(id) {
  return await repository.deleteExperienceById(id);
}

async function syncStats(stats) {
  return await repository.syncStats(stats);
}

async function updateCertification(certifications) {
  return await repository.putCertification(certifications);
}

async function createCertification(payload) {
  return await repository.postCertification(payload);
}

async function deleteCertification(id) {
  return await repository.deleteCertificationById(id);
}

async function getAllTestimonials() {
  return await repository.getAllTestimonials();
}

async function updateTestimonials(testimonials) {
  return await repository.updateTestimonials(testimonials);
}

async function createTestimonial(payload) {
  return await repository.createTestimonial(payload);
}

async function enableTestimonialById(id, payload) {
  return await repository.enableTestimonialById(id, payload);
}

async function deleteTestimonial(id) {
  return await repository.deleteTestimonial(id);
}

async function submitTestimonial(payload) {
  return await repository.submitTestimonial(payload);
}

async function approveTestimonial(id) {
  return await repository.approveTestimonial(id);
}

async function rejectTestimonial(id) {
  return await repository.rejectTestimonial(id);
}

async function deletePendingTestimonial(id) {
  return await repository.deletePendingTestimonial(id);
}

async function updateBlogPost(posts) {
  return await repository.updateBlogPosts(posts);
}

async function createBlogPost(post) {
  return await repository.createBlogPost(post);
}

async function updateBlogPostById(id, post) {
  return await repository.updateBlogPostById(id, post);
}

async function deleteBlogPost(id) {
  return await repository.deleteBlogPost(id);
}

async function getAnalytics() {
  return await repository.getAnalytics();
}

async function resetAnalytics() {
  return await repository.resetAnalytics();
}

async function trackAnalyticsEvent(type) {
  return await repository.trackAnalyticsEvent(type);
}

module.exports = {
  getPageContent,
  updateHeroSection,
  updateSkills,
  createSkill,
  deleteSkill,
  updateCompanies,
  createCompany,
  deleteCompany,
  createCompanyProject,
  deleteProject,
  updatePersonalProject,
  createPersonalProject,
  deletePersonalProject,
  updateExperience,
  createExperience,
  deleteExperience,
  syncStats,
  updateCertification,
  createCertification,
  deleteCertification,
  getAllTestimonials,
  updateTestimonials,
  createTestimonial,
  enableTestimonialById,
  deleteTestimonial,
  submitTestimonial,
  approveTestimonial,
  rejectTestimonial,
  deletePendingTestimonial,
  updateBlogPost,
  createBlogPost,
  updateBlogPostById,
  deleteBlogPost,
  getAnalytics,
  resetAnalytics,
  trackAnalyticsEvent,
};
