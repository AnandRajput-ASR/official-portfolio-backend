const contentService = require('../services/content.service');
const asyncHandler = require('../utils/asyncHandler');

exports.getContent = asyncHandler(async (_, res) => {
  const data = await contentService.getPageContent();
  return res.json(data);
});

exports.getHero = asyncHandler(async (_, res) => {
  const hero = await contentService.getHero();
  return res.json(hero);
});

exports.getSkills = asyncHandler(async (_, res) => {
  return res.json(await contentService.getSkills());
});

exports.getCompanies = asyncHandler(async (_, res) => {
  return res.json(await contentService.getCompanies());
});

exports.getPersonalProjects = asyncHandler(async (_, res) => {
  return res.json(await contentService.getPersonalProjects());
});

exports.getExperience = asyncHandler(async (_, res) => {
  return res.json(await contentService.getExperience());
});

exports.getStats = asyncHandler(async (_, res) => {
  return res.json(await contentService.getStats());
});

exports.getCertification = asyncHandler(async (_, res) => {
  return res.json(await contentService.getCertification());
});

exports.getTestimonials = asyncHandler(async (_, res) => {
  return res.json(await contentService.getTestimonials());
});

exports.getBlogPosts = asyncHandler(async (_, res) => {
  return res.json(await contentService.getBlogPosts());
});

exports.getAnalytics = asyncHandler(async (_, res) => {
  return res.json(await contentService.getAnalytics());
});

exports.getPendingTestimonials = asyncHandler(async (_, res) => {
  return res.json(await contentService.getPendingTestimonials());
});

exports.getSettings = asyncHandler(async (_, res) => {
  const settings = await contentService.getSiteSettings();
  return res.json(settings);
});

exports.trackAnalyticsEvent = asyncHandler(async (req, res) => {
  const { event, projectName, projectId } = req.body;
  if (!event) return res.status(400).json({ message: 'event is required' });
  const result = await contentService.trackAnalyticsEvent(event, { projectName: projectName || projectId });
  return res.json({ success: true, data: result });
});

exports.trackResumeLead = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
  const ua = req.headers['user-agent'] || null;
  const lead = await contentService.saveResumeLead({ email: email.trim().toLowerCase(), ip, ua });
  // Fire-and-forget notification email — don't block the response
  const { sendResumeLeadNotification } = require('../services/email.service');
  sendResumeLeadNotification(lead).catch(() => {});
  return res.json({ success: true, message: 'Lead recorded' });
});

exports.reorderSection = asyncHandler(async (req, res) => {
  const { section } = req.params;
  const items = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ message: 'Body must be an array of { id, displayOrder }' });
  const result = await contentService.reorderSection(section, items);
  return res.json({ success: true, ...result });
});
