"use client";

import { useParams } from "next/navigation";
import OrdersContent from "./OrdersContent";

export default function BusinessOrdersPage() {
  // Use the useParams hook to get the businessId
  const params = useParams();
  const businessId = params.businessId as string;

  return <OrdersContent businessId={businessId} />;
}
