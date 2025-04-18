"use client";

import { useParams } from "next/navigation";
import CustomerDashboardContent from "@/components/customer/CustomerDashboardContent";

export default function CustomerDashboardPage() {
  // Use the useParams hook to get the customerId
  const params = useParams();
  const customerId = params.customerId as string;

  return <CustomerDashboardContent customerId={customerId} />;
}
