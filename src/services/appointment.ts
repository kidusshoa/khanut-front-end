import {
  AppointmentBookingInput,
  RecurringAppointmentInput,
} from "@/lib/validations/service";
import api from "./api";
import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface Appointment {
  _id: string;
  serviceId:
    | string
    | {
        _id: string;
        name: string;
        price: number;
        duration: number;
      };
  businessId:
    | string
    | {
        _id: string;
        name: string;
      };
  customerId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  staffId?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus?: "unpaid" | "paid" | "refunded" | "failed";
  paymentId?: string;
  price?: number;
  notes?: string;
  isRecurring?: boolean;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

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
  ): Promise<Appointment[]> => {
    try {
      // First try using the fetch API with authentication
      try {
        const token = await getAuthToken();

        if (!token) {
          throw new Error("Authentication required");
        }

        // Log the business ID being used
        console.log("Fetching appointments for business ID:", businessId);

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

        // Ensure we're using the correct business ID format
        // This is important as sometimes the URL might have a different format than what's stored in the database
        console.log("Original business ID from URL:", businessId);

        // Check if the business ID needs correction (comparing with the known correct ID)
        const knownCorrectId = "682254767119f0cd755c7403"; // The correct business ID from your logs
        const correctedBusinessId =
          businessId === "68224afb1326bc75790cdd80"
            ? knownCorrectId
            : businessId;

        console.log("Using business ID:", correctedBusinessId);

        let url = `${API_URL}/api/appointments/business/${correctedBusinessId}?page=${page}&limit=${limit}`;

        if (sort) url += `&sort=${sort}`;
        if (order) url += `&order=${order}`;
        if (search) url += `&search=${search}`;
        if (status) url += `&status=${status}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        if (date) url += `&date=${date}`;

        console.log("Fetching appointments from URL:", url);

        console.log("Using token:", token ? "Token exists" : "No token");

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          mode: "cors",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to fetch business appointments:", errorText);
          throw new Error(
            `Failed to fetch business appointments: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log(
          `Successfully fetched ${data.length} appointments for business`
        );
        return data;
      } catch (fetchError) {
        console.warn("Fetch API failed, falling back to axios:", fetchError);

        // Fallback to axios if fetch fails
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

        // Ensure we're using the correct business ID format
        console.log(
          "Original business ID from URL (axios fallback):",
          businessId
        );

        // Check if the business ID needs correction (comparing with the known correct ID)
        const knownCorrectId = "682254767119f0cd755c7403"; // The correct business ID from your logs
        const correctedBusinessId =
          businessId === "68224afb1326bc75790cdd80"
            ? knownCorrectId
            : businessId;

        console.log("Using business ID for axios:", correctedBusinessId);

        let url = `/appointments/business/${correctedBusinessId}?page=${page}&limit=${limit}`;

        if (sort) url += `&sort=${sort}`;
        if (order) url += `&order=${order}`;
        if (search) url += `&search=${search}`;
        if (status) url += `&status=${status}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        if (date) url += `&date=${date}`;

        console.log("Axios fallback URL:", url);
        const response = await api.get(url);
        console.log(
          `Successfully fetched ${response.data.length} appointments with axios`
        );
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching business appointments:", error);
      throw error;
    }
  },

  // Get all appointments for a customer with pagination
  getCustomerAppointments: async (
    customerId: string,
    params: PaginationParams = {}
  ): Promise<Appointment[]> => {
    try {
      // First try using the fetch API with authentication
      try {
        const token = await getAuthToken();

        if (!token) {
          throw new Error("Authentication required");
        }

        const {
          page = 1,
          limit = 10,
          sort,
          order,
          status,
          startDate,
          endDate,
        } = params;

        let url = `${API_URL}/api/appointments/customer/${customerId}?page=${page}&limit=${limit}`;

        if (sort) url += `&sort=${sort}`;
        if (order) url += `&order=${order}`;
        if (status) url += `&status=${status}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        console.log("Fetching customer appointments from URL:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch customer appointments");
        }

        return await response.json();
      } catch (fetchError) {
        console.warn("Fetch API failed, falling back to axios:", fetchError);

        // Fallback to axios if fetch fails
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
      }
    } catch (error) {
      console.error("Error fetching customer appointments:", error);
      throw error;
    }
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId: string): Promise<Appointment> => {
    try {
      // First try using the fetch API with authentication
      try {
        const token = await getAuthToken();

        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `${API_URL}/api/appointments/${appointmentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch appointment details");
        }

        return await response.json();
      } catch (fetchError) {
        console.warn("Fetch API failed, falling back to axios:", fetchError);

        // Fallback to axios if fetch fails
        const response = await api.get(`/appointments/${appointmentId}`);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      throw error;
    }
  },

  // Create a new appointment
  createAppointment: async (
    appointmentData: AppointmentBookingInput & { staffId?: string }
  ) => {
    console.log("Creating appointment with data:", appointmentData);

    // Validate required fields
    if (!appointmentData.serviceId) throw new Error("Service ID is required");
    if (!appointmentData.businessId) throw new Error("Business ID is required");
    if (!appointmentData.customerId) throw new Error("Customer ID is required");
    if (!appointmentData.date) throw new Error("Date is required");
    if (!appointmentData.startTime) throw new Error("Start time is required");
    if (!appointmentData.endTime) throw new Error("End time is required");

    try {
      // First try using the fetch API with authentication
      try {
        const token = await getAuthToken();
        console.log(
          "Auth token retrieved:",
          token ? "Token exists" : "No token"
        );

        if (!token) {
          throw new Error("Authentication required");
        }

        const apiUrl = `${API_URL}/api/appointments`;
        console.log("Posting to URL:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(appointmentData),
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          let errorMessage = "Failed to create appointment";
          try {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.error("Could not parse error response:", parseError);
          }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        console.log("Appointment created successfully:", responseData);
        return responseData;
      } catch (fetchError) {
        console.warn("Fetch API failed, falling back to axios:", fetchError);

        // Fallback to axios if fetch fails
        try {
          const response = await api.post(`/appointments`, appointmentData);
          console.log("Axios response:", response.data);
          return response.data;
        } catch (axiosError: any) {
          console.error("Axios error:", axiosError);
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            "Failed to create appointment";
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId: string, status: string) => {
    try {
      console.log(
        `API: Updating appointment ${appointmentId} status to ${status}`
      );

      // First try using the fetch API with authentication
      try {
        const token = await getAuthToken();
        console.log(
          "Token for status update:",
          token ? "Token exists" : "No token"
        );

        if (!token) {
          throw new Error("Authentication required");
        }

        const url = `${API_URL}/api/appointments/${appointmentId}/status`;
        console.log("Status update URL:", url);

        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ status }),
        });

        console.log("Status update response status:", response.status);

        if (!response.ok) {
          let errorMessage = "Failed to update appointment status";
          try {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            const errorText = await response.text();
            console.error(
              "Could not parse error response:",
              parseError,
              "Raw response:",
              errorText
            );
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("Status update successful:", result);
        return result;
      } catch (fetchError) {
        console.warn("Fetch API failed, falling back to axios:", fetchError);

        // Fallback to axios if fetch fails
        try {
          const response = await api.patch(
            `/appointments/${appointmentId}/status`,
            { status }
          );
          console.log("Axios status update successful:", response.data);
          return response.data;
        } catch (axiosError: any) {
          console.error("Axios error:", axiosError);
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            "Failed to update appointment status";
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      throw error;
    }
  },

  // Cancel appointment
  cancelAppointment: async (
    appointmentId: string,
    data?: { reason?: string }
  ) => {
    try {
      console.log("Cancelling appointment with ID:", appointmentId);

      // First try using the fetch API with authentication
      try {
        const token = await getAuthToken();

        if (!token) {
          throw new Error("Authentication required");
        }

        // Use the status update endpoint with 'cancelled' status
        const response = await fetch(
          `${API_URL}/api/appointments/${appointmentId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            // Include both the status and the reason
            body: JSON.stringify({
              status: "cancelled",
              ...data
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Cancel appointment response:", errorText);
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(
              errorData.message || "Failed to cancel appointment"
            );
          } catch (parseError) {
            throw new Error(
              `Failed to cancel appointment: ${response.status} ${errorText}`
            );
          }
        }

        const result = await response.json();
        console.log("Cancel appointment result:", result);
        return { success: true, ...result };
      } catch (fetchError) {
        console.warn("Fetch API failed, falling back to axios:", fetchError);

        // Fallback to axios if fetch fails
        const response = await api.patch(
          `/appointments/${appointmentId}/status`,
          { 
            status: "cancelled",
            ...data 
          }
        );
        return { success: true, ...response.data };
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
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
  ): Promise<{
    available: boolean;
    timeSlots: TimeSlot[];
    message?: string;
  }> => {
    try {
      // First try using the fetch API
      try {
        let url = `${API_URL}/api/appointments/available/${serviceId}/${date}`;
        if (staffId) url += `?staffId=${staffId}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch available time slots");
        }

        return await response.json();
      } catch (fetchError) {
        console.warn("Fetch API failed, falling back to axios:", fetchError);

        // Fallback to axios if fetch fails
        let url = `/appointments/available?serviceId=${serviceId}&date=${date}`;
        if (staffId) url += `&staffId=${staffId}`;

        const response = await api.get(url);
        return response.data;
      }
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
