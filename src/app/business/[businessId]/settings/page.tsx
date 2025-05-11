"use client";

import { useParams } from "next/navigation";
import SettingsContent from "./SettingsContent";

export default function BusinessSettingsPage() {
  // Use the useParams hook to get the businessId
  const params = useParams();
  const businessId = params.businessId as string;

  return <SettingsContent businessId={businessId} />;
}
