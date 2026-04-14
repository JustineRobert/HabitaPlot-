/**
 * Analytics Aggregation Service
 * Aggregates metrics and analytics data for dashboards
 */

const Transaction = require('../models/Transaction');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const logger = require('../config/logger');
const { Op } = require('sequelize');

class AnalyticsAggregationService {
  /**
   * Aggregate analytics for a specific period
   */
  static async aggregateAnalytics(userId, period = 'daily', branchId = null) {
    try {
      const { startDate, endDate } = this.getPeriodDateRange(period);

      logger.info('[ANALYTICS] Aggregating', {
        userId,
        period,
        startDate,
        endDate
      });

      // Get transactions for the period
      const transactions = await Transaction.findAll({
        where: {
          userId,
          listingId: branchId ? { [Op.col]: 'branchId' } : undefined,
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      // Calculate metrics
      const metrics = this.calculateMetrics(transactions);

      // Get provider distribution
      const providerDistribution = this.getProviderDistribution(transactions);

      // Get top listings
      const topListings = await this.getTopListings(userId, startDate, endDate);

      // Get new listings count
      const newListings = await Listing.count({
        where: {
          userId,
          createdAt: { [Op.between]: [startDate, endDate] }
        }
      });

      // Get user metrics
      const userMetrics = await this.getUserMetrics(userId, period, startDate, endDate);

      // Create analytics record
      const analytics = await Analytics.create({
        userId,
        branchId: branchId || null,
        period,
        periodStart: startDate,
        periodEnd: endDate,
        totalSales: parseFloat(metrics.totalSales),
        totalTransactions: metrics.totalTransactions,
        averageTransactionValue: metrics.averageTransactionValue,
        providerDistribution,
        topListings,
        newListings,
        activeUsers: userMetrics.activeUsers,
        newUsers: userMetrics.newUsers,
        conversionRate: userMetrics.conversionRate,
        viewsToSales: userMetrics.viewsToSales
      });

      logger.info('[ANALYTICS] Aggregation complete', {
        analyticsId: analytics.id,
        totalSales: analytics.totalSales
      });

      return analytics;
    } catch (error) {
      logger.error('[ANALYTICS] Aggregation error', error.message);
      throw error;
    }
  }

  /**
   * Calculate sales metrics from transactions
   */
  static calculateMetrics(transactions) {
    let totalSales = 0;
    const transactionCount = transactions.length;

    transactions.forEach((txn) => {
      if (txn.status === 'completed') {
        totalSales += parseFloat(txn.amount);
      }
    });

    const avgValue = transactionCount > 0 ? totalSales / transactionCount : 0;

    return {
      totalSales: totalSales.toFixed(2),
      totalTransactions: transactionCount,
      averageTransactionValue: avgValue.toFixed(2)
    };
  }

  /**
   * Get payment provider distribution
   */
  static getProviderDistribution(transactions) {
    const distribution = {};

    transactions.forEach((txn) => {
      if (!distribution[txn.provider]) {
        distribution[txn.provider] = 0;
      }
      if (txn.status === 'completed') {
        distribution[txn.provider] += parseFloat(txn.amount);
      }
    });

    return distribution;
  }

  /**
   * Get top performing listings
   */
  static async getTopListings(userId, startDate, endDate, limit = 10) {
    try {
      const listings = await Listing.findAll({
        attributes: ['id', 'title', 'price'],
        where: { userId },
        include: [
          {
            model: Transaction,
            as: 'transactions',
            attributes: [],
            where: {
              createdAt: { [Op.between]: [startDate, endDate] },
              status: 'completed'
            },
            required: false
          }
        ],
        subQuery: false,
        raw: true,
        limit
      });

      return listings.map((listing) => ({
        listingId: listing.id,
        title: listing.title,
        price: listing.price
      }));
    } catch (error) {
      logger.warn('[ANALYTICS] Failed to get top listings', error.message);
      return [];
    }
  }

  /**
   * Get user engagement metrics
   */
  static async getUserMetrics(userId, period, startDate, endDate) {
    try {
      const activeUsersCount = await User.count({
        where: {
          lastActiveAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      const newUsersCount = await User.count({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });

      // Estimate conversion rate (completed transactions / total created)
      const completedTxns = await Transaction.count({
        where: {
          userId,
          status: 'completed',
          createdAt: { [Op.between]: [startDate, endDate] }
        }
      });

      const totalTxns = await Transaction.count({
        where: {
          userId,
          createdAt: { [Op.between]: [startDate, endDate] }
        }
      });

      const conversionRate = totalTxns > 0 ? ((completedTxns / totalTxns) * 100).toFixed(2) : 0;

      return {
        activeUsers: activeUsersCount,
        newUsers: newUsersCount,
        conversionRate: parseFloat(conversionRate),
        viewsToSales: totalTxns // Placeholder
      };
    } catch (error) {
      logger.warn('[ANALYTICS] Failed to get user metrics', error.message);
      return {
        activeUsers: 0,
        newUsers: 0,
        conversionRate: 0,
        viewsToSales: 0
      };
    }
  }

  /**
   * Get date range for a specific period
   */
  static getPeriodDateRange(period) {
    const now = new Date();
    let startDate;
    let endDate = now;

    switch (period) {
      case 'hourly':
        startDate = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
        break;
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }

  /**
   * Run aggregation for all users (scheduled job)
   */
  static async runDailyAggregation() {
    try {
      logger.info('[ANALYTICS] Starting daily aggregation job');

      const users = await User.findAll({
        attributes: ['id']
      });

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          await this.aggregateAnalytics(user.id, 'daily');
          successCount++;
        } catch (error) {
          logger.error('[ANALYTICS] Failed to aggregate for user', {
            userId: user.id,
            error: error.message
          });
          errorCount++;
        }
      }

      logger.info('[ANALYTICS] Daily aggregation complete', {
        success: successCount,
        errors: errorCount
      });

      return { success: successCount, errors: errorCount };
    } catch (error) {
      logger.error('[ANALYTICS] Daily aggregation job error', error.message);
      throw error;
    }
  }

  /**
   * Get analytics data for dashboard
   */
  static async getAnalyticsData(userId, period = 'daily', limit = 30) {
    try {
      const analytics = await Analytics.findAll({
        where: {
          userId,
          period
        },
        order: [['periodStart', 'DESC']],
        limit
      });

      return analytics;
    } catch (error) {
      logger.error('[ANALYTICS] Failed to fetch analytics', error.message);
      return [];
    }
  }
}

module.exports = AnalyticsAggregationService;
