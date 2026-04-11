/**
 * Admin Controller
 * Handles all admin panel operations including user management, 
 * listing moderation, analytics, and subscription management
 */

const { Op, sequelize } = require('sequelize');
const User = require('../models/User');
const Listing = require('../models/Listing');
const AuditLog = require('../models/AuditLog');
const Subscription = require('../models/Subscription');

// ========== USER MANAGEMENT ==========

/**
 * Get all users with filtering and pagination
 * GET /admin/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { name: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (role) where.role = role;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const { count, rows } = await User.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      attributes: {
        exclude: ['passwordHash']
      }
    });

    res.json({
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user details by ID
 * GET /admin/users/:userId
 */
export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: {
        exclude: ['passwordHash']
      },
      include: [
        {
          model: Listing,
          as: 'listings',
          attributes: ['id', 'title', 'status', 'createdAt']
        },
        {
          model: Subscription,
          attributes: ['id', 'planType', 'status', 'expiresAt']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user activity logs
    const activityLogs = await AuditLog.findAll({
      where: { userId: req.params.userId },
      limit: 50,
      order: [['timestamp', 'DESC']]
    });

    res.json({
      user,
      activityLogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user KYC status (approve/reject)
 * PATCH /admin/users/:userId/kyc
 */
export const updateUserKYC = async (req, res, next) => {
  try {
    const { kycStatus, notes } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(kycStatus)) {
      return res.status(400).json({ 
        error: 'Invalid KYC status. Must be: pending, approved, rejected' 
      });
    }

    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const previousStatus = user.kycStatus;
    await user.update({ kycStatus });

    // Log the action
    await AuditLog.create({
      userId: req.params.userId,
      action: `KYC_${kycStatus.toUpperCase()}`,
      details: {
        previousStatus,
        newStatus: kycStatus,
        approvedBy: req.user.id,
        notes
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `KYC status updated to ${kycStatus}`,
      user: {
        id: user.id,
        email: user.email,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suspend or ban a user
 * PATCH /admin/users/:userId/status
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { action, reason } = req.body;

    if (!['suspend', 'ban', 'activate'].includes(action)) {
      return res.status(400).json({ 
        error: 'Invalid action. Must be: suspend, ban, activate' 
      });
    }

    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isActive = action === 'activate';
    await user.update({ isActive });

    // Log the action
    await AuditLog.create({
      userId: req.params.userId,
      action: `USER_${action.toUpperCase()}`,
      details: {
        reason,
        actionBy: req.user.id
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `User ${action}ed successfully`,
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user activity logs
 * GET /admin/users/:userId/activity
 */
export const getUserActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await AuditLog.findAndCountAll({
      where: { userId: req.params.userId },
      offset,
      limit: parseInt(limit),
      order: [['timestamp', 'DESC']]
    });

    res.json({
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========== LISTING MODERATION ==========

/**
 * Get pending listings for approval
 * GET /admin/listings/pending
 */
export const getPendingListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, city } = req.query;
    const offset = (page - 1) * limit;

    const where = { listingStatus: 'pending_review' };
    if (type) where.type = type;
    if (city) where.city = { [Op.iLike]: `%${city}%` };

    const { count, rows } = await Listing.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'email', 'name', 'kycStatus']
        }
      ]
    });

    res.json({
      listings: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a listing
 * PATCH /admin/listings/:listingId/approve
 */
export const approveListing = async (req, res, next) => {
  try {
    const { notes } = req.body;

    const listing = await Listing.findByPk(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    await listing.update({ listingStatus: 'active' });

    // Log the action
    await AuditLog.create({
      userId: listing.userId,
      action: 'LISTING_APPROVED',
      details: {
        listingId: listing.id,
        approvedBy: req.user.id,
        notes
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Listing approved successfully',
      listing: {
        id: listing.id,
        title: listing.title,
        status: listing.listingStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a listing with reason
 * PATCH /admin/listings/:listingId/reject
 */
export const rejectListing = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const listing = await Listing.findByPk(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    await listing.update({ listingStatus: 'deleted' });

    // Log the action
    await AuditLog.create({
      userId: listing.userId,
      action: 'LISTING_REJECTED',
      details: {
        listingId: listing.id,
        rejectionReason: reason,
        rejectedBy: req.user.id
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Listing rejected successfully',
      listing: {
        id: listing.id,
        title: listing.title,
        status: listing.listingStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Feature a listing (promote)
 * PATCH /admin/listings/:listingId/feature
 */
export const featureListing = async (req, res, next) => {
  try {
    const { durationDays = 30 } = req.body;

    const listing = await Listing.findByPk(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + durationDays);

    await listing.update({ featuredUntil });

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'LISTING_FEATURED',
      details: {
        listingId: listing.id,
        durationDays,
        featuredUntil
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: `Listing featured for ${durationDays} days`,
      listing: {
        id: listing.id,
        title: listing.title,
        featuredUntil
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all listings with filtering
 * GET /admin/listings
 */
export const getAllListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type, userId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.listingStatus = status;
    if (type) where.type = type;
    if (userId) where.userId = userId;

    const { count, rows } = await Listing.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'email', 'name']
        }
      ]
    });

    res.json({
      listings: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========== ANALYTICS & REPORTS ==========

/**
 * Get analytics dashboard data
 * GET /admin/analytics/dashboard
 */
export const getAnalyticsDashboard = async (req, res, next) => {
  try {
    // Total users
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const newUsersThisMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    // Listings stats
    const totalListings = await Listing.count();
    const activeListings = await Listing.count({ 
      where: { listingStatus: 'active' } 
    });
    const pendingListings = await Listing.count({ 
      where: { listingStatus: 'pending_review' } 
    });

    // Revenue (if subscription model exists)
    const activeSubscriptions = await Subscription.count({ 
      where: { status: 'active' } 
    });

    // Trending property types
    const listingsByType = await Listing.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { listingStatus: 'active' },
      group: ['type'],
      raw: true
    });

    // Top cities
    const topCities = await Listing.findAll({
      attributes: [
        'city',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { listingStatus: 'active' },
      group: ['city'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    // Monthly registration trend
    const monthlyRegistrations = await User.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'DESC']],
      limit: 12,
      raw: true
    });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth
      },
      listings: {
        total: totalListings,
        active: activeListings,
        pending: pendingListings
      },
      subscriptions: {
        active: activeSubscriptions
      },
      trends: {
        listingsByType,
        topCities,
        monthlyRegistrations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user registration trends
 * GET /admin/analytics/user-trends
 */
export const getUserTrends = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    // Determine grouping based on period
    let dateFormat;
    if (period === 'day') dateFormat = "DATE(\"createdAt\")";
    else if (period === 'week') dateFormat = "DATE_TRUNC('week', \"createdAt\")";
    else dateFormat = "DATE_TRUNC('month', \"createdAt\")";

    const trends = await User.findAll({
      attributes: [
        [sequelize.literal(dateFormat), 'period'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.literal(dateFormat)],
      order: [[sequelize.literal(dateFormat), 'DESC']],
      raw: true,
      limit: 60
    });

    res.json({ trends });
  } catch (error) {
    next(error);
  }
};

/**
 * Get listing activity report
 * GET /admin/analytics/listing-activity
 */
export const getListingActivityReport = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    // Determine date range
    let startDate = new Date();
    if (period === 'day') startDate.setDate(startDate.getDate() - 1);
    else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    else startDate.setMonth(startDate.getMonth() - 1);

    // Get most viewed listings
    const mostViewed = await Listing.findAll({
      attributes: ['id', 'title', 'viewsCount'],
      where: { createdAt: { [Op.gte]: startDate } },
      order: [['viewsCount', 'DESC']],
      limit: 10,
      raw: true
    });

    // Get most favorited listings
    const mostFavorited = await Listing.findAll({
      attributes: ['id', 'title', 'favoritesCount'],
      where: { createdAt: { [Op.gte]: startDate } },
      order: [['favoritesCount', 'DESC']],
      limit: 10,
      raw: true
    });

    // New listings in period
    const newListings = await Listing.count({
      where: { createdAt: { [Op.gte]: startDate } }
    });

    res.json({
      period,
      stats: {
        newListings
      },
      mostViewed,
      mostFavorited
    });
  } catch (error) {
    next(error);
  }
};

// ========== SUBSCRIPTION MANAGEMENT ==========

/**
 * Get all subscriptions
 * GET /admin/subscriptions
 */
export const getAllSubscriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, planType } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (planType) where.planType = planType;

    const { count, rows } = await Subscription.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'email', 'name']
        }
      ]
    });

    res.json({
      subscriptions: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a subscription
 * PATCH /admin/subscriptions/:subscriptionId/cancel
 */
export const cancelSubscription = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const subscription = await Subscription.findByPk(req.params.subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await subscription.update({ status: 'cancelled' });

    // Log the action
    await AuditLog.create({
      userId: subscription.userId,
      action: 'SUBSCRIPTION_CANCELLED',
      details: {
        subscriptionId: subscription.id,
        reason,
        cancelledBy: req.user.id
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Extend subscription
 * PATCH /admin/subscriptions/:subscriptionId/extend
 */
export const extendSubscription = async (req, res, next) => {
  try {
    const { extendDays } = req.body;

    if (!extendDays || extendDays <= 0) {
      return res.status(400).json({ error: 'Valid extend days required' });
    }

    const subscription = await Subscription.findByPk(req.params.subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const newExpiresAt = new Date(subscription.expiresAt);
    newExpiresAt.setDate(newExpiresAt.getDate() + extendDays);

    await subscription.update({ expiresAt: newExpiresAt });

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'SUBSCRIPTION_EXTENDED',
      details: {
        subscriptionId: subscription.id,
        extendDays,
        newExpiresAt,
        extendedBy: req.user.id
      },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Subscription extended successfully',
      subscription
    });
  } catch (error) {
    next(error);
  }
};

export default {
  // User Management
  getAllUsers,
  getUserDetails,
  updateUserKYC,
  updateUserStatus,
  getUserActivity,

  // Listing Moderation
  getPendingListings,
  approveListing,
  rejectListing,
  featureListing,
  getAllListings,

  // Analytics
  getAnalyticsDashboard,
  getUserTrends,
  getListingActivityReport,

  // Subscriptions
  getAllSubscriptions,
  cancelSubscription,
  extendSubscription
};
