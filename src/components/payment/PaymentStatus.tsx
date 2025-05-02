import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { paymentApi } from "@/services/payment";

interface PaymentStatusProps {
  orderId: string;
  showLabel?: boolean;
  className?: string;
}

export default function PaymentStatus({
  orderId,
  showLabel = true,
  className = "",
}: PaymentStatusProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["paymentStatus", orderId],
    queryFn: () => paymentApi.getOrderPaymentStatus(orderId),
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  if (isLoading) {
    return <Skeleton className="h-6 w-24" />;
  }

  if (error || !data) {
    return (
      <Badge variant="outline" className={className}>
        Unknown
      </Badge>
    );
  }

  const { paymentStatus } = data;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "destructive";
      case "cancelled":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Paid";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      case "cancelled":
        return "Cancelled";
      case "not_initiated":
        return "Not Paid";
      default:
        return "Unknown";
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {showLabel && (
        <span className="mr-2 text-sm text-muted-foreground">Payment:</span>
      )}
      <Badge
        variant={getStatusVariant(paymentStatus) as any}
        className="text-xs font-medium"
      >
        {getStatusLabel(paymentStatus)}
      </Badge>
    </div>
  );
}
