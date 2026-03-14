const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

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

module.exports = router;
