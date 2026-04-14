/**
 * WhatsApp Notification Routes
 * /api/v1/whatsapp/...
 */

const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const { authMiddleware } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

/**
 * GET /whatsapp/webhook
 * Verify webhook with WhatsApp (required for subscription)
 */
router.get('/webhook', whatsappController.verifyWebhook);

/**
 * POST /whatsapp/webhook
 * Receive webhook events from WhatsApp
 */
router.post('/webhook', whatsappController.handleWebhook);

/**
 * GET /whatsapp/config
 * Get user's WhatsApp notification configuration
 */
router.get(
  '/config',
  authMiddleware,
  whatsappController.getWhatsAppConfig
);

/**
 * POST /whatsapp/config
 * Update WhatsApp notification settings
 */
router.post(
  '/config',
  [
    authMiddleware,
    body('notificationsEnabled').optional().isBoolean(),
    body('notifyOnNewOrder').optional().isBoolean(),
    body('notifyOnPayment').optional().isBoolean(),
    body('notifyOnLowStock').optional().isBoolean(),
    body('lowStockThreshold').optional().isInt({ min: 1, max: 1000 }),
    validateRequest
  ],
  whatsappController.updateWhatsAppConfig
);

/**
 * POST /whatsapp/test
 * Test WhatsApp connection
 */
router.post(
  '/test',
  authMiddleware,
  whatsappController.testWhatsAppConnection
);

/**
 * POST /whatsapp/send
 * Send a test WhatsApp message
 */
router.post(
  '/send',
  [
    authMiddleware,
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
    body('message').optional().trim(),
    validateRequest
  ],
  whatsappController.sendTestMessage
);

/**
 * GET /whatsapp/messages
 * Get message history
 */
router.get(
  '/messages',
  [
    authMiddleware,
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    query('status').optional().isIn(['pending', 'sent', 'failed', 'delivered', 'read']),
    validateRequest
  ],
  whatsappController.getMessageHistory
);

/**
 * POST /whatsapp/notify-payment
 * Send payment notification via WhatsApp
 */
router.post(
  '/notify-payment',
  [
    authMiddleware,
    body('transactionId').isUUID().withMessage('Transaction ID must be a valid UUID'),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
    validateRequest
  ],
  whatsappController.notifyPayment
);

module.exports = router;
