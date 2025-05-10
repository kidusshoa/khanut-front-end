"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { Bell } from "lucide-react";
import { notificationApi } from "@/services/notification";

// Use the same interface as in notification.ts but with isRead instead of read
export interface Notification {
  _id: string;
  title?: string;
  message: string;
  type: string;
  isRead: boolean; // This is 'read' in the backend and notification.ts
  createdAt: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  showNotification: (
    notification: Omit<Notification, "_id" | "isRead" | "createdAt">
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  pollingInterval?: number; // in milliseconds
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  pollingInterval = 30000, // Default to 30 seconds
}) => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  // We don't need to track lastFetchTime anymore

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!session?.user) return;

    try {
      // Get notifications
      const notificationsData = await notificationApi.getUserNotifications(
        session.user.id
      );
      // Convert from API format (read) to component format (isRead)
      const convertedNotifications = (notificationsData || []).map((n) => ({
        ...n,
        isRead: n.read,
        // Make sure all required fields are present
        type: n.type || "info",
        message: n.message || "",
        createdAt: n.createdAt || new Date().toISOString(),
      }));
      setNotifications(convertedNotifications);

      // Get unread count
      const countData = await notificationApi.getUnreadCount(session.user.id);
      setUnreadCount(countData.count || 0);

      // We don't need to track lastFetchTime anymore
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!session?.user) return;

    try {
      await notificationApi.markAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!session?.user || unreadCount === 0) return;

    try {
      await notificationApi.markAllAsRead(session.user.id);

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );

      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Show a notification toast
  const showNotification = (
    notification: Omit<Notification, "_id" | "isRead" | "createdAt">
  ) => {
    toast({
      title: notification.title || getNotificationTitle(notification.type),
      description: notification.message,
      action: notification.link ? (
        <a href={notification.link} className="text-blue-500 hover:underline">
          View
        </a>
      ) : undefined,
    });
  };

  // Get notification title based on type
  const getNotificationTitle = (type: string): string => {
    switch (type) {
      case "appointment":
        return "Appointment Update";
      case "order":
        return "Order Update";
      case "payment":
        return "Payment Update";
      case "review":
        return "New Review";
      case "warning":
        return "Important Notice";
      default:
        return "Notification";
    }
  };

  // Check for new notifications periodically
  useEffect(() => {
    if (!session?.user) return;

    // Initial fetch
    fetchNotifications();

    // Set up polling
    const intervalId = setInterval(async () => {
      // Check for new notifications
      try {
        const countData = await notificationApi.getUnreadCount(session.user.id);
        const newCount = countData.count || 0;

        // If there are new notifications, fetch them and show a toast
        if (newCount > unreadCount) {
          const notificationsData = await notificationApi.getUserNotifications(
            session.user.id
          );

          // Convert from API format (read) to component format (isRead)
          const convertedNotifications = (notificationsData || []).map((n) => ({
            ...n,
            isRead: n.read,
            // Make sure all required fields are present
            type: n.type || "info",
            message: n.message || "",
            createdAt: n.createdAt || new Date().toISOString(),
          }));

          setNotifications(convertedNotifications);
          setUnreadCount(newCount);

          // Show toast for the newest notification
          if (convertedNotifications.length > 0) {
            const newest = convertedNotifications[0];
            if (newest && !newest.isRead) {
              showNotification({
                title: getNotificationTitle(newest.type),
                message: newest.message,
                type: newest.type,
                link: newest.link,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error checking for new notifications:", error);
      }
    }, pollingInterval);

    return () => clearInterval(intervalId);
  }, [session, unreadCount, pollingInterval]);

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    showNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
