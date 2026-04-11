/**
 * Payment Routes
 * /api/v1/payments/...
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /payments/mobile-money/providers
 * List supported Uganda mobile money providers.
 */
router.get('/mobile-money/providers', authMiddleware, paymentController.getMobileMoneyProviders);

/**
 * POST /payments/mobile-money/initiate
 * Initiate a mobile money payment request.
 */
router.post('/mobile-money/initiate', authMiddleware, paymentController.initiateMobileMoneyPayment);

/**
 * POST /payments/mobile-money/verify
 * Verify status for a mobile money payment.
 */
router.post('/mobile-money/verify', authMiddleware, paymentController.verifyMobileMoneyPayment);

module.exports = router;
