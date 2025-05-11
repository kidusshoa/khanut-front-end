"use client";

import { useParams } from "next/navigation";
import ProductsContent from "./ProductsContent";

export default function BusinessProductsPage() {
  // Use the useParams hook to get the businessId
  const params = useParams();
  const businessId = params.businessId as string;

  return <ProductsContent businessId={businessId} />;
}
