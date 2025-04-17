"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BusinessRegistrationPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the business owner registration form
    router.push("/register/business-owner");
  }, [router]);

  return null; // or a loading spinner if desired
}
