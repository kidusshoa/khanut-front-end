import api from "./api";
import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface CustomerProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  location?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const userService = {
  async getCustomerProfile(): Promise<CustomerProfile> {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required to fetch profile");
      }

      const response = await fetch(`${API_URL}/api/customer/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      throw error;
    }
  },

  async updateCustomerProfile(data: ProfileUpdateData) {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required to update profile");
      }

      const response = await fetch(`${API_URL}/api/customer/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating customer profile:", error);
      throw error;
    }
  },

  async updateProfilePicture(formData: FormData) {
    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error("Authentication required to update profile picture");
      }

      const response = await fetch(`${API_URL}/api/customer/profile/picture`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type here, the browser will set it with the boundary parameter
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update profile picture"
        );
      }

      return await response.json();
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
