"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderDetail } from "@/components/customer/OrderDetail";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { orderApi } from "@/services/order";
import { toast } from "react-hot-toast";

export default function OrderDetailPage() {
  const router = useRouter();
  const { customerId, orderId } = useParams<{
    customerId: string;
    orderId: string;
  }>();
  const { data: session, status } = useSession();

  // Check if user is authorized to view this page
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id !== customerId) {
      toast.error("You don't have permission to view this page");
      router.push(`/customer/${session.user.id}/orders`);
    }
  }, [session, status, customerId, router]);

  // Fetch order details
  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: !!orderId && status === "authenticated",
  });

  const handleOrderUpdate = () => {
    refetch();
  };

  if (status === "loading" || isLoading) {
    return (
      <CustomerDashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CustomerDashboardLayout>
    );
  }

  if (isError) {
    return (
      <CustomerDashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/customer/${customerId}/orders`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
          </div>

          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p>Failed to load order details. Please try again later.</p>
          </div>

          <Button
            onClick={() => refetch()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Retry
          </Button>
        </div>
      </CustomerDashboardLayout>
    );
  }

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/customer/${customerId}/orders`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
        </div>

        {order && (
          <OrderDetail
            order={order}
            customerId={customerId}
            onOrderUpdate={handleOrderUpdate}
          />
        )}
      </div>
    </CustomerDashboardLayout>
  );
}
