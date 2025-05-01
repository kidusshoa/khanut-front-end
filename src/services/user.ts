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
      const response = await api.get("/notifications/unread");
      return response.data;
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    try {
      const response = await api.patch("/notifications/mark-all-read");
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  // Get business updates
  async getBusinessUpdates() {
    try {
      const response = await api.get("/notifications/business-updates");
      return response.data;
    } catch (error) {
      console.error("Error fetching business updates:", error);
      throw error;
    }
  },

  // Update notification preferences
  async updateNotificationPreferences(preferences: { notify: boolean }) {
    try {
      const response = await api.put(
        "/customer/notification-preferences",
        preferences
      );
      return response.data;
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      throw error;
    }
  },
};
