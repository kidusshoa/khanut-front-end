"use client";

import { useParams } from "next/navigation";
import InventoryContent from "./InventoryContent";

export default function BusinessInventoryPage() {
  // Use the useParams hook to get the businessId
  const params = useParams();
  const businessId = params.businessId as string;

  return <InventoryContent businessId={businessId} />;
}
