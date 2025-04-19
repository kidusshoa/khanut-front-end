"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingState } from "@/components/ui/loading-state";

interface CustomerSearchRedirectProps {
  customerId: string;
}

export default function CustomerSearchRedirect({ customerId }: CustomerSearchRedirectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the search query from URL
  const query = searchParams.get("query") || searchParams.get("q") || "";
  
  useEffect(() => {
    // Redirect to the customer-specific search page
    if (customerId) {
      const redirectUrl = `/customer/${customerId}/search${query ? `?q=${encodeURIComponent(query)}` : ""}`;
      router.replace(redirectUrl);
    }
  }, [customerId, query, router]);
  
  return (
    <div className="container mx-auto py-12">
      <LoadingState 
        message="Redirecting to customer search..."
        size="lg"
        className="min-h-[60vh]"
      />
    </div>
  );
}
