/**
 * JWT Authentication Utilities
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const ensureSecret = (secretName) => {
  const secret = process.env[secretName];

  if (!secret) {
    throw new Error(`${secretName} is required and must be configured`);
  }

  return secret;
};

/**
 * Generate JWT Token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '24h') => {
  return jwt.sign(payload, ensureSecret('JWT_SECRET'), { expiresIn });
};

/**
 * Verify JWT Token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token or null
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, ensureSecret('JWT_SECRET'));
  } catch (error) {
    return null;
  }
};

/**
 * Hash Password
 * @param {string} password - Plain password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

/**
 * Compare Password with Hash
 * @param {string} password - Plain password
 * @param {string} hash - Password hash
 * @returns {Promise<boolean>} True if password matches
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate Refresh Token
 * @param {Object} payload - Token payload
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, ensureSecret('JWT_REFRESH_SECRET'), {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

/**
 * Verify Refresh Token
 * @param {string} token - Refresh token
 * @returns {Object|null} Decoded token or null
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, ensureSecret('JWT_REFRESH_SECRET'));
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateRefreshToken,
  verifyRefreshToken
};
