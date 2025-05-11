"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { BusinessNotificationDropdown } from "@/components/business/BusinessNotificationDropdown";

export function ConditionalNotificationDropdown() {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Get role from session
      const role = session.user.role as string;
      setUserRole(role);
      console.log("User role:", role);
    }
  }, [session, status]);

  // If session is loading, show a placeholder
  if (status === "loading" || !userRole) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  // If user is a business, use BusinessNotificationDropdown
  if (userRole === "business") {
    return <BusinessNotificationDropdown />;
  }

  // For customers and admins, use the regular NotificationDropdown
  return <NotificationDropdown />;
}
