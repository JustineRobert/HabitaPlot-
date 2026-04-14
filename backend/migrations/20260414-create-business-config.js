/**
 * Migration: Create Business Configuration Table
 */

module.exports = {
  up: async (sequelize, DataTypes) => {
    await sequelize.createTable('business_configs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      branch_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      primary_currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'UGX'
      },
      accepted_currencies: {
        type: DataTypes.JSONB,
        defaultValue: ['UGX', 'USD', 'KES']
      },
      tax_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      tax_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 18.0
      },
      tax_name: {
        type: DataTypes.STRING(100),
        defaultValue: 'VAT'
      },
      exchange_rates: {
        type: DataTypes.JSONB,
        defaultValue: { USD: 3700, GBP: 4650, KES: 32, ZAR: 200 }
      },
      exchange_rates_updated_at: DataTypes.DATE,
      business_name: DataTypes.STRING(255),
      business_type: {
        type: DataTypes.ENUM('individual', 'sole_proprietor', 'llc', 'corporation'),
        defaultValue: 'individual'
      },
      tax_id: DataTypes.STRING(50),
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await sequelize.addIndex('business_configs', ['user_id']);
    await sequelize.addIndex('business_configs', ['branch_id']);
  },

  down: async (sequelize) => {
    await sequelize.dropTable('business_configs');
  }
};
