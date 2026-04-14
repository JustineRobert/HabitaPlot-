/**
 * Forecasting Controller
 * Handle demand forecasting and inventory alert endpoints
 */

const DemandForecastingService = require('../services/forecastingService');
const { DemandForecast, InventoryAlert } = require('../models/DemandForecast');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Generate forecast for a listing
 */
exports.generateForecast = async (req, res) => {
  try {
    const { listingId, forecastDays = 30 } = req.body;
    const userId = req.user.id;

    const forecast = await DemandForecastingService.generateForecast(
      listingId,
      userId,
      forecastDays
    );

    if (!forecast) {
      return res.status(400).json({
        error: 'Insufficient historical data. Need at least 7 days of transaction history.',
        code: 'INSUFFICIENT_DATA'
      });
    }

    logger.info('[API] Forecast generated', {
      userId,
      listingId,
      forecastId: forecast.id
    });

    res.json({
      success: true,
      forecast: {
        id: forecast.id,
        listingId: forecast.listingId,
        predictedDemand: forecast.predictedDemand,
        confidence: (forecast.confidence * 100).toFixed(1) + '%',
        trend: forecast.trend,
        forecastDate: forecast.forecastDate,
        algorithm: forecast.algorithm,
        trainingDataPoints: forecast.trainingDataPoints
      }
    });
  } catch (error) {
    logger.error('[API] Forecast generation error', error.message);
    res.status(500).json({
      error: 'Failed to generate forecast',
      message: error.message
    });
  }
};

/**
 * Get forecasts for user's listings
 */
exports.getForecasts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listingId, limit = 50, offset = 0 } = req.query;

    const where = { userId };
    if (listingId) {
      where.listingId = listingId;
    }

    const forecasts = await DemandForecast.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await DemandForecast.count({ where });

    logger.info('[API] Forecasts fetched', {
      userId,
      count: forecasts.length
    });

    res.json({
      success: true,
      data: forecasts,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('[API] Failed to fetch forecasts', error.message);
    res.status(500).json({
      error: 'Failed to fetch forecasts',
      message: error.message
    });
  }
};

/**
 * Get forecast details
 */
exports.getForecastDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { forecastId } = req.params;

    const forecast = await DemandForecast.findOne({
      where: {
        id: forecastId,
        userId
      }
    });

    if (!forecast) {
      return res.status(404).json({
        error: 'Forecast not found'
      });
    }

    logger.info('[API] Forecast detail fetched', {
      forecastId,
      userId
    });

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    logger.error('[API] Failed to fetch forecast detail', error.message);
    res.status(500).json({
      error: 'Failed to fetch forecast',
      message: error.message
    });
  }
};

/**
 * Get inventory alerts for user
 */
exports.getAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isActive = true, severity, limit = 50, offset = 0 } = req.query;

    const where = { userId };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (severity) {
      where.severity = severity;
    }

    const alerts = await InventoryAlert.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await InventoryAlert.count({ where });

    logger.info('[API] Alerts fetched', {
      userId,
      count: alerts.length
    });

    res.json({
      success: true,
      data: alerts,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('[API] Failed to fetch alerts', error.message);
    res.status(500).json({
      error: 'Failed to fetch alerts',
      message: error.message
    });
  }
};

/**
 * Resolve an alert
 */
exports.resolveAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { alertId } = req.params;

    const alert = await InventoryAlert.findOne({
      where: {
        id: alertId,
        userId
      }
    });

    if (!alert) {
      return res.status(404).json({
        error: 'Alert not found'
      });
    }

    const resolved = await DemandForecastingService.resolveAlert(alertId);

    logger.info('[API] Alert resolved', {
      alertId,
      userId
    });

    res.json({
      success: true,
      message: 'Alert resolved',
      data: resolved
    });
  } catch (error) {
    logger.error('[API] Failed to resolve alert', error.message);
    res.status(500).json({
      error: 'Failed to resolve alert',
      message: error.message
    });
  }
};

/**
 * Get alert statistics
 */
exports.getAlertStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count by severity
    const bySeverity = await InventoryAlert.findAll({
      attributes: ['severity', [require('sequelize').fn('COUNT', require('sequelize').col('*')), 'count']],
      where: {
        userId,
        isActive: true
      },
      group: ['severity'],
      raw: true
    });

    // Count by type
    const byType = await InventoryAlert.findAll({
      attributes: ['alertType', [require('sequelize').fn('COUNT', require('sequelize').col('*')), 'count']],
      where: {
        userId,
        isActive: true
      },
      group: ['alertType'],
      raw: true
    });

    const totalActive = await InventoryAlert.count({
      where: {
        userId,
        isActive: true
      }
    });

    logger.info('[API] Alert stats fetched', {
      userId,
      totalActive
    });

    res.json({
      success: true,
      stats: {
        totalActive,
        bySeverity: bySeverity.reduce((map, row) => {
          map[row.severity] = parseInt(row.count);
          return map;
        }, {}),
        byType: byType.reduce((map, row) => {
          map[row.alertType] = parseInt(row.count);
          return map;
        }, {})
      }
    });
  } catch (error) {
    logger.error('[API] Failed to fetch alert stats', error.message);
    res.status(500).json({
      error: 'Failed to fetch alert statistics',
      message: error.message
    });
  }
};

/**
 * Acknowledge alert without resolving
 */
exports.acknowledgeAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { alertId } = req.params;

    const alert = await InventoryAlert.findOne({
      where: {
        id: alertId,
        userId
      }
    });

    if (!alert) {
      return res.status(404).json({
        error: 'Alert not found'
      });
    }

    alert.acknowledgedAt = new Date();
    await alert.save();

    logger.info('[API] Alert acknowledged', {
      alertId,
      userId
    });

    res.json({
      success: true,
      message: 'Alert acknowledged',
      data: alert
    });
  } catch (error) {
    logger.error('[API] Failed to acknowledge alert', error.message);
    res.status(500).json({
      error: 'Failed to acknowledge alert',
      message: error.message
    });
  }
};

/**
 * Export forecast data (CSV)
 */
exports.exportForecasts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'csv' } = req.query;

    const forecasts = await DemandForecast.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    if (format === 'json') {
      res.json({
        success: true,
        data: forecasts,
        exportedAt: new Date()
      });
    } else {
      // CSV format
      const csv = this.convertForecastsToCSV(forecasts);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="forecasts.csv"');
      res.send(csv);
    }

    logger.info('[API] Forecasts exported', {
      userId,
      count: forecasts.length,
      format
    });
  } catch (error) {
    logger.error('[API] Failed to export forecasts', error.message);
    res.status(500).json({
      error: 'Failed to export forecasts',
      message: error.message
    });
  }
};

/**
 * Helper: Convert forecasts to CSV
 */
exports.convertForecastsToCSV = (forecasts) => {
  const headers = ['ID', 'Listing ID', 'Predicted Demand', 'Confidence', 'Trend', 'Forecast Date', 'Created At'];
  const rows = forecasts.map((f) => [
    f.id,
    f.listingId,
    f.predictedDemand.toFixed(2),
    (f.confidence * 100).toFixed(1) + '%',
    f.trend,
    f.forecastDate,
    f.createdAt
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  return csv;
};
