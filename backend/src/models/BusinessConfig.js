/**
 * Business Configuration Model
 * Stores multi-currency, tax, and branch settings
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BusinessConfig = sequelize.define('BusinessConfig', {
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
  branchId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'branch_id'
  },
  // Currency Configuration
  primaryCurrency: {
    type: DataTypes.STRING(3),
    defaultValue: 'UGX',
    field: 'primary_currency'
  },
  acceptedCurrencies: {
    type: DataTypes.JSONB,
    defaultValue: ['UGX', 'USD', 'KES'],
    field: 'accepted_currencies'
  },
  // Tax Configuration
  taxEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'tax_enabled'
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 18.0,
    field: 'tax_rate'
  },
  taxName: {
    type: DataTypes.STRING(100),
    defaultValue: 'VAT',
    field: 'tax_name'
  },
  // Exchange Rates (cached)
  exchangeRates: {
    type: DataTypes.JSONB,
    defaultValue: { USD: 3700, GBP: 4650, KES: 32, ZAR: 200 },
    field: 'exchange_rates'
  },
  exchangeRatesUpdatedAt: {
    type: DataTypes.DATE,
    field: 'exchange_rates_updated_at'
  },
  // Business Info
  businessName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'business_name'
  },
  businessType: {
    type: DataTypes.ENUM('individual', 'sole_proprietor', 'llc', 'corporation'),
    defaultValue: 'individual',
    field: 'business_type'
  },
  taxId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'tax_id'
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
  tableName: 'business_configs',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['branch_id'] }
  ]
});

module.exports = BusinessConfig;
