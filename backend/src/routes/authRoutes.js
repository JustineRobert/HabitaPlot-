/**
 * Authentication Routes
 * /api/v1/auth/...
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

/**
 * POST /auth/register
 * Register a new user
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').optional().isMobilePhone('any').withMessage('Phone number is invalid'),
    validateRequest
  ],
  authController.register
);

/**
 * POST /auth/login
 * User login
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  authController.login
);

/**
 * POST /auth/refresh-token
 * Refresh JWT token
 */
router.post(
  '/refresh-token',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validateRequest
  ],
  authController.refreshToken
);

/**
 * GET /auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
