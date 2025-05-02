import api from "./api";
import { getAuthToken } from "@/lib/auth";

interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  status?: "pending" | "completed" | "failed" | "cancelled";
  startDate?: string;
  endDate?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const paymentApi = {
  // Initialize payment for an order
  initializeOrderPayment: async (orderId: string, paymentData: any = {}) => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/payments/order/${orderId}/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initialize payment");
      }

      return response.json();
    } catch (error) {
      console.error("Error initializing order payment:", error);
      throw error;
    }
  },

  // Initialize payment for an appointment
  initializeAppointmentPayment: async (
    appointmentId: string,
    paymentData: any = {}
  ) => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/payments/appointment/${appointmentId}/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initialize payment");
      }

      return response.json();
    } catch (error) {
      console.error("Error initializing appointment payment:", error);
      throw error;
    }
  },

  // Verify payment status
  verifyPayment: async (transactionRef: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/payments/verify/${transactionRef}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to verify payment");
      }

      return response.json();
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  },

  // Get payment status for an order
  getOrderPaymentStatus: async (orderId: string) => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/payments/order/${orderId}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get payment status");
      }

      return response.json();
    } catch (error) {
      console.error("Error getting order payment status:", error);
      throw error;
    }
  },

  // Get payment history for a customer with pagination
  getCustomerPayments: async (
    customerId: string,
    params: PaginationParams = {}
  ) => {
    try {
      const token = await getAuthToken();

      const {
        page = 1,
        limit = 10,
        sort,
        order,
        status,
        startDate,
        endDate,
      } = params;

      let url = `${API_URL}/api/payments/customer/${customerId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get customer payments");
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching customer payments:", error);
      throw error;
    }
  },

  // Get payment history for a business with pagination
  getBusinessPayments: async (
    businessId: string,
    params: PaginationParams = {}
  ) => {
    try {
      const token = await getAuthToken();

      const {
        page = 1,
        limit = 10,
        sort,
        order,
        status,
        startDate,
        endDate,
      } = params;

      let url = `${API_URL}/api/payments/business/${businessId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get business payments");
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching business payments:", error);
      throw error;
    }
  },
};
