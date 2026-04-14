/**
 * Analytics Controller
 * Handle analytics dashboard and reporting endpoints
 */

const { Analytics } = require('../models/Analytics');
const AnalyticsService = require('../services/analyticsService');
const logger = require('../config/logger');

/**
 * Get analytics dashboard data
 */
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'daily', branchId } = req.query;

    logger.info('[ANALYTICS] Dashboard requested', {
      userId,
      period,
      branchId
    });

    // Get current period analytics
    const analytics = await AnalyticsService.getAnalyticsData(
      userId,
      period,
      branchId ? parseInt(branchId) : null
    );

    if (!analytics) {
      return res.json({
        success: true,
        data: {
          period,
          metrics: {
            totalSales: 0,
            totalTransactions: 0,
            averageTransactionValue: 0,
            conversionRate: 0,
            newUsers: 0,
            activeUsers: 0
          },
          providerDistribution: {},
          topListings: [],
          trends: null
        }
      });
    }

    // Get previous period for comparison
    const prevAnalytics = await AnalyticsService.getAnalyticsData(
      userId,
      period,
      branchId ? parseInt(branchId) : null,
      1 // Set daysOffset to 1 to get previous period
    );

    // Calculate growth metrics
    const metrics = {
      totalSales: parseFloat(analytics.totalSales || 0),
      totalTransactions: analytics.totalTransactions || 0,
      averageTransactionValue: parseFloat(analytics.averageTransactionValue || 0),
      conversionRate: parseFloat(analytics.conversionRate || 0),
      newUsers: analytics.newUsers || 0,
      activeUsers: analytics.activeUsers || 0,
      newListings: analytics.newListings || 0
    };

    const growth = prevAnalytics
      ? {
          salesGrowth: prevAnalytics.totalSales
            ? (((metrics.totalSales - prevAnalytics.totalSales) / prevAnalytics.totalSales) * 100).toFixed(1)
            : 0,
          transactionGrowth: prevAnalytics.totalTransactions
            ? (((metrics.totalTransactions - prevAnalytics.totalTransactions) / prevAnalytics.totalTransactions) * 100).toFixed(1)
            : 0,
          conversionGrowth: (metrics.conversionRate - (prevAnalytics.conversionRate || 0)).toFixed(2)
        }
      : null;

    logger.info('[ANALYTICS] Dashboard data prepared', {
      userId,
      metrics
    });

    res.json({
      success: true,
      data: {
        period,
        metrics,
        growth,
        providerDistribution: analytics.providerDistribution || {},
        topListings: analytics.topListings || [],
        periodStart: analytics.periodStart,
        periodEnd: analytics.periodEnd
      }
    });
  } catch (error) {
    logger.error('[ANALYTICS] Dashboard error', error.message);
    res.status(500).json({
      error: 'Failed to fetch analytics dashboard',
      message: error.message
    });
  }
};

/**
 * Get detailed analytics with time series
 */
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'daily', startDate, endDate, branchId } = req.query;

    logger.info('[ANALYTICS] Detailed analytics requested', {
      userId,
      period,
      startDate,
      endDate
    });

    const where = { userId };
    if (startDate || endDate) {
      where.periodStart = {};
      if (startDate) where.periodStart[require('sequelize').Op.gte] = new Date(startDate);
      if (endDate) where.periodStart[require('sequelize').Op.lte] = new Date(endDate);
    }
    if (branchId) {
      where.branchId = parseInt(branchId);
    }

    const analytics = await Analytics.findAll({
      where,
      order: [['periodStart', 'DESC']],
      limit: 1000
    });

    logger.info('[ANALYTICS] Detailed analytics retrieved', {
      userId,
      count: analytics.length
    });

    res.json({
      success: true,
      data: analytics,
      count: analytics.length
    });
  } catch (error) {
    logger.error('[ANALYTICS] Analytics retrieval error', error.message);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
};

/**
 * Get provider performance metrics
 */
exports.getProviderMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'daily' } = req.query;

    logger.info('[ANALYTICS] Provider metrics requested', {
      userId,
      period
    });

    const analytics = await Analytics.findAll({
      attributes: [
        'providerDistribution',
        [require('sequelize').fn('SUM', require('sequelize').col('totalTransactions')), 'totalTransactions'],
        [require('sequelize').fn('SUM', require('sequelize').col('totalSales')), 'totalSales']
      ],
      where: { userId },
      group: ['providerDistribution'],
      raw: true
    });

    // Parse and aggregate provider data
    const providerMetrics = {};
    analytics.forEach((row) => {
      const providers = row.providerDistribution || {};
      Object.entries(providers).forEach(([provider, count]) => {
        if (!providerMetrics[provider]) {
          providerMetrics[provider] = {
            provider,
            transactions: 0,
            sales: 0,
            percentage: 0
          };
        }
        providerMetrics[provider].transactions += parseInt(count) || 0;
      });
    });

    // Calculate percentages
    const totalTransactions = Object.values(providerMetrics).reduce((sum, m) => sum + m.transactions, 0);
    Object.values(providerMetrics).forEach((metric) => {
      metric.percentage = totalTransactions > 0 ? ((metric.transactions / totalTransactions) * 100).toFixed(1) : 0;
    });

    logger.info('[ANALYTICS] Provider metrics calculated', {
      userId,
      providers: Object.keys(providerMetrics).length
    });

    res.json({
      success: true,
      data: Object.values(providerMetrics),
      summary: {
        totalProviders: Object.keys(providerMetrics).length,
        totalTransactions
      }
    });
  } catch (error) {
    logger.error('[ANALYTICS] Provider metrics error', error.message);
    res.status(500).json({
      error: 'Failed to fetch provider metrics',
      message: error.message
    });
  }
};

/**
 * Get revenue analytics
 */
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const analytics = await Analytics.findAll({
      where: {
        userId,
        periodStart: { [require('sequelize').Op.gte]: startDate }
      },
      order: [['periodStart', 'ASC']],
      attributes: ['periodStart', 'periodEnd', 'totalSales', 'totalTransactions', 'averageTransactionValue']
    });

    logger.info('[ANALYTICS] Revenue analytics retrieved', {
      userId,
      dataPoints: analytics.length
    });

    res.json({
      success: true,
      data: analytics,
      summary: {
        period: `Last ${days} days`,
        startDate,
        totalRevenue: analytics.reduce((sum, a) => sum + parseFloat(a.totalSales || 0), 0),
        averageDaily: Math.round(
          analytics.reduce((sum, a) => sum + parseFloat(a.totalSales || 0), 0) / (analytics.length || 1)
        ),
        dataPoints: analytics.length
      }
    });
  } catch (error) {
    logger.error('[ANALYTICS] Revenue analytics error', error.message);
    res.status(500).json({
      error: 'Failed to fetch revenue analytics',
      message: error.message
    });
  }
};

/**
 * Get conversion funnel
 */
exports.getConversionFunnel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const analytics = await Analytics.findAll({
      where: {
        userId,
        periodStart: { [require('sequelize').Op.gte]: startDate }
      },
      attributes: ['periodStart', 'activeUsers', 'conversionRate', 'totalTransactions']
    });

    const conversionFunnel = {
      visitors: analytics.reduce((sum, a) => sum + (a.activeUsers || 0), 0),
      buyers: analytics.reduce((sum, a) => sum + (a.totalTransactions || 0), 0),
      averageConversionRate: (
        analytics.reduce((sum, a) => sum + parseFloat(a.conversionRate || 0), 0) / (analytics.length || 1)
      ).toFixed(2)
    };

    logger.info('[ANALYTICS] Conversion funnel calculated', {
      userId,
      conversionRate: conversionFunnel.averageConversionRate
    });

    res.json({
      success: true,
      data: conversionFunnel,
      timeseries: analytics
    });
  } catch (error) {
    logger.error('[ANALYTICS] Conversion funnel error', error.message);
    res.status(500).json({
      error: 'Failed to fetch conversion funnel',
      message: error.message
    });
  }
};

/**
 * Export analytics as CSV
 */
exports.exportAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'csv', days = 90 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const analytics = await Analytics.findAll({
      where: {
        userId,
        periodStart: { [require('sequelize').Op.gte]: startDate }
      },
      order: [['periodStart', 'ASC']]
    });

    if (format === 'json') {
      res.json({
        success: true,
        data: analytics,
        exportedAt: new Date(),
        format: 'json'
      });
    } else {
      // CSV format
      const csv = this.convertAnalyticsToCSV(analytics);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    }

    logger.info('[ANALYTICS] Analytics exported', {
      userId,
      format,
      records: analytics.length
    });
  } catch (error) {
    logger.error('[ANALYTICS] Export error', error.message);
    res.status(500).json({
      error: 'Failed to export analytics',
      message: error.message
    });
  }
};

/**
 * Helper: Convert analytics to CSV
 */
exports.convertAnalyticsToCSV = (analytics) => {
  const headers = [
    'Period Start',
    'Period End',
    'Total Sales',
    'Total Transactions',
    'Avg Transaction',
    'Active Users',
    'New Users',
    'Conversion Rate',
    'New Listings'
  ];

  const rows = analytics.map((a) => [
    a.periodStart,
    a.periodEnd,
    (parseFloat(a.totalSales || 0)).toFixed(2),
    a.totalTransactions,
    (parseFloat(a.averageTransactionValue || 0)).toFixed(2),
    a.activeUsers,
    a.newUsers,
    (parseFloat(a.conversionRate || 0)).toFixed(2) + '%',
    a.newListings
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  return csv;
};
