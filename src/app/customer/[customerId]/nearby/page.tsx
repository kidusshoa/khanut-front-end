"use client";

import { useParams } from "next/navigation";
import NearbyContent from "@/components/customer/NearbyContent";

export default function NearbyPage() {
  // Use the useParams hook to get the customerId
  const params = useParams();
  const customerId = params.customerId as string;

  return <NearbyContent customerId={customerId} />;
}
