import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Initialize payment for an order
 */
export const initializeOrderPayment = async (orderId: string) => {
  const token = await getAuthToken();

  const response = await fetch(
    `${API_URL}/api/payments/order/${orderId}/initialize`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to initialize payment");
  }

  return response.json();
};

/**
 * Initialize payment for an appointment
 */
export const initializeAppointmentPayment = async (appointmentId: string) => {
  const token = await getAuthToken();

  const response = await fetch(
    `${API_URL}/api/payments/appointment/${appointmentId}/initialize`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to initialize payment");
  }

  return response.json();
};

/**
 * Verify payment status
 */
export const verifyPayment = async (transactionRef: string) => {
  const response = await fetch(
    `${API_URL}/api/payments/verify/${transactionRef}`
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to verify payment");
  }

  return response.json();
};

/**
 * Get payment status for an order
 */
export const getOrderPaymentStatus = async (orderId: string) => {
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
};

/**
 * Get customer payment history
 */
export const getCustomerPayments = async (customerId: string) => {
  const token = await getAuthToken();

  const response = await fetch(
    `${API_URL}/api/payments/customer/${customerId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to get payment history");
  }

  return response.json();
};
