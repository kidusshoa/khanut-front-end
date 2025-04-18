import axios from "axios";
import { AppointmentBookingInput } from "@/lib/validations/service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
  startDate?: string;
  endDate?: string;
  date?: string;
}

export const appointmentApi = {
  // Get all appointments for a business with pagination
  getBusinessAppointments: async (
    businessId: string,
    params: PaginationParams = {}
  ) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort,
        order,
        search,
        status,
        startDate,
        endDate,
        date,
      } = params;

      let url = `${API_URL}/appointments/business/${businessId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (search) url += `&search=${search}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (date) url += `&date=${date}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching business appointments:", error);
      throw error;
    }
  },

  // Get all appointments for a customer with pagination
  getCustomerAppointments: async (
    customerId: string,
    params: PaginationParams = {}
  ) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort,
        order,
        status,
        startDate,
        endDate,
      } = params;

      let url = `${API_URL}/appointments/customer/${customerId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer appointments:", error);
      throw error;
    }
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/appointments/${appointmentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching appointment:", error);
      throw error;
    }
  },

  // Create a new appointment
  createAppointment: async (appointmentData: AppointmentBookingInput) => {
    try {
      const response = await axios.post(
        `${API_URL}/appointments`,
        appointmentData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId: string, status: string) => {
    try {
      const response = await axios.patch(
        `${API_URL}/appointments/${appointmentId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating appointment status:", error);
      throw error;
    }
  },

  // Update appointment details
  updateAppointment: async (
    appointmentId: string,
    appointmentData: Partial<AppointmentBookingInput>
  ) => {
    try {
      const response = await axios.put(
        `${API_URL}/appointments/${appointmentId}`,
        appointmentData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  },

  // Delete an appointment
  deleteAppointment: async (appointmentId: string) => {
    try {
      const response = await axios.delete(
        `${API_URL}/appointments/${appointmentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting appointment:", error);
      throw error;
    }
  },

  // Get available time slots for a service on a specific date
  getAvailableTimeSlots: async (serviceId: string, date: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/appointments/available/${serviceId}/${date}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      throw error;
    }
  },
};
