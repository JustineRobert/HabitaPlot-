/**
 * Search Page Component
 * Advanced listing search and filtering
 */

import React, { useState, useEffect } from 'react';
import { listingService } from '../services/listingService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FiHome, FiMapPin, FiDollarSign } from 'react-icons/fi';

const SearchPage = () => {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    district: '',
    type: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const data = await listingService.getListings(filters);
        setListings(data.data || []);
        setPagination(data.pagination || {});
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast.error('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">Search Properties</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h3 className="text-lg font-bold mb-4">Filters</h3>

          <div className="space-y-4">
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="text"
              name="district"
              placeholder="District"
              value={filters.district}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Types</option>
              <option value="plot">Plot</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="commercial">Commercial</option>
              <option value="rental">Rental</option>
            </select>

            <input
              type="number"
              name="priceMin"
              placeholder="Min Price"
              value={filters.priceMin}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="number"
              name="priceMax"
              placeholder="Max Price"
              value={filters.priceMax}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <select
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Bedrooms</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Showing {listings.length} of {pagination.total} properties
              </p>

              <div className="space-y-4">
                {listings.map(listing => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="flex bg-white rounded-lg shadow hover:shadow-lg overflow-hidden"
                  >
                    {/* Image */}
                    <div className="w-64 h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0 flex items-center justify-center">
                      <FiHome className="text-6xl text-gray-400" />
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-grow">
                      <h3 className="text-xl font-bold mb-2">{listing.title}</h3>

                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <FiMapPin size={16} />
                        <span>{listing.locationAddress}</span>
                      </div>

                      <div className="flex gap-6 mb-4">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                          <FiDollarSign /> {listing.price.toLocaleString()}
                        </div>
                        <span className="text-gray-600">
                          {listing.bedrooms && `${listing.bedrooms} BR`}
                        </span>
                        <span className="text-gray-600">
                          {listing.bathrooms && `${listing.bathrooms} BA`}
                        </span>
                      </div>

                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm font-medium">
                        {listing.type.toUpperCase()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setFilters({ ...filters, page })}
                      className={`px-4 py-2 rounded ${
                        filters.page === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
