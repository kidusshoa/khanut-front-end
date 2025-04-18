import axios from "axios";
import { AppointmentBookingInput } from "@/lib/validations/service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const appointmentApi = {
  // Get all appointments for a business
  getBusinessAppointments: async (businessId: string, params?: { status?: string, date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.date) queryParams.append("date", params.date);
    
    const response = await axios.get(
      `${API_URL}/appointments/business/${businessId}?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get all appointments for a customer
  getCustomerAppointments: async (customerId: string, status?: string) => {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append("status", status);
    
    const response = await axios.get(
      `${API_URL}/appointments/customer/${customerId}?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId: string) => {
    const response = await axios.get(`${API_URL}/appointments/${appointmentId}`);
    return response.data;
  },

  // Create a new appointment
  createAppointment: async (appointmentData: AppointmentBookingInput) => {
    const response = await axios.post(`${API_URL}/appointments`, appointmentData);
    return response.data;
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId: string, status: string) => {
    const response = await axios.patch(`${API_URL}/appointments/${appointmentId}/status`, { status });
    return response.data;
  },

  // Update appointment details
  updateAppointment: async (appointmentId: string, appointmentData: Partial<AppointmentBookingInput>) => {
    const response = await axios.put(`${API_URL}/appointments/${appointmentId}`, appointmentData);
    return response.data;
  },

  // Delete appointment
  deleteAppointment: async (appointmentId: string) => {
    const response = await axios.delete(`${API_URL}/appointments/${appointmentId}`);
    return response.data;
  },

  // Get available time slots
  getAvailableTimeSlots: async (serviceId: string, date: string) => {
    const response = await axios.get(`${API_URL}/appointments/available/${serviceId}/${date}`);
    return response.data;
  },
};
