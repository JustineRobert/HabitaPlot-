/**
 * Listing Routes
 * /api/v1/listings/...
 */

const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { authMiddleware, authenticatedMiddleware } = require('../middleware/auth');

/**
 * GET /listings
 * Get all listings (public, no auth required)
 */
router.get('/', listingController.getAllListings);

/**
 * GET /listings/:id
 * Get single listing (public, no auth required)
 */
router.get('/:id', listingController.getListingById);

/**
 * POST /listings
 * Create new listing (auth required)
 */
router.post('/', authMiddleware, listingController.createListing);

/**
 * PATCH /listings/:id
 * Update listing (auth required, owner or admin only)
 */
router.patch('/:id', authMiddleware, listingController.updateListing);

/**
 * DELETE /listings/:id
 * Delete listing (auth required, owner or admin only)
 */
router.delete('/:id', authMiddleware, listingController.deleteListing);

module.exports = router;
