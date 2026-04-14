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

const exportTransactionsCSV = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;
    let where = { userId: req.user.userId };

    // Add date range filter if provided
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.$lte = new Date(endDate);
      }
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'price']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (format === 'json') {
      res.status(200).json({
        success: true,
        data: transactions,
        count: transactions.length
      });
    } else {
      // CSV format
      const headers = [
        'Receipt Number',
        'Transaction ID',
        'Provider',
        'Amount',
        'Currency',
        'Status',
        'Phone Number',
        'Description',
        'Listing ID',
        'Date Created',
        'Date Updated'
      ];

      const rows = transactions.map((txn) => [
        txn.receiptNumber,
        txn.id,
        txn.providerName,
        txn.amount,
        txn.currency,
        txn.status,
        txn.phoneNumber || '',
        (txn.description || '').replace(/"/g, '""'),
        txn.listingId || '',
        new Date(txn.createdAt).toLocaleString(),
        new Date(txn.updatedAt).toLocaleString()
      ]);

      const csvContent = [
        headers.map((h) => `"${h}"`).join(','),
        ...rows.map((row) => row.map((value) => (typeof value === 'string' && value.includes(',') ? `"${value}"` : value)).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv;charset=utf-8;');
      res.setHeader('Content-Disposition', `attachment;filename=transactions-${new Date().toISOString().slice(0, 10)}.csv`);
      res.status(200).send(csvContent);
    }
  } catch (error) {
    console.error('[EXPORT TRANSACTIONS ERROR]', error.message);
    res.status(500).json({
      error: 'ExportError',
      message: error.message
    });
  }
};

const downloadTransactionReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.userId }
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: 'Transaction not found'
      });
    }

    // Generate simple HTML receipt
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt - ${transaction.receiptNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb; }
          .receipt-container { max-width: 600px; background-color: white; margin: 0 auto; padding: 40px; border: 1px solid #e5e7eb; }
          .receipt-header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 20px; margin-bottom: 20px; }
          .receipt-header h1 { margin: 0; color: #1e40af; font-size: 24px; }
          .receipt-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6; }
          .receipt-label { color: #6b7280; font-size: 13px; }
          .receipt-value { color: #1f2937; font-size: 13px; font-weight: 500; }
          .receipt-footer { text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <h1>Payment Receipt</h1>
            <p>HabitaPlot™ Transaction Record</p>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Receipt Number</span>
            <span class="receipt-value">${transaction.receiptNumber}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Transaction ID</span>
            <span class="receipt-value">${transaction.id}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Provider</span>
            <span class="receipt-value">${transaction.providerName}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Amount</span>
            <span class="receipt-value">${transaction.currency} ${Number(transaction.amount).toLocaleString()}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Status</span>
            <span class="receipt-value">${transaction.status}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Date</span>
            <span class="receipt-value">${new Date(transaction.createdAt).toLocaleString()}</span>
          </div>
          <div class="receipt-footer">
            <p>This is an official receipt for your HabitaPlot™ payment transaction.</p>
            <p style="margin-top: 10px; font-size: 11px; color: #9ca3af;">Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html;charset=utf-8;');
    res.setHeader('Content-Disposition', `attachment;filename=receipt-${transaction.receiptNumber}.html`);
    res.status(200).send(receiptHTML);
  } catch (error) {
    console.error('[DOWNLOAD RECEIPT ERROR]', error.message);
    res.status(500).json({
      error: 'DownloadError',
      message: error.message
    });
  }
};

module.exports = {
  getMobileMoneyProviders,
  initiateMobileMoneyPayment,
  verifyMobileMoneyPayment,
  getUserTransactions,
  getTransactionById,
  exportTransactionsCSV,
  downloadTransactionReceipt
};
