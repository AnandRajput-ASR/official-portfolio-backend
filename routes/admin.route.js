const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.get('/page-content', adminController.getContent);

router.put('/heroSection', adminController.updateHeroSection);

router.put('/skills', adminController.updateSkills);
router.post('/skills', adminController.createSkill);
router.delete('/skills/:id', adminController.deleteSkill);

router.put('/companies', adminController.updateCompanies);
router.post('/companies', adminController.createCompany);
router.delete('/companies/:id', adminController.deleteCompany);

router.post('/companies/:companyId/projects', adminController.createCompanyProject);
router.delete('/projects/:projectId', adminController.deleteProject);

router.put('/personal-projects', adminController.updatePersonalProject);
router.post('/personal-projects', adminController.createPersonalProject);
router.delete('/personal-projects/:id', adminController.deletePersonalProject);

router.put('/experience', adminController.updateExperience);
router.post('/experience', adminController.createExperience);
router.delete('/experience/:id', adminController.deleteExperience);

router.put('/stats', adminController.syncStats);

router.put('/certifications', adminController.updateCertification);
router.post('/certifications', adminController.createCertification);
router.delete('/certifications/:id', adminController.deleteCertification);

router.put('/settings', adminController.updateSettings);

router.get('/testimonials/all', adminController.getAllTestimonials);
router.put('/testimonials', adminController.updateTestimonial);
router.post('/testimonials', adminController.createTestimonial);
router.put('/testimonials/:id', adminController.enableTestimonialById);
router.delete('/testimonials/:id', adminController.deleteTestimonial);

router.post('/testimonials/submit', adminController.submitTestimonial);
router.put('/testimonials/pending/:id/approve', adminController.approveTestimonial);
router.put('/testimonials/pending/:id/reject', adminController.rejectTestimonial);
router.delete('/testimonials/pending/:id', adminController.deletePendingTestimonial);

router.put('/blog', adminController.updateBlogPost);
router.post('/blog', adminController.createBlogPost);
router.put('/blog/:id', adminController.updateBlogPostById); //didnt find
router.delete('/blog/:id', adminController.deleteBlogPost);

router.get('/analytics', adminController.getAnalytics);
router.delete('/analytics/reset', adminController.resetAnalytics);
router.post('/analytics/event', adminController.trackAnalyticsEvent); // need to check

module.exports = router;
