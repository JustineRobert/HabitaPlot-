/**
 * Mobile money service unit tests
 */

const axios = require('axios');
const mobileMoneyService = require('../../../src/services/mobileMoneyService');

jest.mock('axios');

describe('MobileMoneyService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    axios.post.mockReset();
    axios.get.mockReset();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns supported mobile money providers', () => {
    expect(mobileMoneyService.getSupportedProviders()).toEqual(['mtn', 'airtel']);
  });

  it('throws when creating payment with unsupported provider', async () => {
    await expect(
      mobileMoneyService.createMobileMoneyPayment({ provider: 'unknown', amount: 100, phoneNumber: '256700000000' })
    ).rejects.toThrow('Unsupported mobile money provider: unknown');
  });

  it('throws when creating payment with invalid amount', async () => {
    await expect(
      mobileMoneyService.createMobileMoneyPayment({ provider: 'mtn', amount: 0, phoneNumber: '256700000000' })
    ).rejects.toThrow('Payment amount must be greater than zero');
  });

  it('throws when creating payment with missing phone number', async () => {
    await expect(
      mobileMoneyService.createMobileMoneyPayment({ provider: 'mtn', amount: 50 })
    ).rejects.toThrow('Valid phone number is required');
  });

  it('throws when verifying payment with unsupported provider', async () => {
    await expect(
      mobileMoneyService.verifyMobileMoneyPayment({ provider: 'unknown', transactionId: 'tx-123' })
    ).rejects.toThrow('Unsupported mobile money provider: unknown');
  });

  it('throws when verifying payment with missing transactionId', async () => {
    await expect(
      mobileMoneyService.verifyMobileMoneyPayment({ provider: 'mtn' })
    ).rejects.toThrow('Transaction ID is required to verify payment');
  });

  it('throws when MTN config is missing during creation', async () => {
    process.env.MTN_MOMO_BASE_URL = '';
    process.env.MTN_MOMO_SUBSCRIPTION_KEY = '';
    process.env.MTN_MOMO_ACCESS_TOKEN = '';

    await expect(
      mobileMoneyService.createMobileMoneyPayment({ provider: 'mtn', amount: 25, phoneNumber: '256700000000' })
    ).rejects.toThrow('Missing MTN MoMo configuration in environment variables');
  });

  it('creates MTN payment when configuration is present', async () => {
    process.env.MTN_MOMO_BASE_URL = 'https://api.mtn.com';
    process.env.MTN_MOMO_SUBSCRIPTION_KEY = 'sub-key';
    process.env.MTN_MOMO_ACCESS_TOKEN = 'access-token';
    process.env.MTN_MOMO_TARGET_ENV = 'sandbox';

    axios.post.mockResolvedValue({ status: 202, data: { requestId: 'req-123' } });

    const result = await mobileMoneyService.createMobileMoneyPayment({
      provider: 'mtn',
      amount: 45,
      currency: 'UGX',
      phoneNumber: '256700000000',
      externalId: 'tx-123',
      description: 'Test MTN payment'
    });

    expect(result).toMatchObject({
      provider: 'mtn',
      providerName: 'MTN MoMo',
      transactionId: 'tx-123',
      status: 'pending',
      amount: '45.00',
      currency: 'UGX',
      phoneNumber: '256700000000',
      description: 'Test MTN payment'
    });
  });

  it('verifies MTN payment when configuration is present', async () => {
    process.env.MTN_MOMO_BASE_URL = 'https://api.mtn.com';
    process.env.MTN_MOMO_SUBSCRIPTION_KEY = 'sub-key';
    process.env.MTN_MOMO_ACCESS_TOKEN = 'access-token';
    process.env.MTN_MOMO_TARGET_ENV = 'sandbox';

    axios.get.mockResolvedValue({ data: { status: 'SUCCESSFUL' } });

    const result = await mobileMoneyService.verifyMobileMoneyPayment({ provider: 'mtn', transactionId: 'tx-456' });

    expect(result).toEqual({
      provider: 'mtn',
      providerName: 'MTN MoMo',
      transactionId: 'tx-456',
      status: 'SUCCESSFUL',
      rawResponse: { status: 'SUCCESSFUL' }
    });
  });

  it('throws when Airtel config is missing during creation', async () => {
    process.env.AIRTEL_MONEY_BASE_URL = '';
    process.env.AIRTEL_MONEY_API_KEY = '';
    process.env.AIRTEL_MONEY_API_TOKEN = '';

    await expect(
      mobileMoneyService.createMobileMoneyPayment({ provider: 'airtel', amount: 30, phoneNumber: '256700000000' })
    ).rejects.toThrow('Missing Airtel Money configuration in environment variables');
  });

  it('creates Airtel payment when configuration is present', async () => {
    process.env.AIRTEL_MONEY_BASE_URL = 'https://api.airtel.com';
    process.env.AIRTEL_MONEY_API_KEY = 'api-key';
    process.env.AIRTEL_MONEY_API_TOKEN = 'api-token';
    process.env.AIRTEL_MONEY_PAYMENT_URL = 'https://api.airtel.com/payments/v1/request';

    axios.post.mockResolvedValue({ status: 202, data: { paymentId: 'pay-123' } });

    const result = await mobileMoneyService.createMobileMoneyPayment({
      provider: 'airtel',
      amount: 80,
      currency: 'UGX',
      phoneNumber: '256700000000',
      externalId: 'tx-789',
      description: 'Test Airtel payment'
    });

    expect(result).toMatchObject({
      provider: 'airtel',
      providerName: 'Airtel Money',
      transactionId: 'tx-789',
      status: 'pending',
      amount: '80.00',
      currency: 'UGX',
      phoneNumber: '256700000000',
      description: 'Test Airtel payment'
    });
  });

  it('verifies Airtel payment when configuration is present', async () => {
    process.env.AIRTEL_MONEY_BASE_URL = 'https://api.airtel.com';
    process.env.AIRTEL_MONEY_API_KEY = 'api-key';
    process.env.AIRTEL_MONEY_API_TOKEN = 'api-token';
    process.env.AIRTEL_MONEY_VERIFY_URL = 'https://api.airtel.com/payments/v1/verify/tx-999';

    axios.get.mockResolvedValue({ data: { status: 'COMPLETED' } });

    const result = await mobileMoneyService.verifyMobileMoneyPayment({ provider: 'airtel', transactionId: 'tx-999' });

    expect(result).toEqual({
      provider: 'airtel',
      providerName: 'Airtel Money',
      transactionId: 'tx-999',
      status: 'COMPLETED',
      rawResponse: { status: 'COMPLETED' }
    });
  });
});
