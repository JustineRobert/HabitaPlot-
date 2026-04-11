import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiStar, FiEye } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

/**
 * AdminListingsPage Component
 * Manage listing moderation, approvals, and featured promotions
 */
const AdminListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [activeTab, setActiveTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState({ type: null, reason: '' });

  const LIMIT = 20;

  useEffect(() => {
    fetchListings();
  }, [activeTab, page]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let endpoint = '/admin/listings';
      const params = { page, limit: LIMIT };

      if (activeTab === 'pending') {
        endpoint = '/admin/listings/pending';
      }

      const response = await api.get(endpoint, { params });
      setListings(response.data.listings);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveListing = async (listingId) => {
    try {
      await api.patch(`/admin/listings/${listingId}/approve`);
      toast.success('Listing approved successfully');
      setShowModal(false);
      fetchListings();
    } catch (error) {
      console.error('Failed to approve listing:', error);
      toast.error('Failed to approve listing');
    }
  };

  const handleRejectListing = async (listingId, reason) => {
    try {
      if (!reason) {
        toast.error('Please provide a rejection reason');
        return;
      }
      await api.patch(`/admin/listings/${listingId}/reject`, { reason });
      toast.success('Listing rejected successfully');
      setShowModal(false);
      fetchListings();
    } catch (error) {
      console.error('Failed to reject listing:', error);
      toast.error('Failed to reject listing');
    }
  };

  const handleFeatureListing = async (listingId, durationDays) => {
    try {
      await api.patch(`/admin/listings/${listingId}/feature`, {
        durationDays: parseInt(durationDays) || 30
      });
      toast.success('Listing featured successfully');
      setShowModal(false);
      fetchListings();
    } catch (error) {
      console.error('Failed to feature listing:', error);
      toast.error('Failed to feature listing');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Listing Moderation</h1>
        <p className="text-gray-600">Review, approve, and manage property listings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b bg-white rounded-t-lg">
        {[
          { id: 'pending', label: 'Pending Review' },
          { id: 'active', label: 'Active' },
          { id: 'all', label: 'All Listings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
            className={`px-6 py-3 border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Listing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Loading listings...
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No listings found
                  </td>
                </tr>
              ) : (
                listings.map(listing => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {listing.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {listing.locationAddress}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium">{listing.owner?.name}</p>
                        <p className="text-gray-600">{listing.owner?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 capitalize">
                        {listing.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ${Number(listing.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded capitalize ${
                        listing.listingStatus === 'active'
                          ? 'bg-green-100 text-green-800'
                          : listing.listingStatus === 'pending_review'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {listing.listingStatus?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedListing(listing);
                            setAction({ type: 'view' });
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                        {activeTab === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedListing(listing);
                                setAction({ type: 'approve' });
                                setShowModal(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <FiCheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedListing(listing);
                                setAction({ type: 'reject', reason: '' });
                                setShowModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <FiXCircle size={16} />
                            </button>
                          </>
                        )}
                        {activeTab !== 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedListing(listing);
                              setAction({ type: 'feature', durationDays: 30 });
                              setShowModal(true);
                            }}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                            title="Feature"
                          >
                            <FiStar size={16} />
                          </button>
                        )}
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
      {showModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {action.type === 'view' && 'Listing Details'}
              {action.type === 'approve' && 'Approve Listing'}
              {action.type === 'reject' && 'Reject Listing'}
              {action.type === 'feature' && 'Feature Listing'}
            </h3>

            {action.type === 'view' && (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Title</p>
                  <p className="font-medium">{selectedListing.title}</p>
                </div>
                <div>
                  <p className="text-gray-600">Description</p>
                  <p className="line-clamp-2">{selectedListing.description}</p>
                </div>
                <div>
                  <p className="text-gray-600">Price</p>
                  <p className="font-medium">${Number(selectedListing.price).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Size</p>
                  <p className="font-medium">{selectedListing.sizeSqft} sqft</p>
                </div>
                <div>
                  <p className="text-gray-600">Bedrooms/Bathrooms</p>
                  <p className="font-medium">{selectedListing.bedrooms}/{selectedListing.bathrooms}</p>
                </div>
                <div>
                  <p className="text-gray-600">Amenities</p>
                  <p className="text-sm">{selectedListing.amenities?.join(', ') || 'N/A'}</p>
                </div>
              </div>
            )}

            {action.type === 'approve' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to approve this listing?
                </p>
                <button
                  onClick={() => handleApproveListing(selectedListing.id)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Confirm Approval
                </button>
              </div>
            )}

            {action.type === 'reject' && (
              <div className="space-y-4">
                <textarea
                  placeholder="Reason for rejection (required)"
                  value={action.reason}
                  onChange={(e) => setAction({ ...action, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                <button
                  onClick={() => handleRejectListing(selectedListing.id, action.reason)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject Listing
                </button>
              </div>
            )}

            {action.type === 'feature' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Feature Duration (days)
                  </label>
                  <input
                    type="number"
                    value={action.durationDays}
                    onChange={(e) => setAction({ ...action, durationDays: e.target.value })}
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => handleFeatureListing(selectedListing.id, action.durationDays)}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Feature Listing
                </button>
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

export default AdminListingsPage;
