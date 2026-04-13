'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      listing_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      receipt_number: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true
      },
      provider: {
        type: Sequelize.ENUM('mtn', 'airtel', 'stripe', 'bank_transfer', 'other'),
        allowNull: false
      },
      provider_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'mobile_money'
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'cancelled', 'unknown'),
        allowNull: false,
        defaultValue: 'pending'
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'UGX'
      },
      phone_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      external_id: {
        type: Sequelize.STRING(128),
        allowNull: true
      },
      transaction_id: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true
      },
      raw_response: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      confirmed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
    await queryInterface.addIndex('transactions', ['user_id']);
    await queryInterface.addIndex('transactions', ['listing_id']);
    await queryInterface.addIndex('transactions', ['provider']);
    await queryInterface.addIndex('transactions', ['status']);
    await queryInterface.addIndex('transactions', ['transaction_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('transactions');
  }
};
