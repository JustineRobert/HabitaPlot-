/**
 * Demand Forecasting Service
 * AI-powered demand forecasting using multiple algorithms
 */

const Transaction = require('../models/Transaction');
const { DemandForecast, InventoryAlert } = require('../models/DemandForecast');
const Listing = require('../models/Listing');
const logger = require('../config/logger');
const { Op } = require('sequelize');

class DemandForecastingService {
  /**
   * Generate demand forecast for a listing
   */
  static async generateForecast(listingId, userId, forecastDays = 30) {
    try {
      logger.info('[FORECAST] Generating forecast', {
        listingId,
        forecastDays
      });

      // Get historical transaction data
      const historicalData = await this.getHistoricalData(listingId, 90); // Last 90 days

      if (historicalData.length < 7) {
        logger.warn('[FORECAST] Insufficient data for forecasting', {
          listingId,
          dataPoints: historicalData.length
        });
        return null;
      }

      // Calculate demand trend
      const forecast = this.exponentialSmoothing(historicalData, forecastDays);

      // Detect seasonality
      const seasonal = this.detectSeasonality(historicalData);

      // Calculate trend
      const trend = this.calculateTrend(historicalData);

      // Create forecast record
      const demandForecast = await DemandForecast.create({
        userId,
        listingId,
        forecastType: 'daily',
        predictedDemand: forecast.prediction,
        confidence: forecast.confidence,
        trend: trend.direction,
        baselineLevel: forecast.baseline,
        trendComponent: trend.slope,
        seasonalComponent: seasonal.strength,
        algorithm: 'exponential_smoothing',
        trainingDataPoints: historicalData.length,
        forecastDate: new Date(Date.now() + forecastDays * 24 * 60 * 60 * 1000)
      });

      logger.info('[FORECAST] Forecast generated', {
        forecastId: demandForecast.id,
        prediction: forecast.prediction
      });

      // Generate inventory alerts if needed
      await this.generateInventoryAlerts(userId, listingId, forecast);

      return demandForecast;
    } catch (error) {
      logger.error('[FORECAST] Generation error', error.message);
      throw error;
    }
  }

  /**
   * Exponential Smoothing Algorithm
   */
  static exponentialSmoothing(data, periods) {
    if (data.length === 0) {
      return { prediction: 0, confidence: 0, baseline: 0 };
    }

    // Simple exponential smoothing
    const alpha = 0.3; // Smoothing factor
    let levelComponent = data[0];

    for (let i = 1; i < data.length; i++) {
      levelComponent = alpha * data[i] + (1 - alpha) * levelComponent;
    }

    // Estimate trend
    let trend = 0;
    if (data.length > 1) {
      const diffs = [];
      for (let i = 1; i < data.length; i++) {
        diffs.push(data[i] - data[i - 1]);
      }
      trend = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    }

    // Make prediction
    const prediction = levelComponent + trend * periods;

    // Confidence based on data consistency
    const variance = this.calculateVariance(data);
    const confidence = Math.max(0.5, Math.min(0.95, 1 - variance / 100));

    return {
      prediction: Math.max(0, prediction),
      confidence,
      baseline: levelComponent
    };
  }

  /**
   * Detect seasonality in data
   */
  static detectSeasonality(data) {
    try {
      if (data.length < 14) {
        return { strength: 0, period: null };
      }

      // Check for weekly patterns (7-day cycle)
      const weeklyPattern = [];
      for (let i = 0; i < 7; i++) {
        let sum = 0;
        let count = 0;
        for (let j = i; j < data.length; j += 7) {
          sum += data[j];
          count++;
        }
        weeklyPattern.push(sum / count);
      }

      // Calculate seasonality strength
      const mean = data.reduce((a, b) => a + b, 0) / data.length;
      const seasonalVar = weeklyPattern.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 7;
      const totalVar = this.calculateVariance(data);

      const strength = totalVar > 0 ? seasonalVar / totalVar : 0;

      return {
        strength: Math.min(strength, 1),
        period: 7
      };
    } catch (error) {
      logger.warn('[FORECAST] Seasonality detection error', error.message);
      return { strength: 0, period: null };
    }
  }

  /**
   * Calculate trend direction
   */
  static calculateTrend(data) {
    if (data.length < 2) {
      return { direction: 'stable', slope: 0 };
    }

    // Linear regression
    const n = data.length;
    const sum_x = (n * (n + 1)) / 2;
    const sum_y = data.reduce((a, b) => a + b, 0);
    const sum_xy = data.reduce((sum, val, idx) => sum + val * (idx + 1), 0);
    const sum_xx = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);

    let direction = 'stable';
    if (slope > 0.5) {
      direction = 'increasing';
    } else if (slope < -0.5) {
      direction = 'decreasing';
    }

    return { direction, slope };
  }

  /**
   * Calculate variance for confidence estimation
   */
  static calculateVariance(data) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance) / mean * 100; // CV as percentage
  }

  /**
   * Get historical transaction data
   */
  static async getHistoricalData(listingId, days) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const transactions = await Transaction.findAll({
        where: {
          listingId,
          createdAt: { [Op.gte]: startDate },
          status: 'completed'
        },
        attributes: ['amount', 'createdAt'],
        order: [['createdAt', 'ASC']],
        raw: true
      });

      // Aggregate by day
      const dailyData = {};
      transactions.forEach((txn) => {
        const date = txn.createdAt.toISOString().split('T')[0];
        dailyData[date] = (dailyData[date] || 0) + parseFloat(txn.amount);
      });

      // Return as array of values
      return Object.values(dailyData);
    } catch (error) {
      logger.warn('[FORECAST] Failed to get historical data', error.message);
      return [];
    }
  }

  /**
   * Generate inventory alerts based on forecast
   */
  static async generateInventoryAlerts(userId, listingId, forecast) {
    try {
      const listing = await Listing.findByPk(listingId);

      if (!listing) {
        return;
      }

      // Check for low stock condition
      if (forecast.prediction > 100 && (!listing.quantity || listing.quantity < forecast.prediction * 0.5)) {
        await InventoryAlert.create({
          userId,
          listingId,
          alertType: 'low_stock',
          severity: 'warning',
          message: `Low stock alert: Expected demand is ${forecast.prediction.toFixed(0)}, but current stock is ${listing.quantity || 0}`,
          recommendedAction: 'Restock immediately to meet predicted demand',
          recommendedQuantity: Math.ceil(forecast.prediction)
        });
      }

      // Check for slow-moving inventory
      if (forecast.trend === 'decreasing') {
        await InventoryAlert.create({
          userId,
          listingId,
          alertType: 'slow_moving',
          severity: 'info',
          message: 'Slow-moving inventory detected. Demand trend is decreasing.',
          recommendedAction: 'Consider promotional activities or price adjustments'
        });
      }

      logger.info('[FORECAST] Inventory alerts generated', { listingId });
    } catch (error) {
      logger.warn('[FORECAST] Failed to generate alerts', error.message);
    }
  }

  /**
   * Get alerts for user
   */
  static async getUserAlerts(userId, isActive = true) {
    try {
      const alerts = await InventoryAlert.findAll({
        where: {
          userId,
          isActive
        },
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      return alerts;
    } catch (error) {
      logger.error('[FORECAST] Failed to fetch alerts', error.message);
      return [];
    }
  }

  /**
   * Resolve an alert
   */
  static async resolveAlert(alertId) {
    try {
      const alert = await InventoryAlert.findByPk(alertId);

      if (!alert) {
        return null;
      }

      alert.isActive = false;
      alert.resolvedAt = new Date();
      await alert.save();

      logger.info('[FORECAST] Alert resolved', { alertId });
      return alert;
    } catch (error) {
      logger.error('[FORECAST] Failed to resolve alert', error.message);
      throw error;
    }
  }

  /**
   * Run forecasting for all listings (scheduled job)
   */
  static async runDailyForecasting() {
    try {
      logger.info('[FORECAST] Starting daily forecasting job');

      const listings = await Listing.findAll({
        attributes: ['id', 'userId']
      });

      let successCount = 0;
      let errorCount = 0;

      for (const listing of listings) {
        try {
          await this.generateForecast(listing.id, listing.userId);
          successCount++;
        } catch (error) {
          logger.error('[FORECAST] Failed to forecast listing', {
            listingId: listing.id,
            error: error.message
          });
          errorCount++;
        }
      }

      logger.info('[FORECAST] Daily forecasting complete', {
        success: successCount,
        errors: errorCount
      });

      return { success: successCount, errors: errorCount };
    } catch (error) {
      logger.error('[FORECAST] Daily forecasting job error', error.message);
      throw error;
    }
  }
}

module.exports = DemandForecastingService;
