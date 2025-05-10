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

        // Handle the nested response format from the backend
        if (response.data && response.data.profile) {
          // Transform the nested structure to a flat structure
          return {
            _id: businessId,
            name: response.data.profile.name,
            email: response.data.profile.email,
            phone: response.data.profile.phone,
            city: response.data.profile.city,
            description: response.data.description,
            location: response.data.location,
            // Add other fields as needed
            services: response.data.services || [],
            reviews: response.data.reviews || [],
          };
        }

        return response.data;
      } catch (firstError) {
        console.log("First endpoint failed, trying alternative endpoint");
        // Try alternative endpoint
        const altResponse = await api.get(`/business/${businessId}`);
        console.log(
          "Business data received from alt endpoint:",
          altResponse.data
        );

        // Handle the nested response format from the backend
        if (altResponse.data && altResponse.data.profile) {
          // Transform the nested structure to a flat structure
          return {
            _id: businessId,
            name: altResponse.data.profile.name,
            email: altResponse.data.profile.email,
            phone: altResponse.data.profile.phone,
            city: altResponse.data.profile.city,
            description: altResponse.data.description,
            location: altResponse.data.location,
            // Add other fields as needed
            services: altResponse.data.services || [],
            reviews: altResponse.data.reviews || [],
          };
        }

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

      try {
        const response = await api.get(`/services/business/${businessId}`);
        console.log("Services data received:", response.data);
        return response.data;
      } catch (firstError) {
        console.log(
          "First services endpoint failed, trying alternative endpoint"
        );
        // Try alternative endpoint
        const altResponse = await api.get(`/services/${businessId}`);
        console.log(
          "Services data received from alt endpoint:",
          altResponse.data
        );
        return altResponse.data;
      }
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

      try {
        const response = await api.get(`/reviews/business/${businessId}`);
        console.log("Reviews data received:", response.data);
        return response.data;
      } catch (firstError) {
        console.log(
          "First reviews endpoint failed, trying alternative endpoint"
        );
        // Try alternative endpoint
        const altResponse = await api.get(`/reviews/${businessId}`);
        console.log(
          "Reviews data received from alt endpoint:",
          altResponse.data
        );
        return altResponse.data;
      }
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
