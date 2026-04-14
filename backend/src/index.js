/**
 * HabitaPlot Backend Server
 * Main entry point for Express application
 */

require('./config/validateEnv');
const express = require('express');
const morgan = require('morgan');
const { sequelize, testConnection, syncDatabase } = require('./config/database');
const enableSecurity = require('./middleware/security');
const logger = require('./config/logger');

// Import database and models
const User = require('./models/User');
const Listing = require('./models/Listing');
const Transaction = require('./models/Transaction');

// Import routes
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const branchRoutes = require('./routes/branchRoutes');

// Initialize Express app
const app = express();

// Security Middleware
enableSecurity(app);

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
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/forecasts', forecastRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);
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

  logger.error('[ERROR] %s %s %s', req.method, req.originalUrl, message, { stack: err.stack });

  res.status(status).json({
    error: err.name || 'Error',
    message,
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

    User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
    Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    Listing.hasMany(Transaction, { foreignKey: 'listingId', as: 'transactions' });
    Transaction.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

    // Test database connection
    await testConnection();

    // Sync database schema (development only)
    if (NODE_ENV === 'development') {
      await syncDatabase();
    }

    // Start listening
    app.listen(PORT, () => {
      logger.info('HabitaPlot Backend Server started successfully');
      logger.info('Environment: %s', NODE_ENV);
      logger.info('Server: http://localhost:%s', PORT);
      logger.info('API Base: http://localhost:%s/api/v1', PORT);
    });
  } catch (error) {
    logger.error('Failed to start server: %s', error.message, { stack: error.stack });
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
