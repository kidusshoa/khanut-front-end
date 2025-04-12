"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { TwoFactorInput, twoFactorSchema } from "@/lib/validations/auth";
import { Loader2 } from "lucide-react";

export function CustomerTwoFactorVerification() {
  const router = useRouter();
  const { tempEmail, tempRole, setUser, setAccessToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<TwoFactorInput>({
    resolver: zodResolver(twoFactorSchema),
  });

  const onSubmit = async (data: TwoFactorInput) => {
    if (!tempEmail || tempRole !== "customer") {
      router.push("/register/customer");
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
            email: tempEmail,
            code: data.code,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      const result = await response.json();
      setUser(result.user);
      setAccessToken(result.accessToken);

      // Redirect to login after successful verification
      router.push("/login");
    } catch (error) {
      setError("code", {
        type: "manual",
        message: "Invalid verification code",
      });
    }
  };

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
