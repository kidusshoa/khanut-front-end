import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const reviewApi = {
  // Get all reviews for a service
  getServiceReviews: async (serviceId: string) => {
    const response = await axios.get(`${API_URL}/reviews/service/${serviceId}`);
    return response.data;
  },

  // Get all reviews for a business
  getBusinessReviews: async (businessId: string) => {
    const response = await axios.get(`${API_URL}/reviews/business/${businessId}`);
    return response.data;
  },

  // Get all reviews by a customer
  getCustomerReviews: async (customerId: string) => {
    const response = await axios.get(`${API_URL}/reviews/customer/${customerId}`);
    return response.data;
  },

  // Get service rating statistics
  getServiceRatingStats: async (serviceId: string) => {
    const response = await axios.get(`${API_URL}/reviews/stats/service/${serviceId}`);
    return response.data;
  },

  // Create a new review
  createReview: async (reviewData: {
    serviceId: string;
    businessId: string;
    customerId: string;
    rating: number;
    comment: string;
  }) => {
    const response = await axios.post(`${API_URL}/reviews`, reviewData);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId: string, reviewData: {
    rating?: number;
    comment?: string;
  }) => {
    const response = await axios.put(`${API_URL}/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId: string) => {
    const response = await axios.delete(`${API_URL}/reviews/${reviewId}`);
    return response.data;
  },
};
