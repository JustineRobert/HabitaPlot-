/**
 * Migration: Create Branches Table
 */

module.exports = {
  up: async (sequelize, DataTypes) => {
    await sequelize.createTable('branches', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: DataTypes.TEXT,
      address: DataTypes.STRING(500),
      city: DataTypes.STRING(100),
      region: DataTypes.STRING(100),
      country: {
        type: DataTypes.STRING(100),
        defaultValue: 'Uganda'
      },
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      phone_number: DataTypes.STRING(20),
      email: DataTypes.STRING(255),
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      is_headquarters: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await sequelize.addIndex('branches', ['user_id']);
    await sequelize.addIndex('branches', ['is_active']);
  },

  down: async (sequelize) => {
    await sequelize.dropTable('branches');
  }
};
