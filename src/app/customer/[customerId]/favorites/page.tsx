"use client";

import { useParams } from "next/navigation";
import FavoritesContent from "@/components/customer/FavoritesContent";

export default function FavoritesPage() {
  // Use the useParams hook to get the customerId
  const params = useParams();
  const customerId = params.customerId as string;

  return <FavoritesContent customerId={customerId} />;
}
