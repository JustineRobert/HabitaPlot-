/**
 * Home Page Component
 * Landing page with featured listings
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMapPin, FiDollarSign, FiHome } from 'react-icons/fi';
import { listingService } from '../services/listingService';
import toast from 'react-hot-toast';

const HomePage = () => {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        const data = await listingService.getListings({ limit: 6 });
        setFeaturedListings(data.data || []);
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast.error('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedListings();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Find Your Perfect Property</h1>
          <p className="text-xl mb-8 opacity-90">
            Discover thousands of properties for sale, rental, and investment opportunities
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100"
          >
            Start Searching <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Location"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option>Property Type</option>
                <option>House</option>
                <option>Apartment</option>
                <option>Plot</option>
                <option>Commercial</option>
              </select>
              <input
                type="number"
                placeholder="Max Price"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold mb-12">Featured Properties</h2>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredListings.map(listing => (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg overflow-hidden"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <FiHome className="text-6xl text-gray-400" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">
                    {listing.title}
                  </h3>

                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <FiMapPin size={16} />
                    <span className="text-sm">{listing.locationAddress}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                      <FiDollarSign size={16} />
                      {listing.price.toLocaleString()}
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      {listing.type.toUpperCase()}
                    </span>
                  </div>

                  {listing.bedrooms && (
                    <div className="mt-3 text-sm text-gray-600">
                      {listing.bedrooms} BR • {listing.bathrooms} BA
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
          >
            View All Properties <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold">10K+</h3>
              <p className="mt-2">Active Properties</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold">50K+</h3>
              <p className="mt-2">Happy Users</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold">500+</h3>
              <p className="mt-2">Trusted Agents</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold">$1B+</h3>
              <p className="mt-2">Properties Listed</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
