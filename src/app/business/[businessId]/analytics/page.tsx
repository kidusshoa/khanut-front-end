"use client";
import BusinessAnalyticsContent from "./BusinessAnalyticsContent";

// Don't specify a type at all, let Next.js infer it
export default async function BusinessAnalyticsPage({ params }: any) {
  // Handle both Promise and non-Promise cases
  const resolvedParams = params instanceof Promise ? await params : params;
  const businessId = resolvedParams.businessId;

  return <BusinessAnalyticsContent businessId={businessId} />;
}
