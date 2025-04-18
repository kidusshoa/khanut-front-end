import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  minRating?: number;
  maxRating?: number;
  startDate?: string;
  endDate?: string;
}

export const reviewApi = {
  // Get all reviews for a service with pagination
  getServiceReviews: async (
    serviceId: string,
    params: PaginationParams = {}
  ) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort,
        order,
        minRating,
        maxRating,
      } = params;

      let url = `${API_URL}/reviews/service/${serviceId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (minRating) url += `&minRating=${minRating}`;
      if (maxRating) url += `&maxRating=${maxRating}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching service reviews:", error);
      throw error;
    }
  },

  // Get all reviews for a business with pagination
  getBusinessReviews: async (
    businessId: string,
    params: PaginationParams = {}
  ) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort,
        order,
        minRating,
        maxRating,
      } = params;

      let url = `${API_URL}/reviews/business/${businessId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (minRating) url += `&minRating=${minRating}`;
      if (maxRating) url += `&maxRating=${maxRating}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching business reviews:", error);
      throw error;
    }
  },

  // Get all reviews by a customer with pagination
  getCustomerReviews: async (
    customerId: string,
    params: PaginationParams = {}
  ) => {
    try {
      const { page = 1, limit = 10, sort, order } = params;

      let url = `${API_URL}/reviews/customer/${customerId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer reviews:", error);
      throw error;
    }
  },

  // Get service rating statistics
  getServiceRatingStats: async (serviceId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/reviews/stats/service/${serviceId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching service rating stats:", error);
      throw error;
    }
  },

  // Create a new review
  createReview: async (reviewData: {
    serviceId: string;
    businessId: string;
    customerId: string;
    rating: number;
    comment: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  },

  // Update a review
  updateReview: async (
    reviewId: string,
    reviewData: {
      rating?: number;
      comment?: string;
    }
  ) => {
    try {
      const response = await axios.put(
        `${API_URL}/reviews/${reviewId}`,
        reviewData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId: string) => {
    try {
      const response = await axios.delete(`${API_URL}/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },
};
