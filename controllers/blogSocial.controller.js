const asyncHandler = require('../utils/asyncHandler');
const blogSocialService = require('../services/blogSocial.service');
const { validateBlogComment } = require('../validators/blogSocial.validator');

exports.getBlogSocial = asyncHandler(async (req, res) => {
  const state = await blogSocialService.getSocialState(req.params.slug, req.visitorId);
  if (!state) return res.status(404).json({ message: 'Blog post not found.' });
  return res.json(state);
});

exports.toggleBlogLike = asyncHandler(async (req, res) => {
  const state = await blogSocialService.toggleLike(req.params.slug, req.visitorId);
  if (!state) return res.status(404).json({ message: 'Blog post not found.' });
  return res.json(state);
});

exports.createBlogComment = asyncHandler(async (req, res) => {
  const parsed = validateBlogComment(req.body);
  if (parsed.error) {
    return res.status(400).json({ message: parsed.error });
  }

  const state = await blogSocialService.createComment(req.params.slug, parsed.value, req.visitorId);
  if (!state) return res.status(404).json({ message: 'Blog post not found.' });
  return res.json(state);
});

exports.incrementBlogShare = asyncHandler(async (req, res) => {
  const state = await blogSocialService.incrementShare(req.params.slug, req.visitorId);
  if (!state) return res.status(404).json({ message: 'Blog post not found.' });
  return res.json(state);
});
