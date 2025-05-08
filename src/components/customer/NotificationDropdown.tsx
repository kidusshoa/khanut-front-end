"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Bell, 
  Check, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Loader2
} from "lucide-react";
import dayjs from "dayjs";
// Replaced date-fns with dayjs
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Notification, notificationApi } from "@/services/notification";
import { toast } from "react-hot-toast";

export function NotificationDropdown() {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  // Fetch notifications
  const { 
    data: notifications = [], 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ["notifications", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      return notificationApi.getUserNotifications(session.user.id);
    },
    enabled: !!session?.user?.id,
  });
  
  // Fetch unread count
  const { 
    data: unreadData,
    refetch: refetchUnreadCount
  } = useQuery({
    queryKey: ["notificationsUnreadCount", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { count: 0 };
      return notificationApi.getUnreadCount(session.user.id);
    },
    enabled: !!session?.user?.id,
  });
  
  const unreadCount = unreadData?.count || 0;
  
  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (open && session?.user?.id) {
      refetch();
      refetchUnreadCount();
    }
  }, [open, session?.user?.id, refetch, refetchUnreadCount]);
  
  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await notificationApi.markAsRead(notification._id);
        
        // Update cache
        queryClient.setQueryData(
          ["notifications", session?.user?.id],
          (oldData: Notification[] | undefined) => {
            if (!oldData) return [];
            return oldData.map(n => 
              n._id === notification._id ? { ...n, read: true } : n
            );
          }
        );
        
        // Update unread count
        queryClient.setQueryData(
          ["notificationsUnreadCount", session?.user?.id],
          (oldData: { count: number } | undefined) => {
            if (!oldData) return { count: 0 };
            return { count: Math.max(0, oldData.count - 1) };
          }
        );
      }
      
      // Navigate to link if provided
      if (notification.link) {
        setOpen(false);
        router.push(notification.link);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };
  
  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id) return;
    
    try {
      await notificationApi.markAllAsRead(session.user.id);
      
      // Update cache
      queryClient.setQueryData(
        ["notifications", session?.user?.id],
        (oldData: Notification[] | undefined) => {
          if (!oldData) return [];
          return oldData.map(n => ({ ...n, read: true }));
        }
      );
      
      // Update unread count
      queryClient.setQueryData(
        ["notificationsUnreadCount", session?.user?.id],
        { count: 0 }
      );
      
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown time";
    }
  };
  
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
            <p className="text-sm text-muted-foreground">No notifications yet</p>
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
                      <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                        {notification.title}
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
      </PopoverContent>
    </Popover>
  );
}
