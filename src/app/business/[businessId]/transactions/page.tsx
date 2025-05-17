"use client";

import { useParams } from "next/navigation";
import BusinessTransactionsPage from "@/components/business/BusinessTransactionsPage";
import BusinessDashboardLayout from "@/components/layout/BusinessDashboardLayout";

export default function BusinessTransactionsRoute() {
  // Use the useParams hook to get the businessId
  const params = useParams();
  const businessId = params.businessId as string;

  return (
    <BusinessDashboardLayout businessId={businessId}>
      <BusinessTransactionsPage businessId={businessId} />
    </BusinessDashboardLayout>
  );
}
