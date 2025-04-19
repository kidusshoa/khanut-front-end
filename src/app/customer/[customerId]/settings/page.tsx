"use client";

import { useParams } from "next/navigation";
import SettingsContent from "@/components/customer/SettingsContent";

export default function SettingsPage() {
  // Use the useParams hook to get the customerId
  const params = useParams();
  const customerId = params.customerId as string;

  return <SettingsContent customerId={customerId} />;
}
