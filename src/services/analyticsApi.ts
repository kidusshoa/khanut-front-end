import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Get dashboard statistics for a business
 */
export const getDashboardStats = async (businessId: string) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/api/analytics/business/${businessId}/stats`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard statistics');
  }
  
  return response.json();
};

/**
 * Get revenue data for a business
 */
export const getRevenueData = async (businessId: string, period: 'week' | 'month' | 'year' = 'week') => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/api/analytics/business/${businessId}/revenue?period=${period}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch revenue data');
  }
  
  return response.json();
};

/**
 * Get service distribution data for a business
 */
export const getServiceDistribution = async (businessId: string) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/api/analytics/business/${businessId}/services`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch service distribution data');
  }
  
  return response.json();
};

/**
 * Get recent orders for a business
 */
export const getRecentOrders = async (businessId: string, limit: number = 5) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/api/analytics/business/${businessId}/recent-orders?limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch recent orders');
  }
  
  return response.json();
};

/**
 * Get upcoming appointments for a business
 */
export const getUpcomingAppointments = async (businessId: string, limit: number = 5) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/api/analytics/business/${businessId}/upcoming-appointments?limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch upcoming appointments');
  }
  
  return response.json();
};
