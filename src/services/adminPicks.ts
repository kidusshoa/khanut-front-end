import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CustomerPreference { 
  customerId: string;
  preferredCategories: string[];
  description: string;
  user?: {
    name: string;
    email: string;
  } | null;
}

export const adminPicksApi = {
  // Get all Admin Picks
  getAdminPicks: async (): Promise<CustomerPreference[]> => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/recommendations/staged`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get Admin Picks");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching Admin Picks:", error);
      throw error;
    }
  },

  // Get Admin Pick for a customer
  getAdminPick: async (customerId: string): Promise<CustomerPreference> => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/recommendations/staged/${customerId}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get Admin Pick");
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching Admin Pick for ${customerId}:`, error);
      throw error;
    }
  },

  // Update Admin Pick for a customer
  updateAdminPick: async (
    customerId: string,
    preferredCategories: string[],
    description: string
  ): Promise<{ message: string; preference: CustomerPreference }> => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/recommendations/staged/${customerId}`, 
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            preferredCategories,
            description,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update Admin Pick");
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating Admin Pick for ${customerId}:`, error);
      throw error;
    }
  },

  // Get available categories for Admin Picks
  getAdminPicksCategories: async (): Promise<string[]> => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/recommendations/staged/categories`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get Admin Pick categories");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching Admin Pick categories:", error);
      throw error;
    }
  },

  // Get available customers for Admin Picks
  getCustomersForAdminPicks: async (): Promise<any[]> => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/recommendations/staged/available-customers`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get available customers for Admin Picks");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching available customers for Admin Picks:", error);
      throw error;
    }
  },

  // Test Admin Picks for a customer
  testAdminPicks: async (customerId: string, limit: number = 5): Promise<any[]> => {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/api/admin/recommendations/staged/test/${customerId}?limit=${limit}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to test Admin Picks");
      }

      return await response.json();
    } catch (error) {
      console.error(`Error testing Admin Picks for ${customerId}:`, error);
      throw error;
    }
  },
};
