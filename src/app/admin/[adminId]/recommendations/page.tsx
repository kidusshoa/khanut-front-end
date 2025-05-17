"use client";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import RecommendationsClient from "./RecommendationsClient";

export default function RecommendationsPage() {
  // Use the useParams hook to get the adminId
  const params = useParams();
  const adminId = params.adminId as string;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecommendationsClient adminId={adminId} />
    </Suspense>
  );
}
