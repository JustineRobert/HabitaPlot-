/**
 * Authentication Routes
 * /api/v1/auth/...
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', authController.register);

/**
 * POST /auth/login
 * User login
 */
router.post('/login', authController.login);

/**
 * POST /auth/refresh-token
 * Refresh JWT token
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * GET /auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
