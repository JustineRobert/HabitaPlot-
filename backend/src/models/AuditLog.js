/**
 * Audit Log Model
 * Tracks all administrative and system actions for compliance and debugging
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      },
      allowNull: true,
      index: true,
      comment: 'User affected by the action (null for system actions)'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true,
      comment: 'Action type: LOGIN, LOGOUT, LISTING_CREATED, LISTING_APPROVED, USER_SUSPENDED, etc.'
    },
    entityType: {
      type: DataTypes.STRING,
      comment: 'Type of entity affected: User, Listing, Subscription, etc.'
    },
    entityId: {
      type: DataTypes.UUID,
      comment: 'ID of the entity affected'
    },
    details: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional details about the action'
    },
    ipAddress: {
      type: DataTypes.STRING,
      comment: 'IP address from which action was performed'
    },
    userAgent: {
      type: DataTypes.TEXT,
      comment: 'Browser/client user agent'
    },
    statusCode: {
      type: DataTypes.INTEGER,
      comment: 'HTTP status code for API actions'
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      index: true
    }
  }, {
    tableName: 'audit_logs',
    indexes: [
      { fields: ['userId', 'timestamp'] },
      { fields: ['action', 'timestamp'] },
      { fields: ['entityType', 'entityId'] }
    ],
    comment: 'Immutable audit trail for compliance'
  });

  return AuditLog;
};
