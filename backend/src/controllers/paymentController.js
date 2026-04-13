/**
 * Payment Controller
 * Handles voucher and mobile money payment endpoints.
 */

const mobileMoneyService = require('../services/mobileMoneyService');
const Listing = require('../models/Listing');
const Transaction = require('../models/Transaction');

const getMobileMoneyProviders = (req, res) => {
  try {
    const providers = mobileMoneyService.getSupportedProviders();
    res.status(200).json({ providers });
  } catch (error) {
    res.status(500).json({
      error: 'PaymentProviderError',
      message: error.message
    });
  }
};

const initiateMobileMoneyPayment = async (req, res) => {
  try {
    const { provider, amount, currency, phoneNumber, description, externalId, listingId } = req.body;

    if (!provider || !amount || !phoneNumber) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'provider, amount, and phoneNumber are required'
      });
    }

    const payment = await mobileMoneyService.createMobileMoneyPayment({
      provider: provider.toLowerCase(),
      amount,
      currency,
      phoneNumber,
      description,
      externalId
    });

    const transaction = await Transaction.create({
      userId: req.user.userId,
      listingId: listingId || null,
      provider: payment.provider,
      providerName: payment.providerName,
      type: 'mobile_money',
      status: payment.status,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      phoneNumber: payment.phoneNumber,
      description: payment.description,
      externalId: payment.externalId,
      transactionId: payment.transactionId,
      rawResponse: payment.rawResponse || null
    });

    res.status(201).json({
      success: true,
      data: {
        id: transaction.id,
        receiptNumber: transaction.receiptNumber,
        userId: transaction.userId,
        listingId: transaction.listingId,
        provider: transaction.provider,
        providerName: transaction.providerName,
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        phoneNumber: transaction.phoneNumber,
        description: transaction.description,
        externalId: transaction.externalId,
        transactionId: transaction.transactionId,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      }
    });
  } catch (error) {
    console.error('[PAYMENT INITIATE ERROR]', error.message);
    res.status(500).json({
      error: 'PaymentInitiationError',
      message: error.message
    });
  }
};

const verifyMobileMoneyPayment = async (req, res) => {
  try {
    const { provider, transactionId } = req.body;

    if (!provider || !transactionId) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'provider and transactionId are required'
      });
    }

    const verification = await mobileMoneyService.verifyMobileMoneyPayment({
      provider: provider.toLowerCase(),
      transactionId
    });

    const transaction = await Transaction.findOne({
      where: {
        transactionId,
        provider: provider.toLowerCase()
      }
    });

    if (transaction) {
      transaction.status = verification.status || transaction.status;
      transaction.rawResponse = verification.rawResponse || transaction.rawResponse;
      transaction.confirmedAt = verification.status === 'completed' ? new Date() : transaction.confirmedAt;
      transaction.updatedAt = new Date();
      await transaction.save();
    }

    res.status(200).json({
      success: true,
      data: {
        id: transaction?.id || null,
        receiptNumber: transaction?.receiptNumber || null,
        transactionId: verification.transactionId,
        provider: verification.provider,
        providerName: verification.providerName,
        status: verification.status,
        rawResponse: verification.rawResponse || null,
        confirmedAt: transaction?.confirmedAt || null
      }
    });
  } catch (error) {
    console.error('[PAYMENT VERIFY ERROR]', error.message);
    res.status(500).json({
      error: 'PaymentVerificationError',
      message: error.message
    });
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const offset = (page - 1) * limit;

    const { count, rows } = await Transaction.findAndCountAll({
      where: { userId: req.user.userId },
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'price']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('[GET TRANSACTIONS ERROR]', error.message);
    res.status(500).json({
      error: 'TransactionFetchError',
      message: error.message
    });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.userId },
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'price']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('[GET TRANSACTION ERROR]', error.message);
    res.status(500).json({
      error: 'TransactionFetchError',
      message: error.message
    });
  }
};

module.exports = {
  getMobileMoneyProviders,
  initiateMobileMoneyPayment,
  verifyMobileMoneyPayment,
  getUserTransactions,
  getTransactionById
};
