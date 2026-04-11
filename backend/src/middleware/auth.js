/**
 * Authentication Middleware
 * Protects routes requiring JWT tokens and validates user roles
 */

const { verifyToken } = require('../utils/auth');

/**
 * Middleware to verify JWT token
 * Attaches decoded user info to req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'Invalid or expired token'
      });
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    res.status(500).json({
      error: 'InternalServerError',
      message: error.message
    });
  }
};

/**
 * Middleware to verify user role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'AuthorizationError',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware to check admin role
 */
const adminMiddleware = roleMiddleware(['admin']);

/**
 * Middleware to check agent or admin role
 */
const agentMiddleware = roleMiddleware(['agent', 'admin']);

/**
 * Middleware to check authenticated user (any role except guest)
 */
const authenticatedMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'AuthenticationError',
      message: 'Authentication required'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  adminMiddleware,
  agentMiddleware,
  authenticatedMiddleware
};
