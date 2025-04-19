// Business Detail API service
import api from "./api";

export interface BusinessDetailParams {
  includeServices?: boolean;
  includeReviews?: boolean;
}

export const businessDetailApi = {
  // Get business details by ID
  getBusinessById: async (
    businessId: string,
    params: BusinessDetailParams = {}
  ) => {
    try {
      const response = await api.get(`/businesses/${businessId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching business details:", error);
      throw error;
    }
  },

  // Get business services
  getBusinessServices: async (businessId: string) => {
    try {
      const response = await api.get(`/services/business/${businessId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching business services:", error);
      throw error;
    }
  },

  // Get business reviews
  getBusinessReviews: async (businessId: string) => {
    try {
      const response = await api.get(`/reviews/business/${businessId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching business reviews:", error);
      throw error;
    }
  },

  // Get similar businesses
  getSimilarBusinesses: async (businessId: string, category: string) => {
    try {
      // This is a placeholder - the actual endpoint needs to be implemented in the backend
      // For now, we'll simulate by searching for businesses in the same category
      const response = await api.get(
        `/search/business?query=${encodeURIComponent(category)}&limit=4`
      );

      // Filter out the current business
      const businesses = response.data.businesses || [];
      return businesses.filter((business) => business._id !== businessId);
    } catch (error) {
      console.error("Error fetching similar businesses:", error);
      throw error;
    }
  },

  // Submit a review for a business
  submitReview: async (
    businessId: string,
    rating: number,
    comment: string,
    customerId?: string
  ) => {
    try {
      const response = await api.post(`/reviews`, {
        businessId,
        rating,
        comment,
        customerId, // Include customerId if available
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  },
};
