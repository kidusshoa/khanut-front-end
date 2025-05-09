import { OrderInput } from "@/lib/validations/service";
import api from "./api";
import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface OrderItem {
  serviceId: string;
  quantity: number;
  price: number;
  serviceName?: string;
  serviceDescription?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface PaymentDetails {
  transactionRef?: string;
  paymentMethod: string;
  paymentStatus: "pending" | "completed" | "failed" | "cancelled";
  paymentDate?: string;
  verified?: boolean;
  verificationDate?: string;
}

export interface Order {
  _id: string;
  customerId: string | { _id: string; name: string; email: string };
  businessId: string | { _id: string; name: string };
  items: OrderItem[];
  totalAmount: number;
  status:
    | "pending_payment"
    | "payment_received"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentMethod: string;
  paymentDetails?: PaymentDetails;
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  status?:
    | "pending_payment"
    | "payment_received"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  startDate?: string;
  endDate?: string;
}

export const orderApi = {
  // Get all orders for a business with pagination
  getBusinessOrders: async (
    businessId: string,
    params: PaginationParams = {}
  ): Promise<Order[]> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required to fetch business orders");
      }

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

      let url = `${API_URL}/api/orders/business/${businessId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (search) url += `&search=${search}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch business orders");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching business orders:", error);
      throw error;
    }
  },

  // Get all orders for a customer with pagination
  getCustomerOrders: async (
    customerId: string,
    params: PaginationParams = {}
  ): Promise<Order[]> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required to fetch customer orders");
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

      let url = `${API_URL}/api/orders/customer/${customerId}?page=${page}&limit=${limit}`;

      if (sort) url += `&sort=${sort}`;
      if (order) url += `&order=${order}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch customer orders");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<Order> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required to fetch order details");
      }

      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch order details");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  // Create a new order
  createOrder: async (orderData: OrderInput): Promise<Order> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required to create an order");
      }

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (
    orderId: string,
    status: string
  ): Promise<Order> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required to update order status");
      }

      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  // Update shipping information
  updateShippingInfo: async (
    orderId: string,
    shippingData: { trackingNumber?: string; shippingAddress?: ShippingAddress }
  ): Promise<Order> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication required to update shipping information"
        );
      }

      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/shipping`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(shippingData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update shipping information"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating shipping information:", error);
      throw error;
    }
  },

  // Cancel an order
  cancelOrder: async (orderId: string, reason?: string): Promise<Order> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required to cancel an order");
      }

      const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel order");
      }

      return await response.json();
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  },

  // Get order tracking information
  getOrderTracking: async (orderId: string): Promise<any> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required to get tracking information");
      }

      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/tracking`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to get tracking information"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting tracking information:", error);
      throw error;
    }
  },
};
