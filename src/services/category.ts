import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const categoryApi = {
  // Get all categories
  getAllCategories: async () => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (categoryId: string) => {
    const response = await axios.get(`${API_URL}/categories/${categoryId}`);
    return response.data;
  },

  // Get services by category
  getServicesByCategory: async (categoryId: string) => {
    const response = await axios.get(`${API_URL}/categories/${categoryId}/services`);
    return response.data;
  },

  // Create a new category (admin only)
  createCategory: async (categoryData: {
    name: string;
    description?: string;
    icon?: string;
  }) => {
    const response = await axios.post(`${API_URL}/categories`, categoryData);
    return response.data;
  },

  // Update a category (admin only)
  updateCategory: async (
    categoryId: string,
    categoryData: {
      name?: string;
      description?: string;
      icon?: string;
    }
  ) => {
    const response = await axios.put(`${API_URL}/categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Delete a category (admin only)
  deleteCategory: async (categoryId: string) => {
    const response = await axios.delete(`${API_URL}/categories/${categoryId}`);
    return response.data;
  },
};
