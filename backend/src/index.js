/**
 * HabitaPlot Backend Server
 * Main entry point for Express application
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import database and models
const { sequelize, testConnection, syncDatabase } = require('./config/database');
const User = require('./models/User');
const Listing = require('./models/Listing');

// Import routes
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging Middleware
app.use(morgan('combined'));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Version
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    name: 'HabitaPlot API',
    version: '1.0.0',
    status: 'running'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/payments', paymentRoutes);
// app.use('/api/v1/users', require('./routes/userRoutes'));
// app.use('/api/v1/messages', require('./routes/messageRoutes'));
// app.use('/api/v1/subscriptions', require('./routes/subscriptionRoutes'));
// app.use('/api/v1/admin', require('./routes/adminRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFoundError',
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error(`[ERROR] ${status}: ${message}`, err);
  
  res.status(status).json({
    error: err.name || 'Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Initialize database connection and start server
 */
const startServer = async () => {
  try {
    // Setup model associations
    User.hasMany(Listing, { foreignKey: 'userId', as: 'listings' });
    Listing.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

    // Test database connection
    await testConnection();

    // Sync database schema (development only)
    if (NODE_ENV === 'development') {
      await syncDatabase();
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════╗
║        HabitaPlot Backend Server               ║
║              Started Successfully              ║
╚════════════════════════════════════════════════╝
  
  Server:     http://localhost:${PORT}
  Environment: ${NODE_ENV}
  API Base:   http://localhost:${PORT}/api/v1
  Database:   Connected
  
  Waiting for requests...
  `);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
