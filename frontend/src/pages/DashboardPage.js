/**
 * Dashboard Page
 * User dashboard for managing listings and account
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiList, FiSettings, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { paymentService } from '../services/paymentService';

const DashboardPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchUserListings();
    }

    if (activeTab === 'transactions') {
      fetchUserTransactions();
    }
  }, [activeTab]);

  const fetchUserListings = async () => {
    try {
      setLoading(true);
      // listings will be fetched from API
      setListings([]);
    } catch (error) {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await paymentService.getTransactions({ page: 1, limit: 5 });
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Failed to load transactions', error);
      toast.error('Failed to load transaction history');
    } finally {
      setTransactionsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.name}!</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b flex-wrap">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 px-4 py-2 font-bold ${
            activeTab === 'listings'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          <FiList /> My Listings
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 font-bold ${
            activeTab === 'transactions'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          <FiCreditCard /> Transactions
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 font-bold ${
            activeTab === 'settings'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          <FiSettings /> Settings
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'listings' && (
          <div>
            <div className="mb-6">
              <Link
                to="#"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
              >
                <FiPlus /> Create New Listing
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 mb-4">No listings yet</p>
                <Link
                  to="#"
                  className="text-blue-600 hover:underline"
                >
                  Create your first listing
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-600">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-600">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-600">Views</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map(listing => (
                      <tr key={listing.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3">{listing.title}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-sm">
                            {listing.status}
                          </span>
                        </td>
                        <td className="px-6 py-3">{listing.views}</td>
                        <td className="px-6 py-3">
                          <button className="text-blue-600 hover:underline">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Recent Transactions</h2>
                <p className="text-gray-600">View your latest payment receipts and print them from the transaction history page.</p>
              </div>
              <Link
                to="/transactions"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
              >
                View All Transactions
              </Link>
            </div>

            {transactionsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 mb-4">No transactions found yet.</p>
                <p className="text-gray-500">Complete a payment to generate a printable receipt.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-600">Receipt</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-600">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-600">Provider</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-600">Status</th>
                      <th className="px-6 py-3 text-right text-sm font-bold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3">{transaction.receiptNumber}</td>
                        <td className="px-6 py-3">{transaction.currency} {Number(transaction.amount).toLocaleString()}</td>
                        <td className="px-6 py-3">{transaction.providerName}</td>
                        <td className="px-6 py-3">{transaction.status}</td>
                        <td className="px-6 py-3 text-right">
                          <Link to={`/transactions/${transaction.id}`} className="text-blue-600 hover:underline">
                            Receipt
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
            <p className="text-gray-600">Settings coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
