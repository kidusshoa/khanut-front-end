"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationApi, Notification } from "@/services/notification";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-hot-toast";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

export function AdminNotificationDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const notificationsData = await notificationApi.getUserNotifications("");
      setNotifications(notificationsData);
      
      // Get unread count
      const countData = await notificationApi.getUnreadCount("");
      setUnreadCount(countData.count || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setIsMarkingAll(true);
    try {
      await notificationApi.markAllAsRead("");
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "success":
        return "✅";
      case "info":
      default:
        return "ℹ️";
    }
  };

  // Format notification message to replace IDs with names
  const formatMessage = (message: string) => {
    // Replace business IDs with business names (if we have that info)
    // This is a simple example - in a real app, you might need to fetch this data
    return message
      .replace(/business\s+(\w+)/i, "business")
      .replace(/user\s+(\w+)/i, "user");
  };

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();

    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 text-white"
              variant="default"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="h-8 px-2"
              >
                {isMarkingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Mark all read
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNotifications}
              disabled={isLoading}
              className="h-8 px-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {isLoading ? "Loading notifications..." : "No notifications"}
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`p-3 cursor-pointer ${
                  !notification.read ? "bg-orange-50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-2 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {notification.title || "Notification"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatMessage(notification.message)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {dayjs(notification.createdAt).fromNow()}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            onClick={() => router.push("/admin/notifications")}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
