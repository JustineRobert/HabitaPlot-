/**
 * WhatsApp Notification Model
 * Stores WhatsApp integration settings and message history
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WhatsAppNotification = sequelize.define('WhatsAppNotification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  // WhatsApp Configuration
  whatsappBusinessPhoneId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'whatsapp_business_phone_id'
  },
  whatsappAccessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'whatsapp_access_token'
  },
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'notifications_enabled'
  },
  // Notification Preferences
  notifyOnNewOrder: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notify_on_new_order'
  },
  notifyOnPayment: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notify_on_payment'
  },
  notifyOnLowStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notify_on_low_stock'
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    field: 'low_stock_threshold'
  },
  // Message Templates
  messageTemplates: {
    type: DataTypes.JSONB,
    defaultValue: {
      order: 'New order received: {{orderNumber}} - Amount: {{amount}}',
      payment: 'Payment confirmed: {{amount}} received from {{customer}}',
      inventory: 'Low stock alert: {{product}} quantity now {{quantity}}'
    },
    field: 'message_templates'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'whatsapp_notifications',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] }
  ]
});

const WhatsAppMessage = sequelize.define('WhatsAppMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'phone_number'
  },
  messageType: {
    type: DataTypes.ENUM('order', 'payment', 'inventory', 'marketing'),
    allowNull: false,
    field: 'message_type'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed', 'delivered', 'read'),
    defaultValue: 'pending'
  },
  whatsappMessageId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'whatsapp_message_id'
  },
  relatedOrderId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'related_order_id'
  },
  relatedTransactionId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'related_transaction_id'
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'sent_at'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'whatsapp_messages',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['phone_number'] },
    { fields: ['status'] }
  ]
});

module.exports = { WhatsAppNotification, WhatsAppMessage };
