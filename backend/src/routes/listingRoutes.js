/**
 * Listing Routes
 * /api/v1/listings/...
 */

const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { authMiddleware } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

/**
 * GET /listings
 * Get all listings (public, no auth required)
 */
router.get('/', listingController.getAllListings);

/**
 * GET /listings/:id
 * Get single listing (public, no auth required)
 */
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Listing ID must be a valid UUID'), validateRequest],
  listingController.getListingById
);

/**
 * POST /listings
 * Create new listing (auth required)
 */
router.post(
  '/',
  [
    authMiddleware,
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('type')
      .isIn(['plot', 'house', 'apartment', 'commercial', 'rental'])
      .withMessage('Type must be one of plot, house, apartment, commercial, rental'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('locationAddress').trim().notEmpty().withMessage('Location address is required'),
    body('locationLatitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('locationLongitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
    body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
    validateRequest
  ],
  listingController.createListing
);

/**
 * PATCH /listings/:id
 * Update listing (auth required, owner or admin only)
 */
router.patch(
  '/:id',
  [
    authMiddleware,
    param('id').isUUID().withMessage('Listing ID must be a valid UUID'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('bedrooms').optional().isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
    body('bathrooms').optional().isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
    validateRequest
  ],
  listingController.updateListing
);

/**
 * DELETE /listings/:id
 * Delete listing (auth required, owner or admin only)
 */
router.delete(
  '/:id',
  [authMiddleware, param('id').isUUID().withMessage('Listing ID must be a valid UUID'), validateRequest],
  listingController.deleteListing
);

module.exports = router;
