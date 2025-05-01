import api from "./api";
import { Staff, StaffAvailability } from "@/lib/types/staff";

interface StaffInput {
  name: string;
  email: string;
  phone?: string;
  position: string;
  specialties?: string[];
  bio?: string;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
  };
}

export const staffApi = {
  // Get all staff for a business
  getBusinessStaff: async (businessId: string) => {
    try {
      const response = await api.get(`/staff/business/${businessId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching business staff:", error);
      throw error;
    }
  },

  // Get staff by ID
  getStaffById: async (staffId: string) => {
    try {
      const response = await api.get(`/staff/${staffId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching staff:", error);
      throw error;
    }
  },

  // Create a new staff member
  createStaff: async (businessId: string, staffData: StaffInput) => {
    try {
      const response = await api.post(`/staff/business/${businessId}`, staffData);
      return response.data;
    } catch (error) {
      console.error("Error creating staff:", error);
      throw error;
    }
  },

  // Update staff
  updateStaff: async (staffId: string, staffData: Partial<StaffInput>) => {
    try {
      const response = await api.put(`/staff/${staffId}`, staffData);
      return response.data;
    } catch (error) {
      console.error("Error updating staff:", error);
      throw error;
    }
  },

  // Delete staff
  deleteStaff: async (staffId: string) => {
    try {
      const response = await api.delete(`/staff/${staffId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting staff:", error);
      throw error;
    }
  },

  // Get staff availability for a specific date
  getStaffAvailability: async (staffId: string, date: string) => {
    try {
      const response = await api.get(`/staff/${staffId}/availability/${date}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching staff availability:", error);
      throw error;
    }
  },

  // Update staff availability
  updateStaffAvailability: async (
    staffId: string,
    availability: {
      days: string[];
      startTime: string;
      endTime: string;
      breakStart?: string;
      breakEnd?: string;
    }
  ) => {
    try {
      const response = await api.put(`/staff/${staffId}/availability`, availability);
      return response.data;
    } catch (error) {
      console.error("Error updating staff availability:", error);
      throw error;
    }
  },

  // Set staff unavailable dates (vacation, sick leave, etc.)
  setStaffUnavailableDates: async (
    staffId: string,
    dates: {
      startDate: string;
      endDate: string;
      reason?: string;
    }
  ) => {
    try {
      const response = await api.post(`/staff/${staffId}/unavailable`, dates);
      return response.data;
    } catch (error) {
      console.error("Error setting staff unavailable dates:", error);
      throw error;
    }
  },

  // Get staff assignments (appointments assigned to staff)
  getStaffAssignments: async (staffId: string, params: { startDate?: string; endDate?: string } = {}) => {
    try {
      let url = `/staff/${staffId}/assignments`;
      
      if (params.startDate) url += `?startDate=${params.startDate}`;
      if (params.endDate) url += `${params.startDate ? '&' : '?'}endDate=${params.endDate}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching staff assignments:", error);
      throw error;
    }
  },

  // Assign staff to appointment
  assignStaffToAppointment: async (appointmentId: string, staffId: string) => {
    try {
      const response = await api.post(`/appointments/${appointmentId}/assign`, { staffId });
      return response.data;
    } catch (error) {
      console.error("Error assigning staff to appointment:", error);
      throw error;
    }
  },

  // Update staff assignment status
  updateStaffAssignmentStatus: async (
    appointmentId: string,
    status: "confirmed" | "declined" | "completed"
  ) => {
    try {
      const response = await api.patch(`/appointments/${appointmentId}/assignment/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating staff assignment status:", error);
      throw error;
    }
  },
};
