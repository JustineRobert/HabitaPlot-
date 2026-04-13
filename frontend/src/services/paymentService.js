/**
 * Payment Service
 * Handles mobile money payment API calls.
 */

import apiClient from './api';

export const paymentService = {
  getProviders: async () => {
    const response = await apiClient.get('/payments/mobile-money/providers');
    return response.data.providers;
  },

  initiateMobileMoneyPayment: async (paymentData) => {
    const response = await apiClient.post('/payments/mobile-money/initiate', paymentData);
    return response.data.data;
  },

  verifyMobileMoneyPayment: async ({ provider, transactionId }) => {
    const response = await apiClient.post('/payments/mobile-money/verify', {
      provider,
      transactionId
    });
    return response.data.data;
  },

  getTransactions: async ({ page = 1, limit = 20 } = {}) => {
    const response = await apiClient.get('/payments/transactions', {
      params: { page, limit }
    });
    return response.data;
  },

  getTransaction: async (transactionId) => {
    const response = await apiClient.get(`/payments/transactions/${transactionId}`);
    return response.data.data;
  }
};
