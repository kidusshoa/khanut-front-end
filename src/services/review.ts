import api from "./api";
import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

export interface ReviewData {
  businessId: string;
  serviceId?: string;
  rating: number;
  comment: string;
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

      let url = `/reviews/service/${serviceId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (minRating) url += `&minRating=${minRating}`;
      if (maxRating) url += `&maxRating=${maxRating}`;

      const response = await api.get(url);
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

      let url = `/reviews/business/${businessId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (minRating) url += `&minRating=${minRating}`;
      if (maxRating) url += `&maxRating=${maxRating}`;

      const response = await api.get(url);
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

      let url = `/reviews/customer/${customerId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer reviews:", error);
      throw error;
    }
  },

  // Get service rating statistics
  getServiceRatingStats: async (serviceId: string) => {
    try {
      const response = await api.get(`/reviews/stats/service/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching service rating stats:", error);
      throw error;
    }
  },

  // Create a new review
  createReview: async (reviewData: ReviewData) => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required to submit a review");
      }

      const response = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit review");
      }

      return response.json();
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
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId: string) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },
};
