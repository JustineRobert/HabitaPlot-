/**
 * Request validation middleware
 */

const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid request payload',
      details: errors.array().map(({ msg, param, value }) => ({ param, message: msg, value }))
    });
  }

  return next();
};

module.exports = validateRequest;
