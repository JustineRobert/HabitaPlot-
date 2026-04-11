/**
 * Dashboard Page
 * User dashboard for managing listings and account
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiList, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DashboardPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchUserListings();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.name}!</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b">
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
