"use client";

import { useParams } from "next/navigation";
import CartContent from "@/components/customer/CartContent";

export default function CartPage() {
  // Use the useParams hook to get the customerId
  const params = useParams();
  const customerId = params.customerId as string;

  return <CartContent customerId={customerId} />;
}
