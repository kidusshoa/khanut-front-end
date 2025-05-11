"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";
import DashboardClient from "../DashboardClient";

export default function BusinessDashboardPage() {
  // Use the useParams hook to get the businessId
  const params = useParams();
  const businessId = params.businessId as string;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient businessId={businessId} />
    </Suspense>
  );
}
