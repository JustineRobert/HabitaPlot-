/**
 * Transaction Model
 * Tracks payment history, provider status, and printable receipt details.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
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
  listingId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'listing_id'
  },
  receiptNumber: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  provider: {
    type: DataTypes.ENUM('mtn', 'airtel', 'stripe', 'bank_transfer', 'other'),
    allowNull: false
  },
  providerName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'mobile_money'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled', 'unknown'),
    defaultValue: 'pending',
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'UGX'
  },
  phoneNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'phone_number'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  externalId: {
    type: DataTypes.STRING(128),
    allowNull: true,
    field: 'external_id'
  },
  transactionId: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
    field: 'transaction_id'
  },
  rawResponse: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'raw_response'
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'confirmed_at'
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
  tableName: 'transactions',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['listing_id'] },
    { fields: ['provider'] },
    { fields: ['status'] },
    { fields: ['transaction_id'] },
    { fields: ['created_at'] }
  ]
});

Transaction.beforeCreate((transaction) => {
  if (!transaction.receiptNumber) {
    transaction.receiptNumber = `RCT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
});

module.exports = Transaction;
