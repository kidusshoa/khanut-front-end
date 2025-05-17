"use client";

import { useParams } from "next/navigation";
import ProfileContent from "./ProfileContent";

export default function BusinessProfilePage() {
  // Use the useParams hook to get the businessId
  const params = useParams();
  const businessId = params.businessId as string;

  return <ProfileContent businessId={businessId} />;
}
