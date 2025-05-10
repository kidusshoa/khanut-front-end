import { Suspense } from "react";
import RecommendationsClient from "./RecommendationsClient";

// Define the params type
interface PageParams {
  adminId: string;
}

// Use the 'any' type for the component props to avoid type errors
export default function RecommendationsPage({ params }: { params: any }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecommendationsClient adminId={params.adminId} />
    </Suspense>
  );
}
