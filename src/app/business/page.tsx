"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function BusinessRedirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user?.id) {
      // If user is logged in, redirect to their business dashboard
      router.push(`/business/${session.user.id}/dashboard`);
    } else {
      // If not logged in, redirect to business login
      router.push("/business/login");
    }
  }, [router, session, status]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
        <p className="text-lg">Redirecting...</p>
      </div>
    </div>
  );
}
