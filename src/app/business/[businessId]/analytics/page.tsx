"use client";
import { useParams } from "next/navigation";
import BusinessAnalyticsContent from "./BusinessAnalyticsContent";

export default function BusinessAnalyticsPage() {
  // Use the useParams hook to get the businessId
  const params = useParams();
  const businessId = params.businessId as string;

  return <BusinessAnalyticsContent businessId={businessId} />;
}
