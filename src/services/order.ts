import axios from "axios";
import { OrderInput } from "@/lib/validations/service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const orderApi = {
  // Get all orders for a business
  getBusinessOrders: async (businessId: string, status?: string) => {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append("status", status);
    
    const response = await axios.get(
      `${API_URL}/orders/business/${businessId}?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get all orders for a customer
  getCustomerOrders: async (customerId: string, status?: string) => {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append("status", status);
    
    const response = await axios.get(
      `${API_URL}/orders/customer/${customerId}?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId: string) => {
    const response = await axios.get(`${API_URL}/orders/${orderId}`);
    return response.data;
  },

  // Create a new order
  createOrder: async (orderData: OrderInput) => {
    const response = await axios.post(`${API_URL}/orders`, orderData);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await axios.patch(`${API_URL}/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Update shipping information
  updateShippingInfo: async (orderId: string, shippingData: { trackingNumber?: string, shippingAddress?: any }) => {
    const response = await axios.patch(`${API_URL}/orders/${orderId}/shipping`, shippingData);
    return response.data;
  },
};
