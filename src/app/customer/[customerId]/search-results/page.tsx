"use client";

import { useParams } from "next/navigation";
import SearchResultsContent from "@/components/customer/SearchResultsContent";

export default function SearchResultsPage() {
  // Use the useParams hook to get the customerId
  const params = useParams();
  const customerId = params.customerId as string;

  return <SearchResultsContent customerId={customerId} />;
}
