import { OrderInput } from "@/lib/validations/service";
import api from "./api";

interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  startDate?: string;
  endDate?: string;
}

export const orderApi = {
  // Get all orders for a business with pagination
  getBusinessOrders: async (
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
      } = params;

      let url = `/orders/business/${businessId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (search) url += `&search=${search}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching business orders:", error);
      throw error;
    }
  },

  // Get all orders for a customer with pagination
  getCustomerOrders: async (
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

      let url = `/orders/customer/${customerId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (orderId: string) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  // Create a new order
  createOrder: async (orderData: OrderInput) => {
    try {
      const response = await api.post(`/orders`, orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  // Update shipping information
  updateShippingInfo: async (
    orderId: string,
    shippingData: { trackingNumber?: string; shippingAddress?: any }
  ) => {
    try {
      const response = await api.patch(
        `/orders/${orderId}/shipping`,
        shippingData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating shipping information:", error);
      throw error;
    }
  },
};
