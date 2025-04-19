"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import CustomerDashboardLayout from "@/components/layout/CustomerDashboardLayout";
import { LoadingState } from "@/components/ui/loading-state";

export default function CustomerSearchBusinessRedirect() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = params.customerId as string;
  const businessId = params.businessId as string;

  // Get the search query from URL if it exists
  const searchQuery = searchParams.get("q") || "";
  const fromSearch = searchParams.get("fromSearch") === "true";

  useEffect(() => {
    // Redirect to the business details page with customer context
    if (customerId && businessId) {
      // Pass the search query and fromSearch flag to maintain context
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.set("q", searchQuery);
      if (fromSearch) queryParams.set("fromSearch", "true");

      const queryString = queryParams.toString();
      const redirectUrl = `/customer/${customerId}/businesses/${businessId}${
        queryString ? `?${queryString}` : ""
      }`;

      router.push(redirectUrl);
    }
  }, [customerId, businessId, router, searchQuery, fromSearch]);

  return (
    <CustomerDashboardLayout customerId={customerId}>
      <LoadingState
        message="Redirecting to business details..."
        size="lg"
        className="min-h-[60vh]"
      />
    </CustomerDashboardLayout>
  );
}
