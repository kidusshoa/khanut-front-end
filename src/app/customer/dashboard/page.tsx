"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function CustomerDashboardRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      router.push(`/customer/${session.user.id}`);
    } else if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/customer/dashboard");
    }
  }, [router, session, status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Redirecting to your dashboard</h1>
      <p className="text-muted-foreground">Please wait...</p>
    </div>
  );
}
