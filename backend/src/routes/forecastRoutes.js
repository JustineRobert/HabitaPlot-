/**
 * Forecasting Routes
 */

const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const forecastController = require('../controllers/forecastController');

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
 * POST /api/v1/forecasts - Generate new forecast
 * Body: { listingId, forecastDays }
 */
router.post(
  '/',
  authMiddleware,
  [
    body('listingId').isInt().notEmpty().withMessage('Valid listing ID is required'),
    body('forecastDays').optional().isInt({ min: 1, max: 365 }).withMessage('Forecast days must be 1-365')
  ],
  validateRequest,
  forecastController.generateForecast
);

/**
 * GET /api/v1/forecasts - Get all forecasts for user
 * Query: { listingId, limit, offset }
 */
router.get(
  '/',
  authMiddleware,
  [
    query('listingId').optional().isInt().withMessage('Valid listing ID required'),
    query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be 1-500'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be >= 0')
  ],
  validateRequest,
  forecastController.getForecasts
);

/**
 * GET /api/v1/forecasts/:forecastId - Get forecast details
 */
router.get(
  '/:forecastId',
  authMiddleware,
  [param('forecastId').isInt().notEmpty().withMessage('Valid forecast ID is required')],
  validateRequest,
  forecastController.getForecastDetail
);

/**
 * GET /api/v1/forecasts/export/data - Export all forecasts
 * Query: { format: 'csv' | 'json' }
 */
router.get(
  '/export/data',
  authMiddleware,
  forecastController.exportForecasts
);

/**
 * ========== ALERTS ==========
 */

/**
 * GET /api/v1/alerts - Get inventory alerts
 * Query: { isActive, severity, limit, offset }
 */
router.get(
  '/alerts',
  authMiddleware,
  [
    query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    query('severity').optional().isIn(['info', 'warning', 'critical']).withMessage('Invalid severity'),
    query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be 1-500'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be >= 0')
  ],
  validateRequest,
  forecastController.getAlerts
);

/**
 * GET /api/v1/alerts/stats - Get alert statistics
 */
router.get(
  '/alerts/stats',
  authMiddleware,
  forecastController.getAlertStats
);

/**
 * POST /api/v1/alerts/:alertId/acknowledge - Acknowledge alert
 */
router.post(
  '/alerts/:alertId/acknowledge',
  authMiddleware,
  [param('alertId').isInt().notEmpty().withMessage('Valid alert ID is required')],
  validateRequest,
  forecastController.acknowledgeAlert
);

/**
 * POST /api/v1/alerts/:alertId/resolve - Resolve alert
 */
router.post(
  '/alerts/:alertId/resolve',
  authMiddleware,
  [param('alertId').isInt().notEmpty().withMessage('Valid alert ID is required')],
  validateRequest,
  forecastController.resolveAlert
);

module.exports = router;
