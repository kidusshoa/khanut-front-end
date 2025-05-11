"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, Check, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { businessNotificationApi } from "@/services/businessNotification";
import { toast } from "react-hot-toast";

interface Notification {
  _id: string;
  title?: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export function BusinessNotificationDropdown() {
  const router = useRouter();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      // Check if the user is a business
      if (session?.user?.role !== "business") {
        console.warn("User is not a business owner");
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }

      const data = await businessNotificationApi.getBusinessNotifications();
      setNotifications(data || []);

      // Get unread count
      const countData = await businessNotificationApi.getUnreadCount();
      setUnreadCount(countData.count || 0);
    } catch (error) {
      console.error("Error fetching business notifications:", error);
      // Don't show error toast, just set empty data
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await businessNotificationApi.markAsRead(notificationId);

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      await businessNotificationApi.markAllAsRead();

      // Update local state
      setNotifications(
        notifications.map((notification) => ({ ...notification, read: true }))
      );

      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }

    if (notification.link) {
      router.push(notification.link);
    }

    setOpen(false);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = dayjs(dateString);
    const now = dayjs();

    if (now.diff(date, "day") < 1) {
      return date.fromNow();
    } else if (now.diff(date, "day") < 7) {
      return date.format("dddd [at] h:mm A");
    } else {
      return date.format("MMM D, YYYY [at] h:mm A");
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return (
          <div className="text-blue-500 bg-blue-100 p-2 rounded-full dark:bg-blue-900/20">
            🗓️
          </div>
        );
      case "order":
        return (
          <div className="text-green-500 bg-green-100 p-2 rounded-full dark:bg-green-900/20">
            📦
          </div>
        );
      case "payment":
        return (
          <div className="text-yellow-500 bg-yellow-100 p-2 rounded-full dark:bg-yellow-900/20">
            💰
          </div>
        );
      case "review":
        return (
          <div className="text-purple-500 bg-purple-100 p-2 rounded-full dark:bg-purple-900/20">
            ⭐
          </div>
        );
      case "warning":
        return (
          <div className="text-red-500 bg-red-100 p-2 rounded-full dark:bg-red-900/20">
            ⚠️
          </div>
        );
      default:
        return (
          <div className="text-gray-500 bg-gray-100 p-2 rounded-full dark:bg-gray-800">
            🔔
          </div>
        );
    }
  };

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (open && session?.user?.id) {
      fetchNotifications();
    }
  }, [open, session?.user?.id]);

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No notifications yet
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-1 p-1">
              {notifications.map((notification) => (
                <button
                  key={notification._id}
                  className={`w-full text-left p-3 rounded-md hover:bg-muted transition-colors ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <p
                        className={`text-sm ${
                          !notification.read ? "font-medium" : ""
                        }`}
                      >
                        {notification.title || "Notification"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-orange-600 mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
        <div className="p-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={fetchNotifications}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
