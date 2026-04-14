/**
 * Analytics Routes
 */

const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

/**
 * Middleware to handle validation errors
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * GET /api/v1/analytics/dashboard - Get dashboard metrics
 * Query: { period: 'hourly' | 'daily' | 'weekly' | 'monthly', branchId }
 */
router.get(
  '/dashboard',
  authMiddleware,
  [
    query('period').optional().isIn(['hourly', 'daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
    query('branchId').optional().isInt().withMessage('Valid branch ID required')
  ],
  validateRequest,
  analyticsController.getDashboard
);

/**
 * GET /api/v1/analytics - Get detailed analytics
 * Query: { period, startDate, endDate, branchId }
 */
router.get(
  '/',
  authMiddleware,
  [
    query('period').optional().isIn(['hourly', 'daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
    query('startDate').optional().isISO8601().withMessage('Valid start date required'),
    query('endDate').optional().isISO8601().withMessage('Valid end date required'),
    query('branchId').optional().isInt().withMessage('Valid branch ID required')
  ],
  validateRequest,
  analyticsController.getAnalytics
);

/**
 * GET /api/v1/analytics/providers - Get provider performance
 * Query: { period }
 */
router.get(
  '/providers',
  authMiddleware,
  [query('period').optional().isIn(['hourly', 'daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid period')],
  validateRequest,
  analyticsController.getProviderMetrics
);

/**
 * GET /api/v1/analytics/revenue - Get revenue metrics
 * Query: { days }
 */
router.get(
  '/revenue',
  authMiddleware,
  [query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be 1-365')],
  validateRequest,
  analyticsController.getRevenueAnalytics
);

/**
 * GET /api/v1/analytics/conversion - Get conversion funnel
 * Query: { days }
 */
router.get(
  '/conversion',
  authMiddleware,
  [query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be 1-365')],
  validateRequest,
  analyticsController.getConversionFunnel
);

/**
 * GET /api/v1/analytics/export - Export analytics data
 * Query: { format: 'csv' | 'json', days }
 */
router.get(
  '/export',
  authMiddleware,
  [
    query('format').optional().isIn(['csv', 'json']).withMessage('Format must be csv or json'),
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be 1-365')
  ],
  validateRequest,
  analyticsController.exportAnalytics
);

module.exports = router;
