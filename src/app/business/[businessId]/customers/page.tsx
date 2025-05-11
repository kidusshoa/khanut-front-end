"use client";

import { useParams } from "next/navigation";
import CustomersContent from "./CustomersContent";

export default function BusinessCustomersPage() {
  // Use the useParams hook to get the businessId
  const params = useParams();
  const businessId = params.businessId as string;

  return <CustomersContent businessId={businessId} />;
}
