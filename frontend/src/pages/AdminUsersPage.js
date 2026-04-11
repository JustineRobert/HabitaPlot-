import React, { useState, useEffect } from 'react';
import { FiSearch, FiCheckCircle, FiXCircle, FiEye, FiEdit } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

/**
 * AdminUsersPage Component
 * Manage users, KYC verification, suspensions, and bans
 */
const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(null);

  const LIMIT = 20;

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: LIMIT,
        search: filters.search || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined
      };

      const response = await api.get('/admin/users', { params });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleKYCUpdate = async (userId, kycStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/kyc`, {
        kycStatus,
        notes: action?.notes || ''
      });
      toast.success(`KYC status updated to ${kycStatus}`);
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update KYC:', error);
      toast.error(error.response?.data?.error || 'Failed to update KYC');
    }
  };

  const handleUserStatusUpdate = async (userId, action, reason) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, {
        action,
        reason
      });
      toast.success(`User ${action}ed successfully`);
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error(error.response?.data?.error || 'Failed to update user');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const getValueBadgeColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-600">Manage users, verify KYC, and handle suspensions</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name or email"
                className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  KYC Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getValueBadgeColor(user.kycStatus)}`}>
                        {user.kycStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setAction({ type: 'view' });
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setAction({ type: 'kyc' });
                            setShowModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Update KYC"
                        >
                          <FiCheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setAction({ type: 'suspend' });
                            setShowModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Manage Status"
                        >
                          <FiXCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Actions */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {action?.type === 'kyc' && 'Update KYC Status'}
              {action?.type === 'view' && 'User Details'}
              {action?.type === 'suspend' && 'Manage User Status'}
            </h3>

            {action?.type === 'kyc' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select new KYC status for {selectedUser.name}
                </p>
                <textarea
                  placeholder="Notes (optional)"
                  value={action.notes || ''}
                  onChange={(e) => setAction({ ...action, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleKYCUpdate(selectedUser.id, 'approved')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleKYCUpdate(selectedUser.id, 'rejected')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {action?.type === 'suspend' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Current status: {selectedUser.isActive ? 'Active' : 'Inactive'}
                </p>
                <textarea
                  placeholder="Reason (required)"
                  value={action.reason || ''}
                  onChange={(e) => setAction({ ...action, reason: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                <div className="flex gap-2">
                  {selectedUser.isActive ? (
                    <button
                      onClick={() => handleUserStatusUpdate(selectedUser.id, 'suspend', action.reason)}
                      className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUserStatusUpdate(selectedUser.id, 'activate', action.reason)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
