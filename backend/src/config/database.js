/**
 * Database Configuration
 * Sequelize ORM configuration for PostgreSQL
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Database Connection Configuration
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'habitaplot',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: process.env.DB_LOG === 'true' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

/**
 * Test Database Connection
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
  } catch (error) {
    console.error('✗ Unable to connect to database:', error.message);
    process.exit(1);
  }
};

/**
 * Sync Database Schema (development only)
 * For production, use migrations
 */
const syncDatabase = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      await sequelize.sync({ alter: false });
      console.log('✓ Database schema synchronized');
    } catch (error) {
      console.error('✗ Error synchronizing database:', error.message);
    }
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};
