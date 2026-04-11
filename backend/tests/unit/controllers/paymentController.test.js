/**
 * Payment controller unit tests
 */

jest.mock('../../../src/services/mobileMoneyService');

const mobileMoneyService = require('../../../src/services/mobileMoneyService');
const paymentController = require('../../../src/controllers/paymentController');

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('PaymentController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns supported providers', async () => {
    mobileMoneyService.getSupportedProviders.mockReturnValue(['mtn', 'airtel']);
    const req = {};
    const res = createResponse();

    await paymentController.getMobileMoneyProviders(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ providers: ['mtn', 'airtel'] });
  });

  it('returns validation error when initiating mobile money payment with missing fields', async () => {
    const req = { body: { provider: 'mtn' } };
    const res = createResponse();

    await paymentController.initiateMobileMoneyPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'ValidationError' }));
  });

  it('initiates a mobile money payment successfully', async () => {
    const paymentResult = { provider: 'mtn', transactionId: 'tx-1' };
    mobileMoneyService.createMobileMoneyPayment.mockResolvedValue(paymentResult);

    const req = { body: { provider: 'mtn', amount: 100, phoneNumber: '256700000000' } };
    const res = createResponse();

    await paymentController.initiateMobileMoneyPayment(req, res);

    expect(mobileMoneyService.createMobileMoneyPayment).toHaveBeenCalledWith(expect.objectContaining({ provider: 'mtn', amount: 100, phoneNumber: '256700000000' }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: paymentResult });
  });

  it('returns validation error when verifying mobile money payment with missing fields', async () => {
    const req = { body: { provider: 'mtn' } };
    const res = createResponse();

    await paymentController.verifyMobileMoneyPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'ValidationError' }));
  });

  it('verifies a mobile money payment successfully', async () => {
    const verificationResult = { provider: 'mtn', status: 'pending' };
    mobileMoneyService.verifyMobileMoneyPayment.mockResolvedValue(verificationResult);

    const req = { body: { provider: 'mtn', transactionId: 'tx-123' } };
    const res = createResponse();

    await paymentController.verifyMobileMoneyPayment(req, res);

    expect(mobileMoneyService.verifyMobileMoneyPayment).toHaveBeenCalledWith({ provider: 'mtn', transactionId: 'tx-123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: verificationResult });
  });
});
