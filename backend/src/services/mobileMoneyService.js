/**
 * Mobile Money Service
 * Supports MTN MoMo and Airtel Money payment initiation and verification.
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const SUPPORTED_PROVIDERS = ['mtn', 'airtel'];

const providerDisplayNames = {
  mtn: 'MTN MoMo',
  airtel: 'Airtel Money'
};

const getSupportedProviders = () => SUPPORTED_PROVIDERS;

const createMobileMoneyPayment = async ({ provider, amount, currency, phoneNumber, externalId, description }) => {
  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    throw new Error(`Unsupported mobile money provider: ${provider}`);
  }

  if (!amount || Number(amount) <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new Error('Valid phone number is required');
  }

  const normalized = {
    amount: Number(amount).toFixed(2),
    currency: currency || 'UGX',
    phoneNumber,
    externalId: externalId || uuidv4(),
    description: description || `${providerDisplayNames[provider]} payment for HabitaPlot`,
    provider
  };

  switch (provider) {
    case 'mtn':
      return createMtnPayment(normalized);
    case 'airtel':
      return createAirtelPayment(normalized);
    default:
      throw new Error(`Unsupported mobile money provider: ${provider}`);
  }
};

const verifyMobileMoneyPayment = async ({ provider, transactionId }) => {
  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    throw new Error(`Unsupported mobile money provider: ${provider}`);
  }

  if (!transactionId) {
    throw new Error('Transaction ID is required to verify payment');
  }

  switch (provider) {
    case 'mtn':
      return verifyMtnPayment({ transactionId });
    case 'airtel':
      return verifyAirtelPayment({ transactionId });
    default:
      throw new Error(`Unsupported mobile money provider: ${provider}`);
  }
};

const createMtnPayment = async ({ amount, currency, phoneNumber, externalId, description }) => {
  const baseUrl = process.env.MTN_MOMO_BASE_URL;
  const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
  const accessToken = process.env.MTN_MOMO_ACCESS_TOKEN;
  const targetEnv = process.env.MTN_MOMO_TARGET_ENV || 'sandbox';

  if (!baseUrl || !subscriptionKey || !accessToken) {
    throw new Error('Missing MTN MoMo configuration in environment variables');
  }

  const url = `${baseUrl.replace(/\/$/, '')}/collection/v1_0/requesttopay`;
  const headers = {
    'Ocp-Apim-Subscription-Key': subscriptionKey,
    Authorization: `Bearer ${accessToken}`,
    'X-Target-Environment': targetEnv,
    'X-Reference-Id': externalId,
    'Content-Type': 'application/json'
  };

  const payload = {
    amount: amount.toString(),
    currency,
    externalId,
    payer: {
      partyIdType: 'MSISDN',
      partyId: phoneNumber
    },
    payerMessage: description,
    payeeNote: description
  };

  const response = await axios.post(url, payload, { headers, timeout: 15000 });

  return {
    provider: 'mtn',
    providerName: providerDisplayNames.mtn,
    transactionId: externalId,
    status: response.status === 202 ? 'pending' : 'pending',
    amount,
    currency,
    phoneNumber,
    description,
    rawResponse: response.data || null
  };
};

const verifyMtnPayment = async ({ transactionId }) => {
  const baseUrl = process.env.MTN_MOMO_BASE_URL;
  const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
  const accessToken = process.env.MTN_MOMO_ACCESS_TOKEN;
  const targetEnv = process.env.MTN_MOMO_TARGET_ENV || 'sandbox';

  if (!baseUrl || !subscriptionKey || !accessToken) {
    throw new Error('Missing MTN MoMo configuration in environment variables');
  }

  const url = `${baseUrl.replace(/\/$/, '')}/collection/v1_0/requesttopay/${transactionId}`;
  const headers = {
    'Ocp-Apim-Subscription-Key': subscriptionKey,
    Authorization: `Bearer ${accessToken}`,
    'X-Target-Environment': targetEnv,
    'Content-Type': 'application/json'
  };

  const response = await axios.get(url, { headers, timeout: 15000 });

  return {
    provider: 'mtn',
    providerName: providerDisplayNames.mtn,
    transactionId,
    status: response.data?.status || 'unknown',
    rawResponse: response.data
  };
};

const createAirtelPayment = async ({ amount, currency, phoneNumber, externalId, description }) => {
  const baseUrl = process.env.AIRTEL_MONEY_BASE_URL;
  const apiKey = process.env.AIRTEL_MONEY_API_KEY;
  const apiToken = process.env.AIRTEL_MONEY_API_TOKEN;
  const paymentUrl = process.env.AIRTEL_MONEY_PAYMENT_URL || `${baseUrl.replace(/\/$/, '')}/payments/v1/request`;

  if (!baseUrl || !apiKey || !apiToken) {
    throw new Error('Missing Airtel Money configuration in environment variables');
  }

  const headers = {
    Authorization: `Bearer ${apiToken}`,
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json'
  };

  const payload = {
    amount: amount.toString(),
    currency,
    externalId,
    customer: {
      msisdn: phoneNumber
    },
    description
  };

  const response = await axios.post(paymentUrl, payload, { headers, timeout: 15000 });

  return {
    provider: 'airtel',
    providerName: providerDisplayNames.airtel,
    transactionId: externalId,
    status: response.status === 202 ? 'pending' : 'pending',
    amount,
    currency,
    phoneNumber,
    description,
    rawResponse: response.data || null
  };
};

const verifyAirtelPayment = async ({ transactionId }) => {
  const baseUrl = process.env.AIRTEL_MONEY_BASE_URL;
  const apiKey = process.env.AIRTEL_MONEY_API_KEY;
  const apiToken = process.env.AIRTEL_MONEY_API_TOKEN;
  const verifyUrl = process.env.AIRTEL_MONEY_VERIFY_URL || `${baseUrl.replace(/\/$/, '')}/payments/v1/verify/${transactionId}`;

  if (!baseUrl || !apiKey || !apiToken) {
    throw new Error('Missing Airtel Money configuration in environment variables');
  }

  const headers = {
    Authorization: `Bearer ${apiToken}`,
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json'
  };

  const response = await axios.get(verifyUrl, { headers, timeout: 15000 });

  return {
    provider: 'airtel',
    providerName: providerDisplayNames.airtel,
    transactionId,
    status: response.data?.status || 'unknown',
    rawResponse: response.data
  };
};

module.exports = {
  getSupportedProviders,
  createMobileMoneyPayment,
  verifyMobileMoneyPayment
};
