import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import toast from 'react-hot-toast';

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const loadTransactions = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await paymentService.getTransactions({ page: pageNumber, limit: 20 });
      setTransactions(response.data || []);
      setPagination(response.pagination || null);
      setPage(pageNumber);
    } catch (error) {
      console.error('Failed to load transactions', error);
      toast.error(error.response?.data?.message || error.message || 'Unable to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
        <p className="text-gray-600">Track all of your payment receipts and printable transaction records.</p>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <span className="font-semibold text-gray-900">Recent Transactions</span>
          <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center text-gray-600">
            No transactions found. Start a new payment to create a receipt.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.receiptNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.providerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.currency} {Number(transaction.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/transactions/${transaction.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Receipt
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => loadTransactions(page - 1)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              disabled={page >= pagination.pages}
              onClick={() => loadTransactions(page + 1)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryPage;
