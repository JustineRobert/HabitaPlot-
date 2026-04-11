/**
 * Admin Routes
 * All admin endpoints require admin role authorization
 */

const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');

const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// ========== MIDDLEWARE ==========
// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// ========== USER MANAGEMENT ROUTES ==========

/**
 * GET /admin/users
 * Get all users with pagination and filtering
 * Query params: page, limit, search, role, status
 */
router.get('/users', getAllUsers);

/**
 * GET /admin/users/:userId
 * Get user details and activity
 */
router.get('/users/:userId', getUserDetails);

/**
 * PATCH /admin/users/:userId/kyc
 * Update user KYC status (approve/reject)
 * Body: { kycStatus: 'approved'|'rejected'|'pending', notes?: string }
 */
router.patch('/users/:userId/kyc', updateUserKYC);

/**
 * PATCH /admin/users/:userId/status
 * Suspend, ban, or activate a user
 * Body: { action: 'suspend'|'ban'|'activate', reason: string }
 */
router.patch('/users/:userId/status', updateUserStatus);

/**
 * GET /admin/users/:userId/activity
 * Get user activity logs
 * Query params: page, limit
 */
router.get('/users/:userId/activity', getUserActivity);

// ========== LISTING MODERATION ROUTES ==========

/**
 * GET /admin/listings/pending
 * Get listings pending approval
 * Query params: page, limit, type, city
 */
router.get('/listings/pending', getPendingListings);

/**
 * PATCH /admin/listings/:listingId/approve
 * Approve a listing
 * Body: { notes?: string }
 */
router.patch('/listings/:listingId/approve', approveListing);

/**
 * PATCH /admin/listings/:listingId/reject
 * Reject a listing
 * Body: { reason: string }
 */
router.patch('/listings/:listingId/reject', rejectListing);

/**
 * PATCH /admin/listings/:listingId/feature
 * Feature (promote) a listing
 * Body: { durationDays?: number (default: 30) }
 */
router.patch('/listings/:listingId/feature', featureListing);

/**
 * GET /admin/listings
 * Get all listings with filtering
 * Query params: page, limit, status, type, userId
 */
router.get('/listings', getAllListings);

// ========== ANALYTICS ROUTES ==========

/**
 * GET /admin/analytics/dashboard
 * Get analytics dashboard data
 * Returns: users, listings, subscriptions, trends
 */
router.get('/analytics/dashboard', getAnalyticsDashboard);

/**
 * GET /admin/analytics/user-trends
 * Get user registration trends
 * Query params: period ('day'|'week'|'month')
 */
router.get('/analytics/user-trends', getUserTrends);

/**
 * GET /admin/analytics/listing-activity
 * Get listing activity report
 * Query params: period ('day'|'week'|'month')
 */
router.get('/analytics/listing-activity', getListingActivityReport);

// ========== SUBSCRIPTION MANAGEMENT ROUTES ==========

/**
 * GET /admin/subscriptions
 * Get all subscriptions with filtering
 * Query params: page, limit, status, planType
 */
router.get('/subscriptions', getAllSubscriptions);

/**
 * PATCH /admin/subscriptions/:subscriptionId/cancel
 * Cancel a subscription
 * Body: { reason: string }
 */
router.patch('/subscriptions/:subscriptionId/cancel', cancelSubscription);

/**
 * PATCH /admin/subscriptions/:subscriptionId/extend
 * Extend a subscription
 * Body: { extendDays: number }
 */
router.patch('/subscriptions/:subscriptionId/extend', extendSubscription);

module.exports = router;
