import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheckCircle, FiClock } from 'react-icons/fi';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [provider, setProvider] = useState('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [description, setDescription] = useState(
    searchParams.get('description') || 'Uganda mobile money payment'
  );
  const [externalId, setExternalId] = useState(searchParams.get('externalId') || '');
  const [listingId] = useState(searchParams.get('listingId') || '');
  const [paymentResult, setPaymentResult] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = await paymentService.getProviders();
        setProviders(data);
        if (data.length > 0) setProvider(data[0]);
      } catch (error) {
        console.error('Failed to load payment providers', error);
        toast.error('Unable to load payment providers');
      }
    };

    loadProviders();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!provider || !amount || !phoneNumber) {
      toast.error('Please provide provider, amount, and phone number');
      return;
    }

    try {
      setLoading(true);
      setVerificationResult(null);
      const result = await paymentService.initiateMobileMoneyPayment({
        provider,
        amount,
        currency: 'UGX',
        phoneNumber,
        description,
        externalId: externalId || undefined,
        listingId: listingId || undefined
      });
      setPaymentResult(result);
      toast.success('Payment request created. Verify when complete.');
    } catch (error) {
      console.error('Payment initiation failed', error);
      toast.error(error.response?.data?.message || error.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!paymentResult?.transactionId || !provider) {
      toast.error('No transaction to verify');
      return;
    }

    try {
      setVerifying(true);
      const verification = await paymentService.verifyMobileMoneyPayment({
        provider,
        transactionId: paymentResult.transactionId
      });
      setVerificationResult(verification);
      toast.success('Payment verification complete');
    } catch (error) {
      console.error('Payment verification failed', error);
      toast.error(error.response?.data?.message || error.message || 'Payment verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handlePrintReceipt = () => {
    if (paymentResult?.id) {
      navigate(`/transactions/${paymentResult.id}`);
    } else {
      toast.error('Transaction record not found yet');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <FiArrowLeft /> Back
      </button>

      <div className="bg-white rounded-xl shadow p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pay with Mobile Money</h1>
          <p className="text-gray-600">Use MTN MoMo or Airtel Money to complete your HabitaPlot payment.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {providers.map((providerId) => (
                <option key={providerId} value={providerId}>
                  {providerId === 'mtn' ? 'MTN MoMo' : 'Airtel Money'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. +256772123456"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (UGX)</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Reference</label>
              <input
                type="text"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                placeholder="Optional reference"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Creating payment...' : 'Initiate Payment'}
            </button>

            {paymentResult && (
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                {verifying ? 'Verifying...' : 'Verify Payment'}
              </button>
            )}
          </div>
        </form>

        {paymentResult && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiClock className="text-blue-600" />
              <h2 className="text-xl font-semibold">Payment Request Submitted</h2>
            </div>
            <p className="text-gray-700 mb-2">Provider: {paymentResult.providerName}</p>
            <p className="text-gray-700 mb-2">Transaction ID: {paymentResult.transactionId}</p>
            <p className="text-gray-700 mb-2">Status: {paymentResult.status}</p>
            <p className="text-gray-700 mb-2">Receipt: {paymentResult.receiptNumber}</p>
            <p className="text-gray-700">Amount: UGX {Number(paymentResult.amount).toLocaleString()}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handlePrintReceipt}
                className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                View Receipt
              </button>
            </div>
          </div>
        )}

        {verificationResult && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiCheckCircle className="text-green-600" />
              <h2 className="text-xl font-semibold">Payment Verified</h2>
            </div>
            <p className="text-gray-700 mb-2">Status: {verificationResult.status}</p>
            <pre className="mt-4 overflow-x-auto text-sm text-gray-600 bg-white rounded-lg p-4 border border-gray-200">
              {JSON.stringify(verificationResult.rawResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
