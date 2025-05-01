import {
  AppointmentBookingInput,
  RecurringAppointmentInput,
} from "@/lib/validations/service";
import api from "./api";
import { RecurringAppointment } from "@/lib/types/staff";

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

      let url = `/appointments/business/${businessId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (search) url += `&search=${search}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (date) url += `&date=${date}`;

      const response = await api.get(url);
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

      let url = `/appointments/customer/${customerId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer appointments:", error);
      throw error;
    }
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId: string) => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching appointment:", error);
      throw error;
    }
  },

  // Create a new appointment
  createAppointment: async (
    appointmentData: AppointmentBookingInput & { staffId?: string }
  ) => {
    try {
      const response = await api.post(`/appointments`, appointmentData);
      return response.data;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId: string, status: string) => {
    try {
      const response = await api.patch(
        `/appointments/${appointmentId}/status`,
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
      const response = await api.put(
        `/appointments/${appointmentId}`,
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
      const response = await api.delete(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting appointment:", error);
      throw error;
    }
  },

  // Get available time slots for a service on a specific date
  getAvailableTimeSlots: async (
    serviceId: string,
    date: string,
    staffId?: string
  ) => {
    try {
      let url = `/appointments/available?serviceId=${serviceId}&date=${date}`;
      if (staffId) url += `&staffId=${staffId}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      throw error;
    }
  },

  // Create a recurring appointment
  createRecurringAppointment: async (
    recurringData: RecurringAppointmentInput
  ) => {
    try {
      const response = await api.post("/appointments/recurring", recurringData);
      return response.data;
    } catch (error) {
      console.error("Error creating recurring appointment:", error);
      throw error;
    }
  },

  // Get recurring appointments for a customer
  getCustomerRecurringAppointments: async (customerId: string) => {
    try {
      const response = await api.get(
        `/appointments/recurring/customer/${customerId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching customer recurring appointments:", error);
      throw error;
    }
  },

  // Get recurring appointments for a business
  getBusinessRecurringAppointments: async (businessId: string) => {
    try {
      const response = await api.get(
        `/appointments/recurring/business/${businessId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching business recurring appointments:", error);
      throw error;
    }
  },

  // Update recurring appointment
  updateRecurringAppointment: async (
    recurringId: string,
    recurringData: Partial<RecurringAppointmentInput>
  ) => {
    try {
      const response = await api.put(
        `/appointments/recurring/${recurringId}`,
        recurringData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating recurring appointment:", error);
      throw error;
    }
  },

  // Cancel recurring appointment
  cancelRecurringAppointment: async (recurringId: string) => {
    try {
      const response = await api.patch(
        `/appointments/recurring/${recurringId}/cancel`
      );
      return response.data;
    } catch (error) {
      console.error("Error cancelling recurring appointment:", error);
      throw error;
    }
  },

  // Get staff for a specific appointment
  getAppointmentStaff: async (appointmentId: string) => {
    try {
      const response = await api.get(`/appointments/${appointmentId}/staff`);
      return response.data;
    } catch (error) {
      console.error("Error fetching appointment staff:", error);
      throw error;
    }
  },

  // Assign staff to appointment
  assignStaffToAppointment: async (
    appointmentId: string,
    staffId: string,
    notes?: string
  ) => {
    try {
      const response = await api.post(
        `/staff/appointment/${appointmentId}/assign`,
        {
          staffId,
          notes,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning staff to appointment:", error);
      throw error;
    }
  },
};
