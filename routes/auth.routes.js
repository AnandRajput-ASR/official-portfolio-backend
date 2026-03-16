const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

router.post('/login', authController.login);
router.get('/verify', authMiddleware, authController.verify);
router.put('/change-password', authMiddleware, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
