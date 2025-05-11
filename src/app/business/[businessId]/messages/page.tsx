"use client";

import { useParams } from "next/navigation";
import MessagesContent from "./MessagesContent";

export default function BusinessMessagesPage() {
  // Use the useParams hook to get the businessId
  const params = useParams();
  const businessId = params.businessId as string;

  return <MessagesContent businessId={businessId} />;
}
