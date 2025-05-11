import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Mock data for when the API endpoints are not available
const MOCK_NOTIFICATIONS = [
  {
    _id: "507f1f77bcf86cd799439011",
    userId: "",
    title: "Welcome to Khanut Business",
    message: "Thank you for joining Khanut. Start managing your business!",
    type: "info",
    read: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    link: "/business/dashboard",
  },
];

export interface BusinessNotification {
  _id: string;
  userId?: string;
  title?: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
  link?: string;
}

export const businessNotificationApi = {
  /**
   * Get all notifications for the business
   * @returns List of notifications
   */
  getBusinessNotifications: async (): Promise<BusinessNotification[]> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        console.warn("Authentication required to fetch business notifications");
        return [];
      }

      const response = await fetch(`${API_URL}/api/business/notifications`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If API returns 404 (endpoint not found) or 403 (forbidden), return empty array
        if (response.status === 404 || response.status === 403) {
          console.warn(
            `Business notifications API returned ${response.status}`
          );
          return [];
        }

        throw new Error(
          `Failed to fetch business notifications: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching business notifications:", error);
      return [];
    }
  },

  /**
   * Mark a notification as read
   * @param notificationId Notification ID
   * @returns Updated notification
   */
  markAsRead: async (notificationId: string): Promise<BusinessNotification> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        console.warn("Authentication required to update business notification");
        return {
          ...MOCK_NOTIFICATIONS[0],
          read: true,
        };
      }

      const response = await fetch(
        `${API_URL}/api/business/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // If API returns 404 (endpoint not found) or 403 (forbidden), use mock data
        if (response.status === 404 || response.status === 403) {
          console.warn(
            `Business notification mark as read API returned ${response.status}`
          );
          return {
            ...MOCK_NOTIFICATIONS[0],
            read: true,
          };
        }

        throw new Error(
          `Failed to mark business notification as read: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking business notification as read:", error);
      return {
        ...MOCK_NOTIFICATIONS[0],
        read: true,
      };
    }
  },

  /**
   * Mark all notifications as read
   * @returns Success message
   */
  markAllAsRead: async (): Promise<{ message: string }> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        console.warn(
          "Authentication required to mark all business notifications as read"
        );
        return { message: "All notifications marked as read" };
      }

      const response = await fetch(
        `${API_URL}/api/business/notifications/mark-all-read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // If API returns 404 (endpoint not found) or 403 (forbidden), return success anyway
        if (response.status === 404 || response.status === 403) {
          console.warn(
            `Business mark all as read API returned ${response.status}`
          );
          return { message: "All notifications marked as read" };
        }

        throw new Error(
          `Failed to mark all business notifications as read: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking all business notifications as read:", error);
      return { message: "All notifications marked as read" };
    }
  },

  /**
   * Get unread notification count
   * @returns Unread notification count
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        console.warn(
          "Authentication required to fetch business notification count"
        );
        return { count: 0 };
      }

      const response = await fetch(
        `${API_URL}/api/business/notifications/unread`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Always return 0 for any error
        console.warn(`Business unread count API returned ${response.status}`);
        return { count: 0 };
      }

      return await response.json();
    } catch (error) {
      console.error(
        "Error fetching business unread notification count:",
        error
      );
      return { count: 0 };
    }
  },
};
