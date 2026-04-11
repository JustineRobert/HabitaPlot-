/**
 * Listing Detail Page
 * Shows full details of a single property
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listingService } from '../services/listingService';
import toast from 'react-hot-toast';
import { FiHome, FiMapPin, FiDollarSign, FiPhone, FiMail } from 'react-icons/fi';

const ListingDetailPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await listingService.getListingById(id);
        setListing(data);
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast.error('Failed to load listing');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Listing not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-6 flex items-center justify-center">
            <FiHome className="text-9xl text-gray-400" />
          </div>

          {/* Details */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <FiMapPin /> {listing.locationAddress}
              </div>
              {listing.district && (
                <div className="text-gray-500 text-sm">
                  District: {listing.district}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-3xl font-bold text-blue-600 mb-6">
              <FiDollarSign /> {listing.price.toLocaleString()}
              {listing.priceNegotiable && <span className="text-lg text-gray-600">(Negotiable)</span>}
            </div>

            <h3 className="text-2xl font-bold mb-4">Description</h3>
            <p className="text-gray-600 leading-relaxed mb-6">{listing.description}</p>

            <h3 className="text-2xl font-bold mb-4">Property Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {listing.bedrooms && <div className="bg-gray-50 p-4 rounded"><span className="text-gray-600">Bedrooms:</span> {listing.bedrooms}</div>}
              {listing.bathrooms && <div className="bg-gray-50 p-4 rounded"><span className="text-gray-600">Bathrooms:</span> {listing.bathrooms}</div>}
              {listing.sizeSqft && <div className="bg-gray-50 p-4 rounded"><span className="text-gray-600">Size:</span> {listing.sizeSqft} sqft</div>}
              <div className="bg-gray-50 p-4 rounded"><span className="text-gray-600">Type:</span> {listing.type}</div>
            </div>

            {listing.amenities && listing.amenities.length > 0 && (
              <>
                <h3 className="text-2xl font-bold mt-6 mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((amenity, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-600 px-3 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Contact Card */}
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h3 className="text-xl font-bold mb-4">Contact Agent</h3>

            {listing.owner && (
              <>
                <div className="mb-4">
                  <p className="font-bold">{listing.owner.name}</p>
                  {listing.owner.verifiedId && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Verified</span>}
                </div>

                {listing.owner.phone && (
                  <a href={`tel:${listing.owner.phone}`} className="flex items-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-2">
                    <FiPhone /> Call
                  </a>
                )}

                {listing.owner.email && (
                  <a href={`mailto:${listing.owner.email}`} className="flex items-center gap-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <FiMail /> Email
                  </a>
                )}
              </>
            )}

            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mt-4">
              Send Inquiry
            </button>

            <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 mt-2">
              Save to Favorites
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
