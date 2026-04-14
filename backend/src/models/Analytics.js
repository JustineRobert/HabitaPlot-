/**
 * Analytics Model
 * Stores aggregated analytics and metrics for dashboards
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Analytics = sequelize.define('Analytics', {
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
  // Period
  period: {
    type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly', 'yearly'),
    defaultValue: 'daily',
    field: 'period'
  },
  periodStart: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'period_start'
  },
  periodEnd: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'period_end'
  },
  // Sales Metrics
  totalSales: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'total_sales'
  },
  totalTransactions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_transactions'
  },
  averageTransactionValue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'average_transaction_value'
  },
  // Provider Distribution
  providerDistribution: {
    type: DataTypes.JSONB,
    defaultValue: { mtn: 0, airtel: 0, stripe: 0 },
    field: 'provider_distribution'
  },
  // Listing Performance
  topListings: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'top_listings'
  },
  newListings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'new_listings'
  },
  // User Metrics
  activeUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'active_users'
  },
  newUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'new_users'
  },
  // Conversion
  conversionRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'conversion_rate'
  },
  viewsToSales: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'views_to_sales'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'analytics',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['branch_id'] },
    { fields: ['period_start'] },
    { fields: ['period', 'user_id'] }
  ]
});

module.exports = Analytics;
