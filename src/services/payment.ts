import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const paymentApi = {
  // Initialize payment for an order
  initializeOrderPayment: async (orderId: string) => {
    const response = await axios.post(`${API_URL}/payments/order/${orderId}/initialize`);
    return response.data;
  },

  // Initialize payment for an appointment
  initializeAppointmentPayment: async (appointmentId: string) => {
    const response = await axios.post(`${API_URL}/payments/appointment/${appointmentId}/initialize`);
    return response.data;
  },

  // Verify payment status
  verifyPayment: async (txRef: string) => {
    const response = await axios.get(`${API_URL}/payments/verify/${txRef}`);
    return response.data;
  },

  // Get payment history for a customer
  getCustomerPayments: async (customerId: string) => {
    const response = await axios.get(`${API_URL}/payments/customer/${customerId}`);
    return response.data;
  },

  // Get payment history for a business
  getBusinessPayments: async (businessId: string) => {
    const response = await axios.get(`${API_URL}/payments/business/${businessId}`);
    return response.data;
  },
};
