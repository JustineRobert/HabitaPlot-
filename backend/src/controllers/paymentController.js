/**
 * Payment Controller
 * Handles voucher and mobile money payment endpoints.
 */

const mobileMoneyService = require('../services/mobileMoneyService');

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
    const { provider, amount, currency, phoneNumber, description, externalId } = req.body;

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

    res.status(201).json({
      success: true,
      data: payment
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

    res.status(200).json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('[PAYMENT VERIFY ERROR]', error.message);
    res.status(500).json({
      error: 'PaymentVerificationError',
      message: error.message
    });
  }
};

module.exports = {
  getMobileMoneyProviders,
  initiateMobileMoneyPayment,
  verifyMobileMoneyPayment
};
