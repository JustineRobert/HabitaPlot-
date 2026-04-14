/**
 * Branch Management Routes
 */

const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const branchController = require('../controllers/branchController');

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
 * POST /api/v1/branches - Create new branch
 * Body: { name, address, city, region, country, latitude, longitude, phoneNumber, email, isHeadquarters }
 */
router.post(
  '/',
  authMiddleware,
  [
    body('name').trim().notEmpty().withMessage('Branch name is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('region').trim().notEmpty().withMessage('Region is required'),
    body('country').trim().notEmpty().withMessage('Country is required'),
    body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    body('phoneNumber').optional().trim(),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('isHeadquarters').optional().isBoolean().withMessage('isHeadquarters must be boolean')
  ],
  validateRequest,
  branchController.createBranch
);

/**
 * GET /api/v1/branches - Get all branches
 * Query: { isActive, limit, offset }
 */
router.get(
  '/',
  authMiddleware,
  [
    query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be 1-500'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be >= 0')
  ],
  validateRequest,
  branchController.getBranches
);

/**
 * GET /api/v1/branches/:branchId - Get single branch
 */
router.get(
  '/:branchId',
  authMiddleware,
  [param('branchId').isInt().notEmpty().withMessage('Valid branch ID is required')],
  validateRequest,
  branchController.getBranch
);

/**
 * PUT /api/v1/branches/:branchId - Update branch
 * Body: { name, address, city, region, country, latitude, longitude, phoneNumber, email, isActive }
 */
router.put(
  '/:branchId',
  authMiddleware,
  [
    param('branchId').isInt().notEmpty().withMessage('Valid branch ID is required'),
    body('name').optional().trim().notEmpty().withMessage('Branch name cannot be empty'),
    body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
    body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
    body('region').optional().trim().notEmpty().withMessage('Region cannot be empty'),
    body('country').optional().trim().notEmpty().withMessage('Country cannot be empty'),
    body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    body('phoneNumber').optional().trim(),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
  ],
  validateRequest,
  branchController.updateBranch
);

/**
 * POST /api/v1/branches/:branchId/headquarters - Set as headquarters
 */
router.post(
  '/:branchId/headquarters',
  authMiddleware,
  [param('branchId').isInt().notEmpty().withMessage('Valid branch ID is required')],
  validateRequest,
  branchController.setHeadquarters
);

/**
 * GET /api/v1/branches/:branchId/stats - Get branch statistics
 */
router.get(
  '/:branchId/stats',
  authMiddleware,
  [param('branchId').isInt().notEmpty().withMessage('Valid branch ID is required')],
  validateRequest,
  branchController.getBranchStats
);

/**
 * DELETE /api/v1/branches/:branchId - Delete branch
 */
router.delete(
  '/:branchId',
  authMiddleware,
  [param('branchId').isInt().notEmpty().withMessage('Valid branch ID is required')],
  validateRequest,
  branchController.deleteBranch
);

module.exports = router;
