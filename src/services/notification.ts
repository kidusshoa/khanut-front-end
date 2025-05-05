import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export const notificationApi = {
  /**
   * Get all notifications for a user
   * @param userId User ID
   * @param unreadOnly Get only unread notifications
   * @returns List of notifications
   */
  getUserNotifications: async (
    userId: string,
    unreadOnly: boolean = false
  ): Promise<Notification[]> => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("Authentication required to fetch notifications");
      }
      
      const url = `${API_URL}/api/notifications/user/${userId}${unreadOnly ? '?unreadOnly=true' : ''}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch notifications");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },
  
  /**
   * Mark a notification as read
   * @param notificationId Notification ID
   * @returns Updated notification
   */
  markAsRead: async (notificationId: string): Promise<Notification> => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("Authentication required to update notification");
      }
      
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to mark notification as read");
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },
  
  /**
   * Mark all notifications as read for a user
   * @param userId User ID
   * @returns Success message
   */
  markAllAsRead: async (userId: string): Promise<{ message: string }> => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("Authentication required to update notifications");
      }
      
      const response = await fetch(`${API_URL}/api/notifications/user/${userId}/read-all`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to mark all notifications as read");
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },
  
  /**
   * Delete a notification
   * @param notificationId Notification ID
   * @returns Success message
   */
  deleteNotification: async (notificationId: string): Promise<{ message: string }> => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("Authentication required to delete notification");
      }
      
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete notification");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },
  
  /**
   * Get unread notification count for a user
   * @param userId User ID
   * @returns Unread notification count
   */
  getUnreadCount: async (userId: string): Promise<{ count: number }> => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("Authentication required to fetch notification count");
      }
      
      const response = await fetch(`${API_URL}/api/notifications/user/${userId}/unread-count`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch unread notification count");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      throw error;
    }
  },
};
