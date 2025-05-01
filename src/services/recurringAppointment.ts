import api from "./api";
import { RecurringAppointment } from "@/lib/types/staff";

interface RecurringAppointmentInput {
  customerId: string;
  businessId: string;
  serviceId: string;
  staffId?: string;
  recurrencePattern: "daily" | "weekly" | "biweekly" | "monthly";
  startDate: string;
  endDate?: string;
  dayOfWeek?: number; // 0-6 for Sunday-Saturday
  dayOfMonth?: number; // 1-31
  startTime: string;
  endTime: string;
  notes?: string;
  occurrences?: number;
}

interface RecurringAppointmentPreviewInput {
  recurrencePattern: "daily" | "weekly" | "biweekly" | "monthly";
  startDate: string;
  endDate?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  occurrences?: number;
}

export const recurringAppointmentApi = {
  // Create a recurring appointment
  createRecurringAppointment: async (appointmentData: RecurringAppointmentInput) => {
    try {
      const response = await api.post("/recurring-appointments", appointmentData);
      return response.data;
    } catch (error) {
      console.error("Error creating recurring appointment:", error);
      throw error;
    }
  },

  // Get recurring appointments for a business
  getBusinessRecurringAppointments: async (
    businessId: string,
    params?: { status?: string; customerId?: string }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.customerId) queryParams.append("customerId", params.customerId);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await api.get(`/recurring-appointments/business/${businessId}${queryString}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching business recurring appointments:", error);
      throw error;
    }
  },

  // Get recurring appointments for a customer
  getCustomerRecurringAppointments: async (
    customerId: string,
    params?: { status?: string; businessId?: string }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.businessId) queryParams.append("businessId", params.businessId);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await api.get(`/recurring-appointments/customer/${customerId}${queryString}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer recurring appointments:", error);
      throw error;
    }
  },

  // Get a single recurring appointment
  getRecurringAppointmentById: async (recurringId: string) => {
    try {
      const response = await api.get(`/recurring-appointments/${recurringId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching recurring appointment:", error);
      throw error;
    }
  },

  // Update recurring appointment status
  updateRecurringAppointmentStatus: async (
    recurringId: string,
    status: "active" | "paused" | "completed" | "cancelled"
  ) => {
    try {
      const response = await api.patch(`/recurring-appointments/${recurringId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating recurring appointment status:", error);
      throw error;
    }
  },

  // Delete a recurring appointment
  deleteRecurringAppointment: async (recurringId: string, deleteFutureAppointments: boolean = false) => {
    try {
      const response = await api.delete(
        `/recurring-appointments/${recurringId}?deleteFutureAppointments=${deleteFutureAppointments}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting recurring appointment:", error);
      throw error;
    }
  },

  // Preview recurring appointment dates
  previewRecurringAppointmentDates: async (previewData: RecurringAppointmentPreviewInput) => {
    try {
      const response = await api.post("/recurring-appointments/preview", previewData);
      return response.data;
    } catch (error) {
      console.error("Error previewing recurring appointment dates:", error);
      throw error;
    }
  },
};
