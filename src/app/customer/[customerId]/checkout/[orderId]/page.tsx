'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomerDashboardLayout from '@/components/layout/CustomerDashboardLayout';
import CheckoutForm from '@/components/payment/CheckoutForm';
import { orderApi } from '@/services/order';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;
  const orderId = params.orderId as string;

  // Fetch order details
  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrderById(orderId),
  });

  if (isLoading) {
    return (
      <CustomerDashboardLayout customerId={customerId}>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Order Details</h2>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </CustomerDashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <CustomerDashboardLayout customerId={customerId}>
        <div className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Button onClick={() => router.push(`/customer/${customerId}/orders`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </CustomerDashboardLayout>
    );
  }

  // Check if order is already paid
  if (order.status !== 'pending_payment') {
    return (
      <CustomerDashboardLayout customerId={customerId}>
        <div className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order Already Processed</h2>
          <p className="text-muted-foreground mb-6">
            This order has already been paid for or is in a different state.
          </p>
          <Button onClick={() => router.push(`/customer/${customerId}/orders/${orderId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            View Order Details
          </Button>
        </div>
      </CustomerDashboardLayout>
    );
  }

  return (
    <CustomerDashboardLayout customerId={customerId}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/customer/${customerId}/orders/${orderId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Order
          </Button>
        </div>

        <CheckoutForm
          orderId={orderId}
          totalAmount={order.totalAmount}
          customerId={customerId}
        />
      </div>
    </CustomerDashboardLayout>
  );
}
