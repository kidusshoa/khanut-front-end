import { ServiceInput } from "@/lib/validations/service";
import api from "./api";
import { getAuthToken } from "@/lib/auth-utils";
import { handleApiError } from "@/lib/api-utils";

interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  serviceType?: "appointment" | "product" | "in_person";
}

export const serviceApi = {
  // Get all services with pagination
  getAllServices: async (params: PaginationParams = {}) => {
    try {
      const { page = 1, limit = 10, sort, order, search, serviceType } = params;

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      if (sort) queryParams.append("sort", sort);
      if (order) queryParams.append("order", order);
      if (search) queryParams.append("search", search);
      if (serviceType) queryParams.append("serviceType", serviceType);

      // Try the businesses/services endpoint first
      try {
        const response = await api.get(
          `/businesses/services?${queryParams.toString()}`
        );
        return response.data;
      } catch (businessEndpointError) {
        console.warn(
          "Business services endpoint failed, trying services endpoint:",
          businessEndpointError
        );

        // Fallback to the /services endpoint
        const response = await api.get(`/services?${queryParams.toString()}`);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching all services:", error);
      throw error;
    }
  },

  // Get services for a specific business with pagination
  getBusinessServices: async (
    businessId: string,
    params: PaginationParams = {}
  ) => {
    try {
      const { page = 1, limit = 10, sort, order, search, serviceType } = params;

      // Check if we have a stored correct business ID
      let correctBusinessId = businessId;
      if (typeof window !== "undefined") {
        const storedBusinessId = localStorage.getItem("correctBusinessId");
        if (storedBusinessId) {
          console.log(
            "Using stored correct business ID for fetching services:",
            storedBusinessId
          );
          correctBusinessId = storedBusinessId;
        }
      }

      console.log(
        "Fetching services for business ID:",
        correctBusinessId,
        "Original business ID:",
        businessId
      );

      // First try using the fetch API directly to our Next.js API route
      try {
        // Use the correct path format for the API route
        let url = `/api/business/${correctBusinessId}/services?page=${page}&limit=${limit}`;

        if (sort) url += `&sort=${sort}`;
        if (order) url += `&order=${order}`;
        if (search) url += `&search=${search}`;
        if (serviceType) url += `&serviceType=${serviceType}`;

        console.log("Fetching services from URL:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error(
            "Failed to fetch business services:",
            response.status,
            response.statusText
          );
          throw new Error(
            `Failed to fetch business services: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Services data received:", data);

        // Check if data is an array
        if (Array.isArray(data)) {
          return data;
        } else if (
          data &&
          typeof data === "object" &&
          Array.isArray(data.services)
        ) {
          // Some APIs might return { services: [...] }
          return data.services;
        } else {
          console.warn("Unexpected data format received:", data);
          return [];
        }
      } catch (fetchError) {
        console.warn("Fetch API failed, falling back to axios:", fetchError);

        // Fallback to axios if fetch fails
        // Try multiple endpoints to ensure we get the data
        try {
          // First try the services/business endpoint
          let url = `/services/business/${correctBusinessId}?page=${page}&limit=${limit}`;

          if (sort) url += `&sort=${sort}`;
          if (order) url += `&order=${order}`;
          if (search) url += `&search=${search}`;
          if (serviceType) url += `&serviceType=${serviceType}`;

          console.log("Trying first axios endpoint:", url);
          const response = await api.get(url);
          console.log("First axios endpoint succeeded:", response.data);

          // Check if data is an array
          const data = response.data;
          if (Array.isArray(data)) {
            return data;
          } else if (
            data &&
            typeof data === "object" &&
            Array.isArray(data.services)
          ) {
            // Some APIs might return { services: [...] }
            return data.services;
          } else {
            console.warn("Unexpected data format received from axios:", data);
            return [];
          }
        } catch (firstAxiosError) {
          console.warn(
            "First axios endpoint failed, trying alternative:",
            firstAxiosError
          );

          // Try alternative endpoint
          let altUrl = `/businesses/${correctBusinessId}/services?page=${page}&limit=${limit}`;

          if (sort) altUrl += `&sort=${sort}`;
          if (order) altUrl += `&order=${order}`;
          if (search) altUrl += `&search=${search}`;
          if (serviceType) altUrl += `&serviceType=${serviceType}`;

          console.log("Trying alternative axios endpoint:", altUrl);
          const altResponse = await api.get(altUrl);
          console.log(
            "Alternative axios endpoint succeeded:",
            altResponse.data
          );

          // Check if data is an array
          const data = altResponse.data;
          if (Array.isArray(data)) {
            return data;
          } else if (
            data &&
            typeof data === "object" &&
            Array.isArray(data.services)
          ) {
            // Some APIs might return { services: [...] }
            return data.services;
          } else {
            console.warn(
              "Unexpected data format received from alternative axios endpoint:",
              data
            );
            return [];
          }
        }
      }
    } catch (error) {
      console.error("Error fetching business services:", error);
      throw error;
    }
  },

  // Get service by ID
  getServiceById: async (serviceId: string) => {
    try {
      const response = await api.get(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching service:", error);
      throw error;
    }
  },

  // Get services by type for a business with pagination
  getServicesByType: async (
    businessId: string,
    type: "appointment" | "product" | "in_person",
    params: PaginationParams = {}
  ) => {
    try {
      const { page = 1, limit = 10, sort, order, search } = params;
      const token = await getAuthToken();

      // Check if we have a stored correct business ID
      let correctBusinessId = businessId;
      if (typeof window !== "undefined") {
        const storedBusinessId = localStorage.getItem("correctBusinessId");
        if (storedBusinessId) {
          console.log(
            "Using stored correct business ID for fetching services by type:",
            storedBusinessId
          );
          correctBusinessId = storedBusinessId;
        }
      }

      console.log(
        "Fetching services by type for business ID:",
        correctBusinessId,
        "Original business ID:",
        businessId,
        "Type:",
        type
      );

      // Try multiple endpoints with proper error handling
      const endpoints = [
        // Primary endpoint
        {
          url: `/services/business/${correctBusinessId}/type/${type}?page=${page}&limit=${limit}${
            sort ? `&sort=${sort}` : ""
          }${order ? `&order=${order}` : ""}${
            search ? `&search=${search}` : ""
          }`,
          name: "Primary endpoint",
        },
        // Fallback endpoint 1
        {
          url: `/services/business/${correctBusinessId}?serviceType=${type}&page=${page}&limit=${limit}${
            sort ? `&sort=${sort}` : ""
          }${order ? `&order=${order}` : ""}${
            search ? `&search=${search}` : ""
          }`,
          name: "Fallback endpoint 1",
        },
        // Fallback endpoint 2
        {
          url: `/businesses/${correctBusinessId}/services?serviceType=${type}&page=${page}&limit=${limit}${
            sort ? `&sort=${sort}` : ""
          }${order ? `&order=${order}` : ""}${
            search ? `&search=${search}` : ""
          }`,
          name: "Fallback endpoint 2",
        },
      ];

      // Try each endpoint in sequence
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying ${endpoint.name}:`, endpoint.url);

          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };

          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }

          const response = await api.get(endpoint.url, { headers });
          console.log(`${endpoint.name} succeeded:`, response.data);

          if (Array.isArray(response.data)) {
            return response.data;
          } else if (
            response.data &&
            typeof response.data === "object" &&
            Array.isArray(response.data.services)
          ) {
            return response.data.services;
          } else {
            console.warn(
              `${endpoint.name} returned unexpected data format:`,
              response.data
            );
            // Continue to next endpoint
          }
        } catch (error) {
          handleApiError(error, `${endpoint.name} failed`);
          // Continue to next endpoint
        }
      }

      // Last resort: Get all services and filter by type
      try {
        console.log("Last resort: Getting all services and filtering by type");
        const response = await api.get(
          `/services/business/${correctBusinessId}`
        );
        const allServices = response.data;

        if (Array.isArray(allServices)) {
          const filteredServices = allServices.filter(
            (service) => service.serviceType === type
          );
          console.log(
            `Filtered ${filteredServices.length} services of type ${type}`
          );
          return filteredServices;
        }
      } catch (lastResortError) {
        handleApiError(lastResortError, "Last resort failed");
      }

      // If all attempts fail, return empty array
      console.warn("All endpoints failed, returning empty array");
      return [];
    } catch (error) {
      handleApiError(error, "Error fetching services by type");
      return [];
    }
  },

  // Create a new service
  createService: async (serviceData: FormData) => {
    try {
      // Log what we're sending
      console.log(
        "Creating service with data:",
        Object.fromEntries(serviceData.entries())
      );

      // Create a simplified version for the /businesses/services endpoint
      const simplifiedData = new FormData();
      simplifiedData.append("name", serviceData.get("name") as string);
      simplifiedData.append(
        "description",
        serviceData.get("description") as string
      );
      simplifiedData.append("price", serviceData.get("price") as string);

      // ALWAYS include serviceType for /businesses/services endpoint to ensure it's set correctly
      // This is required by the backend Service model
      const serviceType = serviceData.get("serviceType") as string;
      if (serviceType) {
        simplifiedData.append("serviceType", serviceType);
        console.log("Added serviceType to form data:", serviceType);
      } else {
        // Default to "appointment" if not specified to prevent errors
        simplifiedData.append("serviceType", "appointment");
        console.log("No serviceType found, defaulting to 'appointment'");
      }

      // Add images if any
      if (serviceData.has("images")) {
        simplifiedData.append("images", serviceData.get("images") as File);
      }

      // Try the /businesses/services endpoint first
      try {
        console.log(
          "Trying /businesses/services endpoint with simplified data"
        );
        console.log(
          "Simplified data:",
          Object.fromEntries(simplifiedData.entries())
        );

        // Log what we're sending to the API
        console.log(
          "Sending to /businesses/services with FormData:",
          Object.fromEntries(simplifiedData.entries())
        );

        // Check if we have any File objects in the FormData
        const hasFiles = Array.from(simplifiedData.entries()).some(
          ([_, value]) => value instanceof File
        );

        // For files, we need to let the browser set the Content-Type with boundary
        // Setting Content-Type manually can cause issues with file uploads
        const response = await api.post(
          `/businesses/services`,
          simplifiedData,
          {
            headers: {}, // Let browser set Content-Type with boundary for files
          }
        );
        console.log(
          "Success with /businesses/services endpoint:",
          response.data
        );
        return response.data;
      } catch (businessEndpointError: any) {
        console.error(
          "Error response from /businesses/services endpoint:",
          businessEndpointError.response?.data || businessEndpointError.message
        );

        // Fallback to the /services endpoint
        console.log("Trying /services endpoint as fallback");
        try {
          // Ensure serviceType is included in the FormData
          if (!serviceData.has("serviceType")) {
            console.log(
              "Adding missing serviceType to FormData for /services endpoint"
            );
            serviceData.append("serviceType", "in_person");
          }

          // Log what we're sending to the API
          console.log(
            "Sending to /services with FormData:",
            Object.fromEntries(serviceData.entries())
          );

          // Check if we have any File objects in the FormData
          const hasFiles = Array.from(serviceData.entries()).some(
            ([_, value]) => value instanceof File
          );

          const response = await api.post(`/services`, serviceData, {
            headers: {}, // Let browser set Content-Type with boundary for files
          });
          console.log("Success with /services endpoint:", response.data);
          return response.data;
        } catch (servicesEndpointError: any) {
          console.error(
            "Error response from /services endpoint:",
            servicesEndpointError.response?.data ||
              servicesEndpointError.message
          );
          throw servicesEndpointError;
        }
      }
    } catch (error) {
      console.error("Error creating service:", error);
      throw error;
    }
  },

  // Update a service
  updateService: async (serviceId: string, serviceData: FormData) => {
    try {
      // Try the services endpoint first
      try {
        const response = await api.put(`/services/${serviceId}`, serviceData, {
          headers: {}, // Let browser set Content-Type with boundary for files
        });
        return response.data;
      } catch (servicesEndpointError) {
        console.warn(
          "Services endpoint failed, trying businesses/services endpoint:",
          servicesEndpointError
        );

        // Fallback to the businesses/services endpoint
        const response = await api.put(
          `/businesses/services/${serviceId}`,
          serviceData,
          {
            headers: {}, // Let browser set Content-Type with boundary for files
          }
        );
        return response.data;
      }
    } catch (error) {
      console.error("Error updating service:", error);
      throw error;
    }
  },

  // Delete a service
  deleteService: async (serviceId: string) => {
    try {
      // Try the services endpoint first
      try {
        const response = await api.delete(`/services/${serviceId}`);
        return response.data;
      } catch (servicesEndpointError) {
        console.warn(
          "Services endpoint failed, trying businesses/services endpoint:",
          servicesEndpointError
        );

        // Fallback to the businesses/services endpoint
        const response = await api.delete(`/businesses/services/${serviceId}`);
        return response.data;
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      throw error;
    }
  },
};
