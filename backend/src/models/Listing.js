/**
 * Listing Model
 * Represents a property listing (plot, house, apartment, rental, commercial)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Listing = sequelize.define('Listing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('plot', 'house', 'apartment', 'commercial', 'rental'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  priceNegotiable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'price_negotiable'
  },
  locationAddress: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'location_address'
  },
  locationLatitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: false,
    field: 'location_latitude'
  },
  locationLongitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: false,
    field: 'location_longitude'
  },
  city: {
    type: DataTypes.STRING(100)
  },
  district: {
    type: DataTypes.STRING(100)
  },
  state: {
    type: DataTypes.STRING(100)
  },
  country: {
    type: DataTypes.STRING(100)
  },
  zipCode: {
    type: DataTypes.STRING(20),
    field: 'zip_code'
  },
  sizeSqft: {
    type: DataTypes.INTEGER,
    field: 'size_sqft'
  },
  bedrooms: {
    type: DataTypes.INTEGER
  },
  bathrooms: {
    type: DataTypes.INTEGER
  },
  amenities: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: false
  },
  legalStatus: {
    type: DataTypes.STRING(100),
    field: 'legal_status'
  },
  listingStatus: {
    type: DataTypes.ENUM('active', 'sold', 'rented', 'deleted', 'pending_review'),
    defaultValue: 'pending_review',
    field: 'listing_status'
  },
  featuredUntil: {
    type: DataTypes.DATE,
    field: 'featured_until'
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'views_count'
  },
  favoritesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'favorites_count'
  },
  lastViewed: {
    type: DataTypes.DATE,
    field: 'last_viewed'
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
  tableName: 'listings',
  timestamps: false,
  indexes: [
    { fields: ['listing_status'] },
    { fields: ['type'] },
    { fields: ['price'] },
    { fields: ['user_id'] },
    { fields: ['district'] },
    { fields: ['created_at'], order: [['created_at', 'DESC']] },
    { fields: ['featured_until'] }
  ]
});

module.exports = Listing;
