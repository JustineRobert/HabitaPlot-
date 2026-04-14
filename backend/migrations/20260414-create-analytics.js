/**
 * Migration: Create Analytics Table
 */

module.exports = {
  up: async (sequelize, DataTypes) => {
    await sequelize.createTable('analytics', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      branch_id: DataTypes.UUID,
      period: {
        type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly', 'yearly'),
        defaultValue: 'daily'
      },
      period_start: {
        type: DataTypes.DATE,
        allowNull: false
      },
      period_end: {
        type: DataTypes.DATE,
        allowNull: false
      },
      total_sales: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
      },
      total_transactions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      average_transaction_value: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
      },
      provider_distribution: DataTypes.JSONB,
      top_listings: DataTypes.JSONB,
      new_listings: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      active_users: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      new_users: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      conversion_rate: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      views_to_sales: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await sequelize.addIndex('analytics', ['user_id']);
    await sequelize.addIndex('analytics', ['branch_id']);
    await sequelize.addIndex('analytics', ['period_start']);
    await sequelize.addIndex('analytics', ['period', 'user_id']);
  },

  down: async (sequelize) => {
    await sequelize.dropTable('analytics');
  }
};
