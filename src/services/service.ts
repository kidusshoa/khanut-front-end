import axios from "axios";
import { ServiceInput } from "@/lib/validations/service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const serviceApi = {
  // Get all services
  getAllServices: async () => {
    const response = await axios.get(`${API_URL}/services`);
    return response.data;
  },

  // Get all services for a business
  getBusinessServices: async (businessId: string) => {
    const response = await axios.get(
      `${API_URL}/services/business/${businessId}`
    );
    return response.data;
  },

  // Get service by ID
  getServiceById: async (serviceId: string) => {
    const response = await axios.get(`${API_URL}/services/${serviceId}`);
    return response.data;
  },

  // Get services by type for a business
  getServicesByType: async (
    businessId: string,
    type: "appointment" | "product" | "in_person"
  ) => {
    const response = await axios.get(
      `${API_URL}/services/business/${businessId}/type/${type}`
    );
    return response.data;
  },

  // Create a new service
  createService: async (serviceData: FormData) => {
    const response = await axios.post(`${API_URL}/services`, serviceData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update a service
  updateService: async (serviceId: string, serviceData: FormData) => {
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
  },

  // Delete a service
  deleteService: async (serviceId: string) => {
    const response = await axios.delete(`${API_URL}/services/${serviceId}`);
    return response.data;
  },
};
