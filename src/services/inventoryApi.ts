import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Get inventory for a business
 */
export const getBusinessInventory = async (businessId: string, options?: { search?: string, lowStock?: boolean }) => {
  const token = await getAuthToken();
  
  let url = `${API_URL}/api/inventory/business/${businessId}`;
  const queryParams = [];
  
  if (options?.search) {
    queryParams.push(`search=${encodeURIComponent(options.search)}`);
  }
  
  if (options?.lowStock) {
    queryParams.push(`lowStock=true`);
  }
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch inventory');
  }
  
  return response.json();
};

/**
 * Update product stock
 */
export const updateProductStock = async (productId: string, stock: number, reason?: string) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/api/inventory/product/${productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ stock, reason })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update product stock');
  }
  
  return response.json();
};

/**
 * Batch update product stock
 */
export const batchUpdateStock = async (businessId: string, products: { productId: string, stock: number }[], reason?: string) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/api/inventory/business/${businessId}/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ products, reason })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update product stock');
  }
  
  return response.json();
};

/**
 * Get stock history for a product
 */
export const getStockHistory = async (productId: string) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/api/inventory/product/${productId}/history`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch stock history');
  }
  
  return response.json();
};
