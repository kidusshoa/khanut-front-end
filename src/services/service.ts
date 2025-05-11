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

      let url = `/services?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (search) url += `&search=${search}`;
      if (serviceType) url += `&serviceType=${serviceType}`;

      const response = await api.get(url);
      return response.data;
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
        let url = `/api/business/${businessId}/services?page=${page}&limit=${limit}`;

        if (sort) url += `&sort=${sort}`;
        if (order) url += `&order=${order}`;
        if (search) url += `&search=${search}`;
        if (serviceType) url += `&serviceType=${serviceType}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch business services");
        }

        return await response.json();
      } catch (fetchError) {
        console.warn("Fetch API failed, falling back to axios:", fetchError);

        // Fallback to axios if fetch fails
        let url = `/services/business/${businessId}?page=${page}&limit=${limit}`;

        if (sort) url += `&sort=${sort}`;
        if (order) url += `&order=${order}`;
        if (search) url += `&search=${search}`;
        if (serviceType) url += `&serviceType=${serviceType}`;

        const response = await api.get(url);
        return response.data;
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

      let url = `/services/business/${businessId}/type/${type}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (search) url += `&search=${search}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching services by type:", error);
      throw error;
    }
  },

  // Create a new service
  createService: async (serviceData: FormData) => {
    try {
      const response = await api.post(`/services`, serviceData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating service:", error);
      throw error;
    }
  },

  // Update a service
  updateService: async (serviceId: string, serviceData: FormData) => {
    try {
      const response = await api.put(`/services/${serviceId}`, serviceData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating service:", error);
      throw error;
    }
  },

  // Delete a service
  deleteService: async (serviceId: string) => {
    try {
      const response = await api.delete(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting service:", error);
      throw error;
    }
  },
};
