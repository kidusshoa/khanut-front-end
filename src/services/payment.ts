import api from "./api";

interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  status?: "pending" | "successful" | "failed";
  startDate?: string;
  endDate?: string;
}

export const paymentApi = {
  // Initialize payment for an order
  initializeOrderPayment: async (orderId: string, paymentData: any = {}) => {
    try {
      const response = await api.post(
        `/payments/order/${orderId}/initialize`,
        paymentData
      );
      return response.data;
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
      const response = await api.post(
        `/payments/appointment/${appointmentId}/initialize`,
        paymentData
      );
      return response.data;
    } catch (error) {
      console.error("Error initializing appointment payment:", error);
      throw error;
    }
  },

  // Verify payment status
  verifyPayment: async (txRef: string) => {
    try {
      const response = await api.get(`/payments/verify/${txRef}`);
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  },

  // Get payment history for a customer with pagination
  getCustomerPayments: async (
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

      let url = `/payments/customer/${customerId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await api.get(url);
      return response.data;
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
      const {
        page = 1,
        limit = 10,
        sort,
        order,
        status,
        startDate,
        endDate,
      } = params;

      let url = `/payments/business/${businessId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching business payments:", error);
      throw error;
    }
  },
};
