"use client";
import { useParams } from "next/navigation";
import BusinessAppointmentsClient from "./BusinessAppointmentClient";

export default function BusinessAppointmentsPage() {
  // Use the useParams hook to get the businessId
  const params = useParams();
  const businessId = params.businessId as string;

  return <BusinessAppointmentsClient businessId={businessId} />;
}
