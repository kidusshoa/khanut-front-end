import { ServiceInput } from "@/lib/validations/service";
import api from "./api";

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

      // First try using the fetch API directly to our Next.js API route
      try {
        // Use the correct path format for the API route
        let url = `/api/business/${businessId}/services?page=${page}&limit=${limit}`;

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
        return data;
      } catch (fetchError) {
        console.warn("Fetch API failed, falling back to axios:", fetchError);

        // Fallback to axios if fetch fails
        // Try multiple endpoints to ensure we get the data
        try {
          // First try the services/business endpoint
          let url = `/services/business/${businessId}?page=${page}&limit=${limit}`;

          if (sort) url += `&sort=${sort}`;
          if (order) url += `&order=${order}`;
          if (search) url += `&search=${search}`;
          if (serviceType) url += `&serviceType=${serviceType}`;

          console.log("Trying first axios endpoint:", url);
          const response = await api.get(url);
          console.log("First axios endpoint succeeded:", response.data);
          return response.data;
        } catch (firstAxiosError) {
          console.warn(
            "First axios endpoint failed, trying alternative:",
            firstAxiosError
          );

          // Try alternative endpoint
          let altUrl = `/businesses/${businessId}/services?page=${page}&limit=${limit}`;

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
          return altResponse.data;
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

      // Try the primary endpoint first
      try {
        let url = `/services/business/${businessId}/type/${type}?page=${page}&limit=${limit}`;

        if (sort) url += `&sort=${sort}`;
        if (order) url += `&order=${order}`;
        if (search) url += `&search=${search}`;

        console.log("Trying primary endpoint for services by type:", url);
        const response = await api.get(url);
        console.log("Primary endpoint succeeded:", response.data);
        return response.data;
      } catch (primaryError) {
        console.warn("Primary endpoint failed, trying fallback:", primaryError);

        // Fallback: Get all services and filter by type
        try {
          // Use a direct API call as a fallback to avoid circular reference
          console.log("Trying to get all services and filter by type");
          const response = await api.get(`/services/business/${businessId}`);
          const allServices = response.data;

          if (Array.isArray(allServices)) {
            // Filter the services by type
            const filteredServices = allServices.filter(
              (service) => service.serviceType === type
            );
            console.log(
              `Filtered ${filteredServices.length} services of type ${type}`
            );
            return filteredServices;
          } else {
            console.warn(
              "getBusinessServices did not return an array:",
              allServices
            );
            return [];
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          throw fallbackError;
        }
      }
    } catch (error) {
      console.error("Error fetching services by type:", error);
      throw error;
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
      // Don't include serviceType for /businesses/services endpoint

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

        const response = await api.post(
          `/businesses/services`,
          simplifiedData,
          {
            headers: {
              // Important: Don't set Content-Type for FormData with files
              // Let the browser set it automatically with the correct boundary
            },
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
          const response = await api.post(`/services`, serviceData, {
            headers: {
              // Important: Don't set Content-Type for FormData with files
              // Let the browser set it automatically with the correct boundary
            },
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
          headers: {
            // Let the browser set the Content-Type with boundary
            "Content-Type": undefined,
          },
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
            headers: {
              // Let the browser set the Content-Type with boundary
              "Content-Type": undefined,
            },
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
