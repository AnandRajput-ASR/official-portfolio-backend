const blogSocialRepository = require('../repositories/blogSocial.repository');

function toSafeCount(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.trunc(numeric));
}

function normalizeState(state) {
  if (!state) return null;

  const visibleComments = (state.comments || [])
    .filter((comment) => !comment.moderationStatus || comment.moderationStatus === 'visible')
    .map(({ moderationStatus, ...comment }) => comment);

  return {
    slug: state.slug,
    likes: toSafeCount(state.likes),
    shares: toSafeCount(state.shares),
    viewerLiked: Boolean(state.viewerLiked),
    comments: visibleComments,
  };
}

async function getSocialState(slug, visitorId) {
  const state = await blogSocialRepository.getSocialStateBySlug(slug, visitorId);
  return normalizeState(state);
}

async function toggleLike(slug, visitorId) {
  const state = await blogSocialRepository.toggleLikeBySlug(slug, visitorId);
  return normalizeState(state);
}

async function createComment(slug, payload, visitorId) {
  const state = await blogSocialRepository.createCommentBySlug(slug, payload, visitorId);
  return normalizeState(state);
}

async function incrementShare(slug, visitorId) {
  const state = await blogSocialRepository.incrementShareBySlug(slug, visitorId);
  return normalizeState(state);
}

module.exports = {
  getSocialState,
  toggleLike,
  createComment,
  incrementShare,
};
