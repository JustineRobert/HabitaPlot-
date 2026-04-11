/**
 * Subscription Model
 * Tracks user subscription plans and billing
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Subscription = sequelize.define('Subscription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      index: true
    },
    planType: {
      type: DataTypes.ENUM('free', 'premium', 'featured', 'enterprise'),
      defaultValue: 'free',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'cancelled', 'pending'),
      defaultValue: 'active',
      allowNull: false,
      index: true
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      unique: true,
      sparse: true
    },
    stripeCustomerId: {
      type: DataTypes.STRING
    },
    listingsIncluded: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Number of active listings allowed'
    },
    maxListings: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      comment: 'Maximum listings for this plan'
    },
    features: {
      type: DataTypes.JSONB,
      defaultValue: {
        analytics: false,
        featuredPromotions: false,
        prioritySupport: false,
        customBranding: false
      },
      comment: 'Plan features configuration'
    },
    billingCycle: {
      type: DataTypes.ENUM('monthly', 'yearly'),
      defaultValue: 'monthly'
    },
    billingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the current billing period expires'
    },
    renewalDate: {
      type: DataTypes.DATE,
      comment: 'When the subscription auto-renews'
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    cancelledAt: {
      type: DataTypes.DATE
    },
    notes: {
      type: DataTypes.TEXT,
      comment: 'Admin notes about the subscription'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'subscriptions',
    indexes: [
      { fields: ['userId', 'status'] },
      { fields: ['planType'] },
      { fields: ['expiresAt'] }
    ]
  });

  return Subscription;
};
