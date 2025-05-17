"use client";

import { useParams } from "next/navigation";
import TransactionsPage from "@/components/customer/TransactionsPage";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";

export default function CustomerTransactionsRoute() {
  // Use the useParams hook to get the customerId
  const params = useParams();
  const customerId = params.customerId as string;

  return (
    <CustomerDashboardLayout>
      <TransactionsPage customerId={customerId} />
    </CustomerDashboardLayout>
  );
}
