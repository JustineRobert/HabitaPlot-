/**
 * Authentication Controller
 * Handles user registration, login, and token refresh
 */

const User = require('../models/User');
const { 
  generateToken, 
  generateRefreshToken, 
  hashPassword, 
  comparePassword,
  verifyRefreshToken 
} = require('../utils/auth');

/**
 * User Registration
 * POST /api/v1/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Email, password, and name are required'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({
        error: 'ConflictError',
        message: 'Email already registered'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      phone,
      role: 'user'
    });

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user.id
    });

    // Return response (exclude password)
    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: error.message
    });
  }
};

/**
 * User Login
 * POST /api/v1/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() },
      attributes: ['id', 'email', 'name', 'role', 'passwordHash', 'isActive']
    });

    if (!user) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        error: 'AccountDeactivated',
        message: 'This account has been deactivated'
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user.id
    });

    res.status(200).json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: error.message
    });
  }
};

/**
 * Refresh Token
 * POST /api/v1/auth/refresh-token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Refresh token is required'
      });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'Invalid or expired refresh token'
      });
    }

    // Find user
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'AuthenticationError',
        message: 'User not found or account inactive'
      });
    }

    // Generate new token
    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: error.message
    });
  }
};

/**
 * Get Current User Profile
 * GET /api/v1/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: 'User not found'
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getCurrentUser
};
