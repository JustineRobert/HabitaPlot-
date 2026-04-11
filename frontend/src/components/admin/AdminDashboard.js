import React, { useState, useEffect } from 'react';
import {
  FiBarChart2,
  FiUsers,
  FiFileText,
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

/**
 * AdminDashboard Component
 * Main admin panel dashboard with key metrics and navigation
 */
const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics/dashboard');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Failed to load dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b">
        {[
          { id: 'overview', label: 'Overview', icon: FiBarChart2 },
          { id: 'users', label: 'Users', icon: FiUsers },
          { id: 'listings', label: 'Listings', icon: FiFileText },
          { id: 'subscriptions', label: 'Subscriptions', icon: FiCreditCard }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* User Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold mt-2">{analytics.users.total}</p>
              </div>
              <FiUsers className="text-blue-500" size={32} />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {analytics.users.active} active, {analytics.users.newThisMonth} new this month
            </p>
          </div>

          {/* Listings Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Listings</p>
                <p className="text-3xl font-bold mt-2">{analytics.listings.total}</p>
              </div>
              <FiFileText className="text-green-500" size={32} />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {analytics.listings.active} active, {analytics.listings.pending} pending
            </p>
          </div>

          {/* Subscriptions Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Subscriptions</p>
                <p className="text-3xl font-bold mt-2">{analytics.subscriptions.active}</p>
              </div>
              <FiCreditCard className="text-purple-500" size={32} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm mb-4">Quick Actions</p>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                Review Pending
              </button>
              <button className="w-full px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100">
                Manage Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trends Section */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Top Cities */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-green-500" />
              Top Cities
            </h3>
            <div className="space-y-3">
              {analytics.trends.topCities.map((city, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-700">{city.city}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded">
                      <div
                        className="h-full bg-blue-500 rounded"
                        style={{
                          width: `${(city.count / analytics.trends.topCities[0].count) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{city.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Listings by Type */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiBarChart2 className="text-blue-500" />
              Listings by Type
            </h3>
            <div className="space-y-3">
              {analytics.trends.listingsByType.map((type, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{type.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded">
                      <div
                        className="h-full bg-green-500 rounded"
                        style={{
                          width: `${(type.count / analytics.trends.listingsByType[0].count) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{type.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">User Management</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4">
            View All Users
          </button>
          <p className="text-gray-600">User management features will be available in the Users page.</p>
        </div>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Listing Management</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4">
            Review Pending Listings
          </button>
          <p className="text-gray-600">Pending listings: {analytics.listings.pending}</p>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Subscription Management</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4">
            View All Subscriptions
          </button>
          <p className="text-gray-600">Active subscriptions: {analytics.subscriptions.active}</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
