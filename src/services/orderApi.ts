// API functions for order-related operations

/**
 * Get orders for a specific business
 * @param businessId The ID of the business
 * @param options Optional parameters for filtering orders
 * @returns Promise with the orders data
 */
export const getBusinessOrders = async (
  businessId: string,
  options?: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (options?.status) queryParams.append("status", options.status);
    if (options?.search) queryParams.append("search", options.search);
    if (options?.startDate) queryParams.append("startDate", options.startDate);
    if (options?.endDate) queryParams.append("endDate", options.endDate);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/businesses/${businessId}/orders${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching business orders:", error);
    throw error;
  }
};

/**
 * Update the status of an order
 * @param orderId The ID of the order to update
 * @param status The new status for the order
 * @returns Promise with the updated order data
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

/**
 * Get details for a specific order
 * @param orderId The ID of the order
 * @returns Promise with the order data
 */
export const getOrderDetails = async (orderId: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch order details: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};

/**
 * Get orders for a specific customer
 * @param customerId The ID of the customer
 * @returns Promise with the orders data
 */
export const getCustomerOrders = async (customerId: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/customers/${customerId}/orders`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch customer orders: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    throw error;
  }
};
