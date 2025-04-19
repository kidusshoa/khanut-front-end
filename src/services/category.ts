import api from "./api";

export const categoryApi = {
  // Get all categories
  getAllCategories: async () => {
    const response = await api.get(`/categories`);
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (categoryId: string) => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  // Get services by category
  getServicesByCategory: async (categoryId: string) => {
    const response = await api.get(`/categories/${categoryId}/services`);
    return response.data;
  },

  // Create a new category (admin only)
  createCategory: async (categoryData: {
    name: string;
    description?: string;
    icon?: string;
  }) => {
    const response = await api.post(`/categories`, categoryData);
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
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Delete a category (admin only)
  deleteCategory: async (categoryId: string) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },
};
