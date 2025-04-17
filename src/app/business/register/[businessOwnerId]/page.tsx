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
import { businessService } from "@/services/business";
import { LocationPicker } from "@/components/LocationPicker";

export default function BusinessRegistrationPage({
  params: { businessOwnerId },
}: {
  params: { businessOwnerId: string };
}) {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<BusinessRegistrationInput>({
    resolver: zodResolver(businessRegistrationSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setValue("latitude", latitude.toString());
    setValue("longitude", longitude.toString());
  };

  const onSubmit = async (data: BusinessRegistrationInput) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("businessOwnerId", businessOwnerId);

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === "businessImage" && value instanceof FileList) {
            formData.append(key, value[0]);
          } else {
            formData.append(key, String(value));
          }
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              Complete Your Business Profile
            </h1>
            <p className="mt-2 text-center text-gray-600">
              Please provide your business details for verification
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Business Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-32 w-32 object-cover rounded-md"
                    />
                  ) : (
                    <div className="mx-auto h-32 w-32 flex items-center justify-center bg-gray-100 rounded-md">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                      <span>Upload a file</span>
                      <input
                        {...register("businessImage")}
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message?.toString()}
                </p>
              )}
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Name *
              </label>
              <input
                {...register("name")}
                type="text"
                className={`mt-1 block w-full rounded-md border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Business Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Description *
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

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Address *
              </label>
              <input
                {...register("address")}
                type="text"
                className={`mt-1 block w-full rounded-md border ${
                  errors.address ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Phone *
              </label>
              <input
                {...register("phone")}
                type="tel"
                className={`mt-1 block w-full rounded-md border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Website */}
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

            {/* Location Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Location *
              </label>
              <div className="mt-1">
                <LocationPicker
                  onSelect={handleLocationSelect}
                  initialLatitude={8.9806} // Default to Addis Ababa
                  initialLongitude={38.7578}
                />
              </div>
              {(errors.latitude || errors.longitude) && (
                <p className="mt-1 text-sm text-red-600">
                  Please select a valid location
                </p>
              )}
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Submit Registration"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
