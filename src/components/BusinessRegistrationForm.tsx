"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  BusinessRegistrationInput,
  businessRegistrationSchema,
} from "@/lib/validations/business";
import { businessService } from "@/services/business";

export default function BusinessRegistrationForm() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
  } = useForm<BusinessRegistrationInput>({
    resolver: zodResolver(businessRegistrationSchema),
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("profilePicture", {
          type: "manual",
          message: "Image size should be less than 5MB",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setValue("profilePicture", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: BusinessRegistrationInput) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });

      await businessService.register(formData);
      router.push("/business/pending");
    } catch (error: any) {
      setError("root", {
        type: "manual",
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="businessName"
          className="block text-sm font-medium text-gray-700"
        >
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
            {errors.businessName.message?.toString()}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-700"
        >
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
            {errors.phoneNumber.message?.toString()}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Business Description
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
            {errors.description.message?.toString()}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="businessType"
          className="block text-sm font-medium text-gray-700"
        >
          Business Type
        </label>
        <input
          {...register("businessType")}
          type="text"
          className={`mt-1 block w-full rounded-md border ${
            errors.businessType ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
        />
        {errors.businessType && (
          <p className="mt-1 text-sm text-red-600">
            {errors.businessType.message?.toString()}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="businessAddress"
          className="block text-sm font-medium text-gray-700"
        >
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
            {errors.businessAddress.message?.toString()}
          </p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-600 text-center">
          {errors.root.message?.toString()}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Submit Registration"
        )}
      </button>
    </form>
  );
}
