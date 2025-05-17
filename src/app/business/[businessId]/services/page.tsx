"use client";

import { useParams } from "next/navigation";
import ServicesContent from "./ServicesContent";

export default function BusinessServicesPage() {
  // Use the useParams hook to get the businessId
  const params = useParams();
  const businessId = params.businessId as string;

  return <ServicesContent businessId={businessId} />;
}
