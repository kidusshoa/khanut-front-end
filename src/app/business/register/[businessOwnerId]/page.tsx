"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import {
  BusinessRegistrationInput,
  businessRegistrationSchema,
} from "@/lib/validations/business";
import { businessService } from "@/services/business";
import { LocationPicker } from "@/components/LocationPicker";

export default function BusinessRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const businessOwnerId = params.businessOwnerId as string;
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
    // Store as numbers, not strings
    setValue("latitude", latitude);
    setValue("longitude", longitude);

    console.log("Location selected:", { latitude, longitude });
  };

  const onSubmit = async (data: BusinessRegistrationInput) => {
    try {
      setIsSubmitting(true);
      console.log("Form data submitted:", data);

      const formData = new FormData();
      // Add address to the business model
      if (data.address) {
        formData.append("address", data.address);
      }

      // Make sure all required fields are present
      const requiredFields = [
        "name",
        "description",
        "category",
        "city",
        "latitude",
        "longitude",
      ];
      const missingFields = requiredFields.filter(
        (field) => !data[field as keyof BusinessRegistrationInput]
      );

      if (missingFields.length > 0) {
        console.error("Missing required fields:", missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Add the business owner ID
      formData.append("businessOwnerId", businessOwnerId);

      // Explicitly add each required field to ensure correct order and naming
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("city", data.city);
      formData.append("latitude", data.latitude.toString());
      formData.append("longitude", data.longitude.toString());
      formData.append("phone", data.phone);

      // Add optional fields
      if (data.email) {
        formData.append("email", data.email);
      }

      if (data.website) {
        formData.append("website", data.website);
      }

      // Handle file upload
      if (data.profilePicture instanceof FileList && data.profilePicture[0]) {
        console.log("Adding file: profilePicture", data.profilePicture[0].name);
        formData.append("profilePicture", data.profilePicture[0]);
      }

      // Log the form data being sent
      console.log("FormData entries:", Object.fromEntries(formData.entries()));

      // Log each field individually for debugging
      console.log("Required fields check:");
      console.log("- name:", data.name);
      console.log("- description:", data.description);
      console.log("- category:", data.category);
      console.log("- city:", data.city);
      console.log("- latitude:", data.latitude);
      console.log("- longitude:", data.longitude);
      console.log("- phone:", data.phone);
      console.log("- address:", data.address);

      const response = await businessService.register(formData);
      console.log("Business registration successful:", response);

      // Redirect to the pending page
      router.push("/business/pending");
    } catch (error: any) {
      console.error("Business registration error:", error);

      // Handle different types of errors
      if (error.message && error.message.includes("Missing required fields")) {
        // Handle missing fields error
        setError("root", {
          type: "manual",
          message: error.message,
        });
      } else if (
        error.name === "BusinessAlreadyRegisteredError" ||
        (error.message &&
          error.message.includes("already have a registered business"))
      ) {
        // Handle the case where the user already has a registered business
        setError("root", {
          type: "manual",
          message: "You already have a registered business",
        });

        // Show a more user-friendly error
        const errorDiv = document.createElement("div");
        errorDiv.className =
          "fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50";
        errorDiv.innerHTML = `
          <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div class="flex items-center justify-center text-red-500 mb-4">
              <svg class="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-center mb-2">Registration Error</h3>
            <p class="text-center mb-4">You already have a registered business</p>
            <div class="flex justify-center">
              <button id="closeErrorModal" class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">OK</button>
            </div>
          </div>
        `;
        document.body.appendChild(errorDiv);

        // Add event listener to close button
        document
          .getElementById("closeErrorModal")
          ?.addEventListener("click", () => {
            document.body.removeChild(errorDiv);
            // Redirect to pending page or dashboard
            router.push("/business/pending");
          });
      } else if (error.response?.data) {
        // Handle API error response
        const errorMessage =
          error.response.data.message || JSON.stringify(error.response.data);
        console.error("API Error Message:", errorMessage);

        setError("root", {
          type: "manual",
          message: errorMessage,
        });

        // Log detailed error information
        console.error("API Error Response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else {
        // Handle other errors
        setError("root", {
          type: "manual",
          message: "Registration failed. Please try again.",
        });
      }
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
                        {...register("profilePicture")}
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

            {/* Business Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Category *
              </label>
              <select
                {...register("category")}
                className={`mt-1 block w-full rounded-md border ${
                  errors.category ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
              >
                <option value="">Select a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Food">Food & Beverages</option>
                <option value="Clothing">Clothing & Fashion</option>
                <option value="Health">Health & Beauty</option>
                <option value="Home">Home & Furniture</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.category.message}
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

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City *
              </label>
              <input
                {...register("city")}
                type="text"
                className={`mt-1 block w-full rounded-md border ${
                  errors.city ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.city.message}
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
              <div className="rounded-md bg-red-50 p-4 border border-red-300">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Registration Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{errors.root.message}</p>
                    </div>
                  </div>
                </div>
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
