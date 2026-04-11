/**
 * Listing Controller
 * Handles property listing operations (CRUD, search, etc.)
 */

const { Op } = require('sequelize');
const Listing = require('../models/Listing');
const User = require('../models/User');

/**
 * Get all listings with filtering and pagination
 * GET /api/v1/listings
 */
const getAllListings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      priceMin,
      priceMax,
      location,
      district,
      bedrooms,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = { listingStatus: 'active' };

    if (type) where.type = type;
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price[Op.gte] = parseFloat(priceMin);
      if (priceMax) where.price[Op.lte] = parseFloat(priceMax);
    }
    if (location) {
      where[Op.or] = [
        { locationAddress: { [Op.iLike]: `%${location}%` } },
        { city: { [Op.iLike]: `%${location}%` } },
        { state: { [Op.iLike]: `%${location}%` } },
        { country: { [Op.iLike]: `%${location}%` } },
        { district: { [Op.iLike]: `%${location}%` } }
      ];
    }
    if (district) {
      where.district = {
        [Op.iLike]: `%${district}%`
      };
    }
    if (bedrooms) where.bedrooms = parseInt(bedrooms);

    // Fetch listings
    const { count, rows } = await Listing.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'verifiedId']
        }
      ],
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(offset),
      order: [[sort, order]],
      raw: false
    });

    res.status(200).json({
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: error.message
    });
  }
};

/**
 * Get single listing by ID
 * GET /api/v1/listings/:id
 */
const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone', 'verifiedEmail', 'verifiedId']
        }
      ]
    });

    if (!listing) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: 'Listing not found'
      });
    }

    // Increment view count
    listing.viewsCount = (listing.viewsCount || 0) + 1;
    listing.lastViewed = new Date();
    await listing.save();

    res.status(200).json(listing);
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: error.message
    });
  }
};

/**
 * Create new listing
 * POST /api/v1/listings
 */
const createListing = async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      price,
      priceNegotiable,
      locationAddress,
      locationLatitude,
      locationLongitude,
      city,
      district,
      state,
      country,
      sizeSqft,
      bedrooms,
      bathrooms,
      amenities,
      legalStatus
    } = req.body;

    // Validation
    if (!title || !type || !price || !locationAddress) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Title, type, price, and location are required'
      });
    }

    const listing = await Listing.create({
      userId: req.user.userId,
      title,
      type,
      description,
      price: parseFloat(price),
      priceNegotiable: priceNegotiable || false,
      locationAddress,
      locationLatitude: parseFloat(locationLatitude) || 0,
      locationLongitude: parseFloat(locationLongitude) || 0,
      city,
      district,
      state,
      country,
      sizeSqft: sizeSqft ? parseInt(sizeSqft) : null,
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      bathrooms: bathrooms ? parseInt(bathrooms) : null,
      amenities: amenities || [],
      legalStatus,
      listingStatus: 'pending_review'
    });

    res.status(201).json({
      id: listing.id,
      message: 'Listing created successfully. Awaiting admin approval.',
      status: 'pending_review'
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: error.message
    });
  }
};

/**
 * Update listing
 * PATCH /api/v1/listings/:id
 */
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const listing = await Listing.findByPk(id);

    if (!listing) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: 'Listing not found'
      });
    }

    // Check ownership
    if (listing.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'AuthorizationError',
        message: 'You do not have permission to update this listing'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'price', 'priceNegotiable',
      'district', 'bedrooms', 'bathrooms', 'sizeSqft', 'amenities'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    listing.updatedAt = new Date();
    await listing.save();

    res.status(200).json({
      message: 'Listing updated successfully'
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: error.message
    });
  }
};

/**
 * Delete listing
 * DELETE /api/v1/listings/:id
 */
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const listing = await Listing.findByPk(id);

    if (!listing) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: 'Listing not found'
      });
    }

    // Check ownership
    if (listing.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'AuthorizationError',
        message: 'You do not have permission to delete this listing'
      });
    }

    // Soft delete
    listing.listingStatus = 'deleted';
    await listing.save();

    res.status(204).send();
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: error.message
    });
  }
};

/**
 * Get user's listings
 * GET /api/v1/users/me/listings
 */
const getUserListings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Listing.findAndCountAll({
      where: { userId: req.user.userId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: error.message
    });
  }
};

module.exports = {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getUserListings
};
