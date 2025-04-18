"use client";

import { useParams } from "next/navigation";
import OrdersContent from "@/components/customer/OrdersContent";

export default function CustomerOrdersPage() {
  // Use the useParams hook to get the customerId
  const params = useParams();
  const customerId = params.customerId as string;

  return <OrdersContent customerId={customerId} />;
}
