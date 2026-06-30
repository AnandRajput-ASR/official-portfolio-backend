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

  const { id: heroId, ...heroRest } = heroData || {};
  const { id: contactInfoId, ...contactRest } = contactInfo || {};

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
  const testimonial = await repository.submitTestimonial(payload);
  // Fire-and-forget email notification (non-blocking)
  const { sendTestimonialNotification } = require('./email.service');
  sendTestimonialNotification({ ...payload, ...testimonial }).catch(() => {});
  return testimonial;
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

function getTargetStatus(action) {
  const map = {
    hide: 'hidden',
    unhide: 'visible',
    delete: 'deleted',
    restore: 'visible',
  };
  return map[action] || null;
}

function assertValidTransition(action, currentStatus) {
  const allowed = {
    hide: new Set(['visible']),
    unhide: new Set(['hidden']),
    delete: new Set(['visible', 'hidden']),
    restore: new Set(['deleted']),
  };

  if (!allowed[action] || !allowed[action].has(currentStatus)) {
    const err = new Error(`Invalid moderation transition: cannot ${action} from ${currentStatus}.`);
    err.statusCode = 409;
    throw err;
  }
}

async function getBlogComments(slug, status = 'all') {
  return await repository.getBlogCommentsBySlug(slug, status);
}

async function moderateComment(slug, commentId, action, adminUser, reason) {
  const nextStatus = getTargetStatus(action);
  if (!nextStatus) {
    const err = new Error('Invalid moderation action. Allowed actions: hide, unhide, delete, restore.');
    err.statusCode = 400;
    throw err;
  }

  const moderationReason = typeof reason === 'string' ? reason.trim() : '';
  if (moderationReason.length > 300) {
    const err = new Error('Reason is too long (max 300 characters).');
    err.statusCode = 400;
    throw err;
  }

  const moderatedBy = adminUser?.username || adminUser?.sub || adminUser?.id || null;

  const existing = await repository.getBlogCommentsBySlug(slug, 'all');
  const current = existing.comments.find((comment) => comment.id === commentId);

  if (!current) {
    const err = new Error('Comment not found for this slug.');
    err.statusCode = 404;
    throw err;
  }

  assertValidTransition(action, current.moderationStatus);

  const updated = await repository.moderateBlogComment({
    slug,
    commentId,
    action,
    nextStatus,
    reason: moderationReason || null,
    moderatedBy,
  });

  if (!updated) {
    const err = new Error('Comment not found for this slug.');
    err.statusCode = 404;
    throw err;
  }

  return updated.comment;
}

async function softDeleteBlogComment(slug, commentId, adminUser, reason) {
  return await moderateComment(slug, commentId, 'delete', adminUser, reason);
}

async function hardDeleteBlogComment(slug, commentId, adminUser) {
  const moderatedBy = adminUser?.username || adminUser?.sub || adminUser?.id || null;
  const deleted = await repository.hardDeleteBlogComment({ slug, commentId, moderatedBy });
  if (!deleted) {
    const err = new Error('Comment not found for this slug.');
    err.statusCode = 404;
    throw err;
  }
  return deleted;
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
  getBlogComments,
  moderateComment,
  softDeleteBlogComment,
  hardDeleteBlogComment,
  getAnalytics,
  resetAnalytics,
  trackAnalyticsEvent,
};
