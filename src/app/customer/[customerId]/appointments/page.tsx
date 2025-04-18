"use client";

import { useParams } from "next/navigation";
import CustomerAppointmentsContent from "@/components/customer/CustomerAppointmentsContent";

export default function CustomerAppointmentsPage() {
  // Use the useParams hook to get the customerId
  const params = useParams();
  const customerId = params.customerId as string;

  return <CustomerAppointmentsContent customerId={customerId} />;
}
