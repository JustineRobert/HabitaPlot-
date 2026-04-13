/**
 * Environment configuration validation
 */

const fs = require('fs');
const path = require('path');
const dotenvSafe = require('dotenv-safe');

const envFile = path.resolve(__dirname, '../../.env');
const exampleFile = path.resolve(__dirname, '../../.env.example');

const configOptions = {
  allowEmptyValues: false,
  example: exampleFile
};

if (fs.existsSync(envFile)) {
  configOptions.path = envFile;
}

dotenvSafe.config(configOptions);

const validEnvironments = ['development', 'test', 'production'];

if (!validEnvironments.includes(process.env.NODE_ENV)) {
  throw new Error(
    `NODE_ENV must be one of ${validEnvironments.join(', ')}; got "${process.env.NODE_ENV}"`
  );
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_SSL: process.env.DB_SSL === 'true',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
  LOG_LEVEL: process.env.LOG_LEVEL
};
