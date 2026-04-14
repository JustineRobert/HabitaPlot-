/**
 * WhatsApp Business API Service
 * Handles integration with WhatsApp Business API for notifications
 */

const axios = require('axios');
const logger = require('../config/logger');

const WHATSAPP_API_URL = 'https://graph.instagram.com/v18.0';
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

class WhatsAppService {
  /**
   * Send a message via WhatsApp Business API
   */
  static async sendMessage(phoneNumber, message, messageType = 'text') {
    try {
      if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
        logger.warn('[WhatsApp] API credentials not configured');
        return { success: false, error: 'WhatsApp not configured' };
      }

      const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`;
      
      // Format phone number (remove + if present, ensure country code)
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      
      const payload = {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: this.getTemplateNameForType(messageType),
          language: { code: 'en_US' }
        }
      };

      // Add message body if available
      if (message && messageType === 'text') {
        payload.type = 'text';
        payload.text = { body: message };
      }

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      logger.info('[WhatsApp] Message sent successfully', {
        phoneNumber: formattedPhone,
        messageId: response.data.messages?.[0]?.id
      });

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        status: 'sent'
      };
    } catch (error) {
      logger.error('[WhatsApp] Failed to send message', {
        phoneNumber,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send notification for new order
   */
  static async notifyNewOrder(phoneNumber, orderData) {
    const message = `🎉 New order received!\nOrder #${orderData.orderNumber}\nAmount: ${orderData.currency} ${orderData.amount}\nDate: ${new Date(orderData.createdAt).toLocaleString()}`;
    
    return this.sendMessage(phoneNumber, message, 'order');
  }

  /**
   * Send notification for payment received
   */
  static async notifyPaymentReceived(phoneNumber, transactionData) {
    const message = `✅ Payment confirmed!\nAmount: ${transactionData.currency} ${transactionData.amount}\nFrom: ${transactionData.phoneNumber}\nReceipt: ${transactionData.receiptNumber}`;
    
    return this.sendMessage(phoneNumber, message, 'payment');
  }

  /**
   * Send low stock alert
   */
  static async notifyLowStock(phoneNumber, productData) {
    const message = `⚠️ Low stock alert!\nProduct: ${productData.name}\nCurrent stock: ${productData.quantity}\nReorder recommended at: ${productData.reorderLevel}`;
    
    return this.sendMessage(phoneNumber, message, 'inventory');
  }

  /**
   * Get template name based on message type
   */
  static getTemplateNameForType(type) {
    const templates = {
      order: 'order_notification',
      payment: 'payment_confirmation',
      inventory: 'low_stock_alert',
      marketing: 'marketing_message'
    };
    return templates[type] || 'generic_message';
  }

  /**
   * Verify WhatsApp webhook signature
   */
  static verifyWebhookSignature(body, signature) {
    try {
      const crypto = require('crypto');
      const appSecret = process.env.WHATSAPP_APP_SECRET;
      
      if (!appSecret) {
        return false;
      }

      const hash = crypto
        .createHmac('sha256', appSecret)
        .update(body)
        .digest('hex');

      return hash === signature;
    } catch (error) {
      logger.error('[WhatsApp] Failed to verify signature', error);
      return false;
    }
  }

  /**
   * Handle incoming WhatsApp webhook events
   */
  static async handleWebhookEvent(event) {
    try {
      const { type, data } = event;

      logger.info('[WhatsApp] Webhook event received', { type });

      switch (type) {
        case 'message':
          return this.handleIncomingMessage(data);
        case 'message_status':
          return this.handleMessageStatus(data);
        case 'account_update':
          return this.handleAccountUpdate(data);
        default:
          logger.warn('[WhatsApp] Unknown event type', type);
          return { success: false };
      }
    } catch (error) {
      logger.error('[WhatsApp] Webhook event error', error);
      return { success: false };
    }
  }

  /**
   * Handle incoming messages from customers
   */
  static async handleIncomingMessage(data) {
    logger.info('[WhatsApp] Incoming message', {
      from: data.from,
      type: data.type
    });

    // Process incoming messages
    // Can be used for customer support, inquiries, etc.
    return { success: true };
  }

  /**
   * Handle message delivery/read status
   */
  static async handleMessageStatus(data) {
    logger.info('[WhatsApp] Message status update', {
      messageId: data.id,
      status: data.status
    });

    // Update message status in database
    return { success: true };
  }

  /**
   * Handle account updates
   */
  static async handleAccountUpdate(data) {
    logger.info('[WhatsApp] Account update', data);
    return { success: true };
  }

  /**
   * Test WhatsApp connection
   */
  static async testConnection() {
    try {
      if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
        return {
          success: false,
          error: 'WhatsApp credentials not configured'
        };
      }

      const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`
        }
      });

      logger.info('[WhatsApp] Connection test successful');

      return {
        success: true,
        phoneId: response.data.id,
        displayName: response.data.display_name
      };
    } catch (error) {
      logger.error('[WhatsApp] Connection test failed', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = WhatsAppService;
