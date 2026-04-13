import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import toast from 'react-hot-toast';

const TransactionReceiptPage = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getTransaction(id);
      setTransaction(response.data || response);
    } catch (error) {
      console.error('Failed to load transaction receipt', error);
      toast.error(error.response?.data?.message || error.message || 'Unable to load receipt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadTransaction();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Receipt</h1>
          <p className="text-gray-600">Printable receipt for your completed transaction.</p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Print Receipt
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : !transaction ? (
        <div className="text-center text-gray-600 py-10">Loading receipt details...</div>
      ) : (
        <div className="bg-white rounded-xl shadow p-8 print:p-0">
          <div className="mb-8 border-b pb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Receipt No.</p>
                <h2 className="text-2xl font-semibold text-gray-900">{transaction.receiptNumber}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  {transaction.status}
                </span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Created on {new Date(transaction.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="text-lg font-medium text-gray-900">{transaction.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-lg font-medium text-gray-900">
                  {transaction.currency} {Number(transaction.amount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="text-lg font-medium text-gray-900">{transaction.providerName}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-lg font-medium text-gray-900">{transaction.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Listing ID</p>
                <p className="text-lg font-medium text-gray-900">{transaction.listingId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-lg font-medium text-gray-900">{transaction.description || 'Listing payment'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-6 text-sm text-gray-600 print:hidden">
            <Link to="/transactions" className="text-blue-600 hover:underline">
              Back to transaction history
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionReceiptPage;
