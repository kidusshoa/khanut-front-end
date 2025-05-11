import { Suspense } from "react";
import RecommendationsClient from "./RecommendationsClient";

// Define the params type
interface PageParams {
  adminId: string;
}

// Use the PageParams type for the component props
export default async function RecommendationsPage({
  params,
}: {
  params: PageParams;
}) {
  // Await the params to ensure they're fully resolved
  const adminId = await Promise.resolve(params.adminId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecommendationsClient adminId={adminId} />
    </Suspense>
  );
}
