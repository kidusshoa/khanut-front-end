"use client";
import BusinessAppointmentsClient from "./BusinessAppointmentClient";

export default async function BusinessAppointmentsPage({ params }: any) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const businessId = resolvedParams.businessId;
  return <BusinessAppointmentsClient businessId={businessId} />;
}
