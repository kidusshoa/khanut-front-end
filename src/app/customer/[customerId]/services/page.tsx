"use client";

import { useParams } from "next/navigation";
import ServicesContent from "@/components/customer/ServicesContent";

export default function CustomerServicesPage() {
  // Use the useParams hook to get the customerId
  const params = useParams();
  const customerId = params.customerId as string;

  return <ServicesContent customerId={customerId} />;
}
