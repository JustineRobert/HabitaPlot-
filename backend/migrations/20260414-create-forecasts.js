/**
 * Migration: Create Demand Forecast & Inventory Alert Tables
 */

module.exports = {
  up: async (sequelize, DataTypes) => {
    // Demand Forecasts Table
    await sequelize.createTable('demand_forecasts', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      listing_id: DataTypes.UUID,
      forecast_type: {
        type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly'),
        defaultValue: 'daily'
      },
      predicted_demand: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      confidence: {
        type: DataTypes.FLOAT,
        defaultValue: 0.85
      },
      trend: {
        type: DataTypes.ENUM('increasing', 'stable', 'decreasing'),
        defaultValue: 'stable'
      },
      baseline_level: DataTypes.FLOAT,
      trend_component: DataTypes.FLOAT,
      seasonal_component: DataTypes.FLOAT,
      algorithm: {
        type: DataTypes.STRING(100),
        defaultValue: 'exponential_smoothing'
      },
      training_data_points: DataTypes.INTEGER,
      forecast_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      actual_demand: DataTypes.FLOAT,
      accuracy: DataTypes.FLOAT,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    // Inventory Alerts Table
    await sequelize.createTable('inventory_alerts', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      listing_id: DataTypes.UUID,
      alert_type: {
        type: DataTypes.ENUM('low_stock', 'overstock', 'slow_moving', 'reorder_recommended'),
        allowNull: false
      },
      severity: {
        type: DataTypes.ENUM('info', 'warning', 'critical'),
        defaultValue: 'warning'
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      recommended_action: DataTypes.TEXT,
      recommended_quantity: DataTypes.INTEGER,
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      resolved_at: DataTypes.DATE,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await sequelize.addIndex('demand_forecasts', ['user_id']);
    await sequelize.addIndex('demand_forecasts', ['listing_id']);
    await sequelize.addIndex('demand_forecasts', ['forecast_date']);
    await sequelize.addIndex('inventory_alerts', ['user_id']);
    await sequelize.addIndex('inventory_alerts', ['listing_id']);
    await sequelize.addIndex('inventory_alerts', ['is_active']);
  },

  down: async (sequelize) => {
    await sequelize.dropTable('inventory_alerts');
    await sequelize.dropTable('demand_forecasts');
  }
};
