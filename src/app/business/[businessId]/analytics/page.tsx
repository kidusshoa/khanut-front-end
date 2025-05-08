"use client";
import BusinessAnalyticsContent from "./BusinessAnalyticsContent";

export default async function BusinessAnalyticsPage({ params }: any) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const businessId = resolvedParams.businessId;

  return <BusinessAnalyticsContent businessId={businessId} />;
}
