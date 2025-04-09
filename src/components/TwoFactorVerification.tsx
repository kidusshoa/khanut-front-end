"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { TwoFactorInput, twoFactorSchema } from "@/lib/validations/auth";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";

export default function TwoFactorVerification() {
  const tempEmail = useAuthStore((state) => state.tempEmail);
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<TwoFactorInput>({
    resolver: zodResolver(twoFactorSchema),
  });

  const onSubmit = async (data: TwoFactorInput) => {
    if (!tempEmail) return;

    try {
      const response = await authService.verify2FA(tempEmail, data.code);
      setUser(response.user);
      setAccessToken(response.accessToken);
      // Redirect based on user role
      window.location.href =
        response.user.role === "business" ? "/business/register" : "/dashboard";
    } catch (error) {
      setError("code", {
        type: "manual",
        message: "Invalid verification code",
      });
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a 6-digit code to {tempEmail}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <input
            {...register("code")}
            type="text"
            maxLength={6}
            className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
              errors.code ? "border-red-500" : "border-gray-300"
            } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
            placeholder="Enter 6-digit code"
          />
          {errors.code && (
            <p className="mt-2 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            "Verify Code"
          )}
        </button>
      </form>
    </div>
  );
}
