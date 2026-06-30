/**
 * Content service — public-facing read operations + hero/contact writes.
 */
const contentRepository = require('../repositories/content.repository');

function toPublicBlogPostDTO(post) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || null,
    content: post.content || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    coverImage: post.coverImage || null,
    published: Boolean(post.published),
    publishedAt: post.publishedAt || null,
    unpublishedAt: post.unpublishedAt || null,
    readingTime: Number.isFinite(Number(post.readingTime)) ? Number(post.readingTime) : null,
    displayOrder: Number.isFinite(Number(post.displayOrder)) ? Number(post.displayOrder) : 0,
  };
}

function isLivePublicPost(post, now = new Date()) {
  if (!post || post.published !== true) return false;

  const publishedAt = post.publishedAt ? new Date(post.publishedAt) : null;
  const unpublishedAt = post.unpublishedAt ? new Date(post.unpublishedAt) : null;

  if (publishedAt && publishedAt > now) return false;
  if (unpublishedAt && unpublishedAt <= now) return false;

  return true;
}

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

async function getHero() {
  const heroData = await contentRepository.getHero();
  return heroData || null;
}

async function putHero(heroContent) {
  return await contentRepository.putHero(heroContent);
}

async function getContactInfo() {
  const contactInfo = await contentRepository.getContactInfo();
  return contactInfo || null;
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

async function getPublicLiveBlogPosts() {
  const now = new Date();
  const posts = await contentRepository.getPublicLiveBlogPosts();

  return posts
    .filter((post) => isLivePublicPost(post, now))
    .sort((a, b) => {
      const aPublishedAt = a.publishedAt ? new Date(a.publishedAt).getTime() : Number.NEGATIVE_INFINITY;
      const bPublishedAt = b.publishedAt ? new Date(b.publishedAt).getTime() : Number.NEGATIVE_INFINITY;

      if (bPublishedAt !== aPublishedAt) return bPublishedAt - aPublishedAt;
      return (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0);
    })
    .map(toPublicBlogPostDTO);
}

async function getPublicLiveBlogPostBySlug(slug) {
  const now = new Date();
  const post = await contentRepository.getPublicLiveBlogPostBySlug(slug);
  if (!post || !isLivePublicPost(post, now)) return null;
  return toPublicBlogPostDTO(post);
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
  getPublicLiveBlogPosts,
  getPublicLiveBlogPostBySlug,
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
