/**
 * Branch Management Controller
 */

const Branch = require('../models/Branch');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Create new branch
 */
exports.createBranch = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      address,
      city,
      region,
      country,
      latitude,
      longitude,
      phoneNumber,
      email,
      isHeadquarters = false
    } = req.body;

    // If this is the first branch, make it headquarters
    const existingCount = await Branch.count({ where: { userId } });
    const isHQ = existingCount === 0 || isHeadquarters;

    const branch = await Branch.create({
      userId,
      name,
      address,
      city,
      region,
      country,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      phoneNumber,
      email,
      isHeadquarters: isHQ,
      isActive: true
    });

    logger.info('[BRANCH] Branch created', {
      userId,
      branchId: branch.id,
      name
    });

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: branch
    });
  } catch (error) {
    logger.error('[BRANCH] Creation error', error.message);
    res.status(500).json({
      error: 'Failed to create branch',
      message: error.message
    });
  }
};

/**
 * Get all branches for user
 */
exports.getBranches = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isActive = true, limit = 50, offset = 0 } = req.query;

    const where = { userId };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const branches = await Branch.findAll({
      where,
      order: [['isHeadquarters', 'DESC'], ['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Branch.count({ where });

    logger.info('[BRANCH] Branches fetched', {
      userId,
      count: branches.length
    });

    res.json({
      success: true,
      data: branches,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('[BRANCH] Fetch error', error.message);
    res.status(500).json({
      error: 'Failed to fetch branches',
      message: error.message
    });
  }
};

/**
 * Get single branch
 */
exports.getBranch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { branchId } = req.params;

    const branch = await Branch.findOne({
      where: {
        id: branchId,
        userId
      }
    });

    if (!branch) {
      return res.status(404).json({
        error: 'Branch not found'
      });
    }

    logger.info('[BRANCH] Branch fetched', {
      branchId,
      userId
    });

    res.json({
      success: true,
      data: branch
    });
  } catch (error) {
    logger.error('[BRANCH] Fetch error', error.message);
    res.status(500).json({
      error: 'Failed to fetch branch',
      message: error.message
    });
  }
};

/**
 * Update branch
 */
exports.updateBranch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { branchId } = req.params;
    const {
      name,
      address,
      city,
      region,
      country,
      latitude,
      longitude,
      phoneNumber,
      email,
      isActive
    } = req.body;

    const branch = await Branch.findOne({
      where: {
        id: branchId,
        userId
      }
    });

    if (!branch) {
      return res.status(404).json({
        error: 'Branch not found'
      });
    }

    // Update fields
    if (name !== undefined) branch.name = name;
    if (address !== undefined) branch.address = address;
    if (city !== undefined) branch.city = city;
    if (region !== undefined) branch.region = region;
    if (country !== undefined) branch.country = country;
    if (latitude !== undefined) branch.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) branch.longitude = longitude ? parseFloat(longitude) : null;
    if (phoneNumber !== undefined) branch.phoneNumber = phoneNumber;
    if (email !== undefined) branch.email = email;
    if (isActive !== undefined) branch.isActive = isActive;

    await branch.save();

    logger.info('[BRANCH] Branch updated', {
      branchId,
      userId
    });

    res.json({
      success: true,
      message: 'Branch updated successfully',
      data: branch
    });
  } catch (error) {
    logger.error('[BRANCH] Update error', error.message);
    res.status(500).json({
      error: 'Failed to update branch',
      message: error.message
    });
  }
};

/**
 * Set branch as headquarters
 */
exports.setHeadquarters = async (req, res) => {
  try {
    const userId = req.user.id;
    const { branchId } = req.params;

    // Remove headquarters from all branches
    await Branch.update(
      { isHeadquarters: false },
      { where: { userId } }
    );

    // Set as headquarters
    const branch = await Branch.findOne({
      where: {
        id: branchId,
        userId
      }
    });

    if (!branch) {
      return res.status(404).json({
        error: 'Branch not found'
      });
    }

    branch.isHeadquarters = true;
    await branch.save();

    logger.info('[BRANCH] Headquarters changed', {
      branchId,
      userId
    });

    res.json({
      success: true,
      message: 'Branch set as headquarters',
      data: branch
    });
  } catch (error) {
    logger.error('[BRANCH] Headquarters update error', error.message);
    res.status(500).json({
      error: 'Failed to set headquarters',
      message: error.message
    });
  }
};

/**
 * Delete branch
 */
exports.deleteBranch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { branchId } = req.params;

    const branch = await Branch.findOne({
      where: {
        id: branchId,
        userId
      }
    });

    if (!branch) {
      return res.status(404).json({
        error: 'Branch not found'
      });
    }

    // Prevent deleting the only branch or headquarters
    if (branch.isHeadquarters) {
      const count = await Branch.count({ where: { userId } });
      if (count === 1) {
        return res.status(400).json({
          error: 'Cannot delete the only branch. Create another branch first.'
        });
      }

      // Set another branch as headquarters
      const newHQ = await Branch.findOne({
        where: {
          userId,
          id: { [require('sequelize').Op.ne]: branchId }
        }
      });

      if (newHQ) {
        newHQ.isHeadquarters = true;
        await newHQ.save();
      }
    }

    await branch.destroy();

    logger.info('[BRANCH] Branch deleted', {
      branchId,
      userId
    });

    res.json({
      success: true,
      message: 'Branch deleted successfully'
    });
  } catch (error) {
    logger.error('[BRANCH] Delete error', error.message);
    res.status(500).json({
      error: 'Failed to delete branch',
      message: error.message
    });
  }
};

/**
 * Get branch statistics
 */
exports.getBranchStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { branchId } = req.params;

    const branch = await Branch.findOne({
      where: {
        id: branchId,
        userId
      }
    });

    if (!branch) {
      return res.status(404).json({
        error: 'Branch not found'
      });
    }

    // Get transaction count for branch
    const Transaction = require('../models/Transaction');
    const transactionCount = await Transaction.count({
      where: {
        userId,
        // Associate with branch if needed (requires relationship setup)
      }
    });

    logger.info('[BRANCH] Stats fetched', {
      branchId,
      userId
    });

    res.json({
      success: true,
      data: {
        branch,
        stats: {
          transactions: transactionCount,
          isActive: branch.isActive
        }
      }
    });
  } catch (error) {
    logger.error('[BRANCH] Stats error', error.message);
    res.status(500).json({
      error: 'Failed to fetch branch statistics',
      message: error.message
    });
  }
};
