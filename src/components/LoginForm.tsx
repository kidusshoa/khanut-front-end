"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { LoginInput, loginSchema } from "@/lib/validations/auth";
import axios from "axios";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const response = await axios.post("/api/login", {
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        const { user } = response.data;

        // Redirect based on user role
        if (user.role === "customer") {
          router.push(`/customer/${user.id}/home`);
        } else if (user.role === "business") {
          router.push(`/business/${user.id}/dashboard`);
        } else if (user.role === "admin") {
          router.push(`/admin/${user.id}/dashboard`);
        }
      }
    } catch (error: any) {
      setError("root", {
        type: "manual",
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          className={`mt-1 block w-full rounded-md border ${
            errors.email ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            className={`mt-1 block w-full rounded-md border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-600 text-center">
          {errors.root.message}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Sign in"
        )}
      </button>

      <div className="text-sm text-center">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-orange-600 hover:text-orange-500"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
}
