"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  BusinessRegistrationInput,
  businessRegistrationSchema,
} from "@/lib/validations/business";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

export default function BusinessRegistrationPage({
  params: { businessOwnerId },
}: {
  params: { businessOwnerId: string };
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<BusinessRegistrationInput>({
    resolver: zodResolver(businessRegistrationSchema),
  });

  const onSubmit = async (data: BusinessRegistrationInput) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/business/register", {
        ...data,
        businessOwnerId,
      });

      if (response.status === 201) {
        router.push("/business/pending");
      }
    } catch (error: any) {
      setError("root", {
        type: "manual",
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">
          Complete Your Business Profile
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <input
              {...register("businessName")}
              type="text"
              className={`mt-1 block w-full rounded-md border ${
                errors.businessName ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
            />
            {errors.businessName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.businessName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Address
            </label>
            <input
              {...register("businessAddress")}
              type="text"
              className={`mt-1 block w-full rounded-md border ${
                errors.businessAddress ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
            />
            {errors.businessAddress && (
              <p className="mt-1 text-sm text-red-600">
                {errors.businessAddress.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Type
            </label>
            <select
              {...register("businessType")}
              className={`mt-1 block w-full rounded-md border ${
                errors.businessType ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
            >
              <option value="">Select a business type</option>
              <option value="retail">Retail</option>
              <option value="restaurant">Restaurant</option>
              <option value="service">Service</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="other">Other</option>
            </select>
            {errors.businessType && (
              <p className="mt-1 text-sm text-red-600">
                {errors.businessType.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className={`mt-1 block w-full rounded-md border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              {...register("phoneNumber")}
              type="tel"
              className={`mt-1 block w-full rounded-md border ${
                errors.phoneNumber ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tax ID (Optional)
            </label>
            <input
              {...register("taxId")}
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website (Optional)
            </label>
            <input
              {...register("website")}
              type="url"
              className={`mt-1 block w-full rounded-md border ${
                errors.website ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">
                {errors.website.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-red-600 text-center">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Submit Business Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
