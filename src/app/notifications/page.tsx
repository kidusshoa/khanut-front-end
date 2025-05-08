"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Bell, 
  Check, 
  Loader2, 
  Calendar, 
  ShoppingBag, 
  DollarSign, 
  Star, 
  AlertTriangle,
  ArrowLeft,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import dayjs from "dayjs";
// Replaced date-fns with dayjs
import { userService } from "@/services/user";
import { toast } from "@/components/ui/use-toast";

interface Notification {
  _id: string;
  title?: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      const data = await userService.getCustomerNotifications({ limit: 50 });
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await userService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      await userService.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await userService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
      
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedNotification(null);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    if (notification.link) {
      router.push(notification.link);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDeleteDialogOpen(true);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "order":
        return <ShoppingBag className="h-5 w-5 text-orange-500" />;
      case "payment":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case "review":
        return <Star className="h-5 w-5 text-yellow-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.isRead;
    return notification.type === activeTab;
  });

  // Load notifications on mount
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    } else {
      router.push("/login");
    }
  }, [session, router]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full md:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="appointment">Appointments</TabsTrigger>
              <TabsTrigger value="order">Orders</TabsTrigger>
              <TabsTrigger value="warning">Alerts</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={isMarkingAll || notifications.every(n => n.isRead)}
            >
              {isMarkingAll ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Mark all as read
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={fetchNotifications}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "all" ? "All Notifications" : 
               activeTab === "unread" ? "Unread Notifications" :
               activeTab === "appointment" ? "Appointment Notifications" :
               activeTab === "order" ? "Order Notifications" :
               activeTab === "warning" ? "Alert Notifications" : 
               "Notifications"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-4 border-b last:border-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-1">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    className={`flex items-start gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${
                      !notification.isRead ? "bg-muted/30" : ""
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div 
                      className="flex-1 cursor-pointer" 
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {notification.title || getNotificationTitle(notification.type)}
                        </h3>
                        {!notification.isRead && (
                          <Badge variant="default" className="bg-orange-500 text-white">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {dayjs(new Date(notification.createdAt)).format("PPP p")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(notification)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {activeTab === "all" 
                    ? "You don't have any notifications yet." 
                    : activeTab === "unread" 
                      ? "You don't have any unread notifications." 
                      : `You don't have any ${activeTab} notifications.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedNotification && deleteNotification(selectedNotification._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Get notification title based on type
function getNotificationTitle(type: string): string {
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
}
