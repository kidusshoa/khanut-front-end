// Business Detail API service
import api from "./api";
import { Business, Service, Review } from "@/types/business";

export interface BusinessDetailParams {
  includeServices?: boolean;
  includeReviews?: boolean;
}

export const businessDetailApi = {
  // Get business details by ID
  getBusinessById: async (
    businessId: string,
    params: BusinessDetailParams = {}
  ): Promise<Business> => {
    try {
      console.log(`Fetching business details for ID: ${businessId}`);

      try {
        const response = await api.get(`/businesses/${businessId}`);
        console.log("Business data received:", response.data);
        return response.data;
      } catch (firstError) {
        console.log("First endpoint failed, trying alternative endpoint");
        // Try alternative endpoint
        const altResponse = await api.get(`/business/${businessId}`);
        console.log(
          "Business data received from alt endpoint:",
          altResponse.data
        );
        return altResponse.data;
      }
    } catch (error) {
      console.error("Error fetching business details:", error);
      // Return a default object instead of throwing to prevent UI errors
      return {
        _id: businessId,
        name: "Business Details",
      };
    }
  },

  // Get business services
  getBusinessServices: async (businessId: string): Promise<Service[]> => {
    try {
      console.log(`Fetching services for business ID: ${businessId}`);

      const response = await api.get(`/services/business/${businessId}`);
      console.log("Services data received:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching business services:", error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  // Get business reviews
  getBusinessReviews: async (businessId: string): Promise<Review[]> => {
    try {
      console.log(`Fetching reviews for business ID: ${businessId}`);

      const response = await api.get(`/reviews/business/${businessId}`);
      console.log("Reviews data received:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching business reviews:", error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  // Get similar businesses
  getSimilarBusinesses: async (
    businessId: string,
    category: string
  ): Promise<Business[]> => {
    try {
      console.log(
        `Fetching similar businesses for ID: ${businessId}, category: ${category}`
      );

      // This is a placeholder - the actual endpoint needs to be implemented in the backend
      // For now, we'll simulate by searching for businesses in the same category
      const response = await api.get(
        `/search/business?query=${encodeURIComponent(category)}&limit=4`
      );

      console.log("Similar businesses data received:", response.data);

      // Filter out the current business
      const businesses = response.data.businesses || [];
      return businesses.filter((business: any) => business._id !== businessId);
    } catch (error) {
      console.error("Error fetching similar businesses:", error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  // Submit a review for a business
  submitReview: async (
    businessId: string,
    rating: number,
    comment: string,
    customerId?: string
  ): Promise<Review | { success: boolean; error?: string }> => {
    try {
      console.log(`Submitting review for business ID: ${businessId}`);
      console.log(
        `Review data: rating=${rating}, comment=${comment}, customerId=${customerId}`
      );

      const response = await api.post(`/reviews`, {
        businessId,
        rating,
        comment,
        customerId, // Include customerId if available
      });
      console.log("Review submission response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error submitting review:", error);
      // Return error object instead of throwing to prevent UI errors
      return {
        success: false,
        error: "Failed to submit review. Please try again.",
      };
    }
  },
};
