const adminService = require('../services/admin.service');
const settingsService = require('../services/settings.service');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/response');

exports.getContent = asyncHandler(async (_, res) => {
  const data = await adminService.getPageContent();
  return res.json(data);
});

exports.updateHeroSection = asyncHandler(async (req, res) => {
  const { name, title, subtitle, bio, email, linkedin, github, location } = req.body;
  const updatedHero = await adminService.updateHeroSection({
    name, title, subtitle, bio, email, linkedin, github, location,
  });
  return ok(res, updatedHero, 'Hero section updated successfully');
});

exports.updateSkills = asyncHandler(async (req, res) => {
  const updatedSkills = await adminService.updateSkills(req.body);
  return ok(res, updatedSkills, 'Skills updated successfully');
});

exports.createSkill = asyncHandler(async (req, res) => {
  const { name, icon, accentColor, description, tags, proficiency, yearsExp, displayOrder } = req.body;
  const skill = await adminService.createSkill({
    name, icon, accentColor, description, tags, proficiency, yearsExp, displayOrder,
  });
  return ok(res, skill, 'Skill created successfully');
});

exports.deleteSkill = asyncHandler(async (req, res) => {
  const deletedSkill = await adminService.deleteSkill(req.params.id);
  if (!deletedSkill) return fail(res, 'Skill not found', 404);
  return ok(res, deletedSkill, 'Skill deleted successfully');
});

exports.updateCompanies = asyncHandler(async (req, res) => {
  const result = await adminService.updateCompanies(req.body);
  return ok(res, result, 'Companies updated successfully');
});

exports.createCompany = asyncHandler(async (req, res) => {
  const { name, role, period, location, logo, accentColor, current, description, projects } = req.body;
  const company = await adminService.createCompany({
    name, role, period, location, logo, accentColor, current, description, projects,
  });
  return ok(res, company, 'Company created successfully');
});

exports.deleteCompany = asyncHandler(async (req, res) => {
  const company = await adminService.deleteCompany(req.params.id);
  if (!company) return fail(res, 'Company not found', 404);
  return ok(res, company, 'Company deleted successfully');
});

exports.createCompanyProject = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { title, description, tech, link } = req.body;
  const project = await adminService.createCompanyProject({
    companyId, title, description, tech, link,
  });
  return ok(res, project, 'Project created successfully');
});

exports.deleteProject = asyncHandler(async (req, res) => {
  const deletedProject = await adminService.deleteProject(req.params.projectId);
  if (!deletedProject) return fail(res, 'Project not found', 404);
  return ok(res, deletedProject, 'Project deleted successfully');
});

exports.updatePersonalProject = asyncHandler(async (req, res) => {
  const updated = await adminService.updatePersonalProject(req.body);
  return ok(res, updated, 'Personal projects updated successfully');
});

exports.createPersonalProject = asyncHandler(async (req, res) => {
  const created = await adminService.createPersonalProject(req.body);
  return ok(res, created, 'Personal project created successfully');
});

exports.deletePersonalProject = asyncHandler(async (req, res) => {
  const deleted = await adminService.deletePersonalProject(req.params.id);
  if (!deleted) return fail(res, 'Project not found', 404);
  return ok(res, deleted, 'Personal project deleted successfully');
});

exports.updateExperience = asyncHandler(async (req, res) => {
  const updated = await adminService.updateExperience(req.body);
  return ok(res, updated, 'Experience updated successfully');
});

exports.createExperience = asyncHandler(async (req, res) => {
  const created = await adminService.createExperience(req.body);
  return ok(res, created, 'Experience created successfully');
});

exports.deleteExperience = asyncHandler(async (req, res) => {
  const deleted = await adminService.deleteExperience(req.params.id);
  if (!deleted) return fail(res, 'Experience not found', 404);
  return ok(res, deleted, 'Experience deleted successfully');
});

exports.syncStats = asyncHandler(async (req, res) => {
  const result = await adminService.syncStats(req.body);
  return ok(res, result, 'Stats synchronized successfully');
});

exports.updateCertification = asyncHandler(async (req, res) => {
  const updated = await adminService.updateCertification(req.body);
  return ok(res, updated, 'Certifications updated successfully');
});

exports.createCertification = asyncHandler(async (req, res) => {
  const created = await adminService.createCertification(req.body);
  return ok(res, created, 'Certification created successfully');
});

exports.deleteCertification = asyncHandler(async (req, res) => {
  const deleted = await adminService.deleteCertification(req.params.id);
  if (!deleted) return fail(res, 'Certification not found', 404);
  return ok(res, deleted, 'Certification deleted successfully');
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const updated = await settingsService.updateSiteSettings(req.body);
  return ok(res, { siteSettings: updated }, 'Settings updated successfully');
});

exports.getAllTestimonials = asyncHandler(async (_, res) => {
  const testimonials = await adminService.getAllTestimonials();
  return res.json({
    success: true,
    approved: testimonials.approved,
    pending: testimonials.pending,
  });
});

exports.updateTestimonial = asyncHandler(async (req, res) => {
  await adminService.updateTestimonials(req.body);
  return ok(res, null, 'Testimonials updated successfully');
});

exports.createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await adminService.createTestimonial(req.body);
  return ok(res, testimonial, 'Testimonial created');
});

exports.enableTestimonialById = asyncHandler(async (req, res) => {
  const testimonial = await adminService.enableTestimonialById(req.params.id, req.body);
  return ok(res, testimonial);
});

exports.deleteTestimonial = asyncHandler(async (req, res) => {
  const deleted = await adminService.deleteTestimonial(req.params.id);
  return ok(res, deleted, 'Testimonial deleted');
});

exports.submitTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await adminService.submitTestimonial(req.body);
  return ok(res, testimonial, 'Testimonial submitted for approval');
});

exports.approveTestimonial = asyncHandler(async (req, res) => {
  const approved = await adminService.approveTestimonial(req.params.id);
  return ok(res, approved, 'Testimonial approved');
});

exports.rejectTestimonial = asyncHandler(async (req, res) => {
  const rejected = await adminService.rejectTestimonial(req.params.id);
  return ok(res, rejected, 'Testimonial rejected');
});

exports.deletePendingTestimonial = asyncHandler(async (req, res) => {
  const deleted = await adminService.deletePendingTestimonial(req.params.id);
  return ok(res, deleted, 'Pending testimonial deleted');
});

exports.updateBlogPost = asyncHandler(async (req, res) => {
  const updated = await adminService.updateBlogPost(req.body);
  return ok(res, updated, 'Blog posts updated successfully');
});

exports.createBlogPost = asyncHandler(async (req, res) => {
  const post = await adminService.createBlogPost(req.body);
  return ok(res, post, 'Blog post created successfully');
});

exports.updateBlogPostById = asyncHandler(async (req, res) => {
  const post = await adminService.updateBlogPostById(req.params.id, req.body);
  return ok(res, post, 'Blog post updated');
});

exports.deleteBlogPost = asyncHandler(async (req, res) => {
  const deleted = await adminService.deleteBlogPost(req.params.id);
  return ok(res, deleted, 'Blog post deleted');
});

exports.getAnalytics = asyncHandler(async (_, res) => {
  const analytics = await adminService.getAnalytics();
  return ok(res, analytics);
});

exports.resetAnalytics = asyncHandler(async (_, res) => {
  const result = await adminService.resetAnalytics();
  return ok(res, result, 'Analytics reset successfully');
});

exports.trackAnalyticsEvent = asyncHandler(async (req, res) => {
  const result = await adminService.trackAnalyticsEvent(req.body.type);
  return ok(res, result);
});
