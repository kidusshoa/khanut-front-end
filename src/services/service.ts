import axios from "axios";
import { ServiceInput } from "@/lib/validations/service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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

      let url = `${API_URL}/services?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (search) url += `&search=${search}`;
      if (serviceType) url += `&serviceType=${serviceType}`;

      const response = await axios.get(url);
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

      let url = `${API_URL}/services/business/${businessId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (search) url += `&search=${search}`;
      if (serviceType) url += `&serviceType=${serviceType}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching business services:", error);
      throw error;
    }
  },

  // Get service by ID
  getServiceById: async (serviceId: string) => {
    try {
      const response = await axios.get(`${API_URL}/services/${serviceId}`);
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

      let url = `${API_URL}/services/business/${businessId}/type/${type}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (search) url += `&search=${search}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching services by type:", error);
      throw error;
    }
  },

  // Create a new service
  createService: async (serviceData: FormData) => {
    try {
      const response = await axios.post(`${API_URL}/services`, serviceData, {
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
      const response = await axios.put(
        `${API_URL}/services/${serviceId}`,
        serviceData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating service:", error);
      throw error;
    }
  },

  // Delete a service
  deleteService: async (serviceId: string) => {
    try {
      const response = await axios.delete(`${API_URL}/services/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting service:", error);
      throw error;
    }
  },
};
