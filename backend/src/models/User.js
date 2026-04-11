/**
 * User Model
 * Represents a platform user (agent, buyer, tenant, admin)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('guest', 'user', 'agent', 'admin'),
    defaultValue: 'user',
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  avatarUrl: {
    type: DataTypes.STRING(500),
    field: 'avatar_url'
  },
  bio: {
    type: DataTypes.TEXT
  },
  verifiedEmail: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'verified_email'
  },
  verifiedPhone: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'verified_phone'
  },
  verifiedId: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'verified_id'
  },
  kycStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
    field: 'kyc_status'
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  latitude: {
    type: DataTypes.DECIMAL(9, 6)
  },
  longitude: {
    type: DataTypes.DECIMAL(9, 6)
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'users',
  timestamps: false,
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['is_active'] },
    { fields: ['verified_email'] }
  ]
});

module.exports = User;
