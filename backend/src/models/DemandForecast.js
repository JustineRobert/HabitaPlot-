/**
 * Demand Forecast Model
 * Stores AI-generated demand forecasts and predictions
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DemandForecast = sequelize.define('DemandForecast', {
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
  forecastType: {
    type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly'),
    defaultValue: 'daily',
    field: 'forecast_type'
  },
  // Forecast Data
  predictedDemand: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'predicted_demand'
  },
  confidence: {
    type: DataTypes.FLOAT,
    defaultValue: 0.85,
    field: 'confidence'
  },
  trend: {
    type: DataTypes.ENUM('increasing', 'stable', 'decreasing'),
    defaultValue: 'stable'
  },
  // Forecast Details
  baselineLevel: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'baseline_level'
  },
  trendComponent: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'trend_component'
  },
  seasonalComponent: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'seasonal_component'
  },
  // Metadata
  algorithm: {
    type: DataTypes.STRING(100),
    defaultValue: 'exponential_smoothing',
    field: 'algorithm'
  },
  trainingDataPoints: {
    type: DataTypes.INTEGER,
    field: 'training_data_points'
  },
  forecastDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'forecast_date'
  },
  // Actual vs Forecast
  actualDemand: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'actual_demand'
  },
  accuracy: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'accuracy'
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
  tableName: 'demand_forecasts',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['listing_id'] },
    { fields: ['forecast_date'] }
  ]
});

/**
 * Inventory Alert Model
 * Alerts based on forecast and actual inventory levels
 */
const InventoryAlert = sequelize.define('InventoryAlert', {
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
  alertType: {
    type: DataTypes.ENUM('low_stock', 'overstock', 'slow_moving', 'reorder_recommended'),
    allowNull: false,
    field: 'alert_type'
  },
  severity: {
    type: DataTypes.ENUM('info', 'warning', 'critical'),
    defaultValue: 'warning',
    field: 'severity'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // Recommendation
  recommendedAction: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'recommended_action'
  },
  recommendedQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'recommended_quantity'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at'
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
  tableName: 'inventory_alerts',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['listing_id'] },
    { fields: ['is_active'] }
  ]
});

module.exports = { DemandForecast, InventoryAlert };
