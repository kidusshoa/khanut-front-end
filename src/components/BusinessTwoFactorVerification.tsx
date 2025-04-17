"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TwoFactorInput, twoFactorSchema } from "@/lib/validations/auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export function BusinessTwoFactorVerification() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<TwoFactorInput>({
    resolver: zodResolver(twoFactorSchema),
  });

  // Redirect if no session exists
  useEffect(() => {
    if (!session?.user) {
      router.push("/register/business");
    }
  }, [session, router]);

  const onSubmit = async (data: TwoFactorInput) => {
    if (!session?.user) {
      router.push("/register/business");
      return;
    }

    // Type assertion to access the extended user properties
    const user = session.user as {
      tempEmail?: string;
      tempRole?: string;
    } & typeof session.user;

    if (!user.tempEmail || user.tempRole !== "business") {
      router.push("/register/business");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.tempEmail,
            code: data.code,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      const result = await response.json();

      // Update session with new data
      await update({
        ...session,
        user: result.user,
        accessToken: result.accessToken,
      });

      router.push(`/business/register/${result.user.id}`);
    } catch (error) {
      setError("code", {
        type: "manual",
        message: "Invalid verification code",
      });
    }
  };

  // Show loading state or redirect if no session
  if (!session?.user) {
    return (
      <div className="flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-center">Verify Your Account</h2>
        <p className="text-sm text-gray-600 text-center mt-2">
          Please enter the verification code sent to your email
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700"
          >
            Verification Code
          </label>
          <input
            {...register("code")}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter 6-digit code"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Verify"
          )}
        </button>
      </form>
    </div>
  );
}
