/**
 * WhatsApp Notification Controller
 * Manages WhatsApp Business API integration and notifications
 */

const WhatsAppService = require('../services/whatsappService');
const { WhatsAppNotification, WhatsAppMessage } = require('../models/WhatsAppNotification');
const Transaction = require('../models/Transaction');
const logger = require('../config/logger');

/**
 * GET /whatsapp/config
 * Get user's WhatsApp notification settings
 */
exports.getWhatsAppConfig = async (req, res) => {
  try {
    const config = await WhatsAppNotification.findOne({
      where: { userId: req.user.userId },
      attributes: {
        exclude: ['whatsapp_access_token']
      }
    });

    if (!config) {
      return res.status(200).json({
        success: true,
        data: {
          notificationsEnabled: false,
          notifyOnNewOrder: true,
          notifyOnPayment: true,
          notifyOnLowStock: true
        }
      });
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('[WHATSAPP GET CONFIG ERROR]', error.message);
    res.status(500).json({
      error: 'ConfigFetchError',
      message: error.message
    });
  }
};

/**
 * POST /whatsapp/config
 * Update WhatsApp notification settings
 */
exports.updateWhatsAppConfig = async (req, res) => {
  try {
    const { notificationsEnabled, notifyOnNewOrder, notifyOnPayment, notifyOnLowStock, lowStockThreshold } = req.body;

    let config = await WhatsAppNotification.findOne({
      where: { userId: req.user.userId }
    });

    if (!config) {
      config = await WhatsAppNotification.create({
        userId: req.user.userId,
        notificationsEnabled,
        notifyOnNewOrder: notifyOnNewOrder !== false,
        notifyOnPayment: notifyOnPayment !== false,
        notifyOnLowStock: notifyOnLowStock !== false,
        lowStockThreshold: lowStockThreshold || 5
      });
    } else {
      config.notificationsEnabled = notificationsEnabled !== false;
      config.notifyOnNewOrder = notifyOnNewOrder !== false;
      config.notifyOnPayment = notifyOnPayment !== false;
      config.notifyOnLowStock = notifyOnLowStock !== false;
      config.lowStockThreshold = lowStockThreshold || config.lowStockThreshold;
      await config.save();
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('[WHATSAPP UPDATE CONFIG ERROR]', error.message);
    res.status(500).json({
      error: 'ConfigUpdateError',
      message: error.message
    });
  }
};

/**
 * POST /whatsapp/test
 * Test WhatsApp connection
 */
exports.testWhatsAppConnection = async (req, res) => {
  try {
    const result = await WhatsAppService.testConnection();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('[WHATSAPP TEST ERROR]', error.message);
    res.status(500).json({
      error: 'TestError',
      message: error.message
    });
  }
};

/**
 * POST /whatsapp/send
 * Send a test WhatsApp message
 */
exports.sendTestMessage = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Phone number is required'
      });
    }

    const result = await WhatsAppService.sendMessage(
      phoneNumber,
      message || 'This is a test message from HabitaPlot'
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // Save message to database
    await WhatsAppMessage.create({
      userId: req.user.userId,
      phoneNumber,
      messageType: 'marketing',
      content: message || 'Test message',
      status: 'sent',
      whatsappMessageId: result.messageId,
      sentAt: new Date()
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('[WHATSAPP SEND ERROR]', error.message);
    res.status(500).json({
      error: 'SendError',
      message: error.message
    });
  }
};

/**
 * GET /whatsapp/messages
 * Get message history
 */
exports.getMessageHistory = async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;

    const where = { userId: req.user.userId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await WhatsAppMessage.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        limit,
        offset
      }
    });
  } catch (error) {
    logger.error('[WHATSAPP MESSAGE HISTORY ERROR]', error.message);
    res.status(500).json({
      error: 'HistoryFetchError',
      message: error.message
    });
  }
};

/**
 * POST /whatsapp/webhook
 * Receive webhook events from WhatsApp
 */
exports.handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-hub-signature'];
    if (!WhatsAppService.verifyWebhookSignature(JSON.stringify(req.body), signature)) {
      logger.warn('[WHATSAPP WEBHOOK] Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { object, entry } = req.body;

    if (object !== 'whatsapp_business_account') {
      return res.status(200).json({ success: true });
    }

    // Process each entry
    for (const item of entry) {
      for (const change of item.changes || []) {
        const event = change.value;

        if (event.messages) {
          for (const message of event.messages) {
            await WhatsAppService.handleIncomingMessage({
              from: message.from,
              type: message.type,
              text: message.text?.body,
              timestamp: message.timestamp
            });
          }
        }

        if (event.statuses) {
          for (const status of event.statuses) {
            await WhatsAppService.handleMessageStatus({
              id: status.id,
              status: status.status,
              timestamp: status.timestamp
            });

            // Update message status in database
            await WhatsAppMessage.update(
              { status: status.status },
              { where: { whatsappMessageId: status.id } }
            );
          }
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('[WHATSAPP WEBHOOK ERROR]', error.message);
    res.status(500).json({
      error: 'WebhookError',
      message: error.message
    });
  }
};

/**
 * GET /whatsapp/webhook
 * Verify webhook subscription (required by WhatsApp)
 */
exports.verifyWebhook = (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('[WHATSAPP] Webhook verified');
    res.status(200).send(challenge);
  } else {
    logger.warn('[WHATSAPP] Webhook verification failed');
    res.status(403).send('Forbidden');
  }
};

/**
 * POST /whatsapp/notify-payment
 * Send payment notification via WhatsApp
 */
exports.notifyPayment = async (req, res) => {
  try {
    const { transactionId, phoneNumber } = req.body;

    if (!transactionId || !phoneNumber) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Transaction ID and phone number are required'
      });
    }

    const transaction = await Transaction.findOne({
      where: { id: transactionId, userId: req.user.userId }
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: 'Transaction not found'
      });
    }

    const result = await WhatsAppService.notifyPaymentReceived(phoneNumber, {
      currency: transaction.currency,
      amount: transaction.amount,
      phoneNumber: transaction.phoneNumber,
      receiptNumber: transaction.receiptNumber
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('[WHATSAPP NOTIFY PAYMENT ERROR]', error.message);
    res.status(500).json({
      error: 'NotificationError',
      message: error.message
    });
  }
};

module.exports = exports;
