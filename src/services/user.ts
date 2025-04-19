import api from "./api";

export const userService = {
  async getCustomerProfile() {
    try {
      const response = await api.get(`/customer/profile`);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      throw error;
    }
  },

  async updateCustomerProfile(data: {
    name?: string;
    phone?: string;
    location?: string;
    currentPassword?: string;
    newPassword?: string;
  }) {
    try {
      const response = await api.put(`/customer/profile`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating customer profile:", error);
      throw error;
    }
  },

  async updateProfilePicture(formData: FormData) {
    try {
      const response = await api.put(`/customer/profile/picture`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating profile picture:", error);
      throw error;
    }
  },

  // Get customer favorites
  async getCustomerFavorites() {
    try {
      const response = await api.get("/customer/favorites");
      return response.data;
    } catch (error) {
      console.error("Error fetching customer favorites:", error);
      throw error;
    }
  },

  // Add business to favorites
  async addToFavorites(businessId: string) {
    try {
      const response = await api.post(`/customer/favorites/${businessId}`);
      return response.data;
    } catch (error) {
      console.error("Error adding business to favorites:", error);
      throw error;
    }
  },

  // Remove business from favorites
  async removeFromFavorites(businessId: string) {
    try {
      const response = await api.delete(`/customer/favorites/${businessId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing business from favorites:", error);
      throw error;
    }
  },

  // Get customer notifications
  async getCustomerNotifications(params = {}) {
    try {
      const response = await api.get("/notifications", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching customer notifications:", error);
      throw error;
    }
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // Get unread notification count
  async getUnreadNotificationCount() {
    try {
      const response = await api.get("/notifications/unread/count");
      return response.data;
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      throw error;
    }
  },
};
