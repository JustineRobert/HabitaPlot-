/**
 * Listing Service
 * Handles property listing API requests
 */

import apiClient from './api';

export const listingService = {
  /**
   * Get all listings with filtering
   */
  getListings: async (params = {}) => {
    const {
      page = 1,
      limit = 20,
      type,
      priceMin,
      priceMax,
      location,
      district,
      bedrooms,
      sort = 'created_at',
      order = 'DESC'
    } = params;

    const response = await apiClient.get('/listings', {
      params: {
        page,
        limit,
        type,
        priceMin,
        priceMax,
        location,
        district,
        bedrooms,
        sort,
        order
      }
    });

    return response.data;
  },

  /**
   * Get single listing by ID
   */
  getListingById: async (id) => {
    const response = await apiClient.get(`/listings/${id}`);
    return response.data;
  },

  /**
   * Create new listing
   */
  createListing: async (listingData) => {
    const response = await apiClient.post('/listings', listingData);
    return response.data;
  },

  /**
   * Update listing
   */
  updateListing: async (id, updates) => {
    const response = await apiClient.patch(`/listings/${id}`, updates);
    return response.data;
  },

  /**
   * Delete listing
   */
  deleteListing: async (id) => {
    await apiClient.delete(`/listings/${id}`);
  },

  /**
   * Search listings with advanced filters
   */
  searchListings: async (query, params = {}) => {
    const response = await apiClient.get('/listings/search', {
      params: { query, ...params }
    });
    return response.data;
  },

  /**
   * Get listings by user
   */
  getUserListings: async (userId, params = {}) => {
    const response = await apiClient.get(`/users/${userId}/listings`, {
      params
    });
    return response.data;
  },

  /**
   * Upload listing images
   */
  uploadImages: async (listingId, files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await apiClient.post(
      `/listings/${listingId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  }
};
