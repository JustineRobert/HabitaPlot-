/**
 * Migration: Create WhatsApp Tables
 */

module.exports = {
  up: async (sequelize, DataTypes) => {
    // WhatsApp Notifications Table
    await sequelize.createTable('whatsapp_notifications', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      whatsapp_business_phone_id: DataTypes.STRING(255),
      whatsapp_access_token: DataTypes.TEXT,
      notifications_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      notify_on_new_order: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      notify_on_payment: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      notify_on_low_stock: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      low_stock_threshold: {
        type: DataTypes.INTEGER,
        defaultValue: 5
      },
      message_templates: DataTypes.JSONB,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // WhatsApp Messages Table
    await sequelize.createTable('whatsapp_messages', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      message_type: {
        type: DataTypes.ENUM('order', 'payment', 'inventory', 'marketing'),
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'sent', 'failed', 'delivered', 'read'),
        defaultValue: 'pending'
      },
      whatsapp_message_id: DataTypes.STRING(255),
      related_order_id: DataTypes.UUID,
      related_transaction_id: DataTypes.UUID,
      sent_at: DataTypes.DATE,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await sequelize.addIndex('whatsapp_notifications', ['user_id']);
    await sequelize.addIndex('whatsapp_messages', ['user_id']);
    await sequelize.addIndex('whatsapp_messages', ['phone_number']);
    await sequelize.addIndex('whatsapp_messages', ['status']);
  },

  down: async (sequelize) => {
    await sequelize.dropTable('whatsapp_messages');
    await sequelize.dropTable('whatsapp_notifications');
  }
};
