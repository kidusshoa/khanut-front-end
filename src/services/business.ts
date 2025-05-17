// Business API service
import api from "./api";

export const businessService = {
  async register(formData: FormData) {
    console.log(
      "Submitting business registration with data:",
      Object.fromEntries(formData.entries())
    );

    try {
      // Make sure we're not overriding the Content-Type header
      // Let the browser set it automatically with the boundary
      // When sending FormData, don't set Content-Type at all
      // Let the browser set it automatically with the correct boundary
      const response = await api.post(`/businesses/register`, formData, {
        // Add timeout to prevent hanging requests
        timeout: 30000,
      });

      console.log("Business registration response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Business service error:", error);

      // Log more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);

        // Check for specific error messages
        if (
          error.response.data?.message?.includes(
            "already have a registered business"
          )
        ) {
          console.error("API Error Message:", error.response.data.message);
          console.error("API Error Response:", error.response);

          // Create a custom error with the specific message
          const customError = new Error(
            error.response.data.message ||
              "You already have a registered business"
          );
          customError.name = "BusinessAlreadyRegisteredError";
          throw customError;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }

      throw error;
    }
  },

  async checkRegistrationStatus() {
    const response = await api.get(`/businesses/status`);
    return response.data;
  },
};
