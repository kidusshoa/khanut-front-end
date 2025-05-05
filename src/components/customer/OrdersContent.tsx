"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { OrderList } from "@/components/customer/OrderList";
import { orderApi } from "@/services/order";
import { toast } from "react-hot-toast";

interface OrdersContentProps {
  customerId: string;
}

export default function OrdersContent({ customerId }: OrdersContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("all");

  // Check if user is authorized to view this page
  useEffect(() => {
    if (session && session.user && session.user.id !== customerId) {
      toast.error("You don't have permission to view this page");
      router.push(`/customer/${session.user.id}/orders`);
    }
  }, [session, customerId, router]);

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">View and manage your orders</p>
        </div>

        <OrderList customerId={customerId} />
      </div>
    </CustomerDashboardLayout>
  );
}
