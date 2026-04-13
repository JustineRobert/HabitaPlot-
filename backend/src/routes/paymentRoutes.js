/**
 * Payment Routes
 * /api/v1/payments/...
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

/**
 * GET /payments/mobile-money/providers
 * List supported Uganda mobile money providers.
 */
router.get('/mobile-money/providers', authMiddleware, paymentController.getMobileMoneyProviders);

/**
 * POST /payments/mobile-money/initiate
 * Initiate a mobile money payment request.
 */
router.post(
  '/mobile-money/initiate',
  [
    authMiddleware,
    body('provider').trim().notEmpty().withMessage('Provider is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be a 3-letter code'),
    body('listingId').optional().isUUID().withMessage('Listing ID must be a valid UUID'),
    validateRequest
  ],
  paymentController.initiateMobileMoneyPayment
);

/**
 * POST /payments/mobile-money/verify
 * Verify status for a mobile money payment.
 */
router.post(
  '/mobile-money/verify',
  [
    authMiddleware,
    body('provider').trim().notEmpty().withMessage('Provider is required'),
    body('transactionId').trim().notEmpty().withMessage('Transaction ID is required'),
    validateRequest
  ],
  paymentController.verifyMobileMoneyPayment
);

/**
 * GET /payments/transactions
 * Get current user payment transactions
 */
router.get(
  '/transactions',
  [
    authMiddleware,
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validateRequest
  ],
  paymentController.getUserTransactions
);

/**
 * GET /payments/transactions/:id
 * Get a specific transaction record for the current user.
 */
router.get(
  '/transactions/:id',
  [
    authMiddleware,
    param('id').isUUID().withMessage('Transaction ID must be a valid UUID'),
    validateRequest
  ],
  paymentController.getTransactionById
);

module.exports = router;
