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
        setError("businessImage", {
          type: "manual",
          message: "Image size should be less than 5MB",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setValue("businessImage", file);
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
          {...register("name")}
          type="text"
          className={`mt-1 block w-full rounded-md border ${
            errors.name ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.name.message?.toString()}
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
          {...register("phone")}
          type="tel"
          className={`mt-1 block w-full rounded-md border ${
            errors.phone ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">
            {errors.phone.message?.toString()}
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
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Business Category
        </label>
        <input
          {...register("category")}
          type="text"
          className={`mt-1 block w-full rounded-md border ${
            errors.category ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
        />
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">
            {errors.category.message?.toString()}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          Business Address
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
            {errors.address.message?.toString()}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="city"
          className="block text-sm font-medium text-gray-700"
        >
          City
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
            {errors.city.message?.toString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="latitude"
            className="block text-sm font-medium text-gray-700"
          >
            Latitude
          </label>
          <input
            {...register("latitude")}
            type="text"
            className={`mt-1 block w-full rounded-md border ${
              errors.latitude ? "border-red-500" : "border-gray-300"
            } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
          />
          {errors.latitude && (
            <p className="mt-1 text-sm text-red-600">
              {errors.latitude.message?.toString()}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="longitude"
            className="block text-sm font-medium text-gray-700"
          >
            Longitude
          </label>
          <input
            {...register("longitude")}
            type="text"
            className={`mt-1 block w-full rounded-md border ${
              errors.longitude ? "border-red-500" : "border-gray-300"
            } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
          />
          {errors.longitude && (
            <p className="mt-1 text-sm text-red-600">
              {errors.longitude.message?.toString()}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Business Email (Optional)
        </label>
        <input
          {...register("email")}
          type="email"
          className={`mt-1 block w-full rounded-md border ${
            errors.email ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">
            {errors.email.message?.toString()}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="website"
          className="block text-sm font-medium text-gray-700"
        >
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
            {errors.website.message?.toString()}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="businessImage"
          className="block text-sm font-medium text-gray-700"
        >
          Business Image
        </label>
        <div className="mt-1 flex items-center space-x-4">
          <label
            htmlFor="businessImage"
            className="flex items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-orange-500"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Business preview"
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="text-xs text-gray-500">Upload image</div>
              </div>
            )}
            <input
              id="businessImage"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
            />
          </label>
        </div>
        {errors.businessImage && (
          <p className="mt-1 text-sm text-red-600">
            {errors.businessImage.message?.toString()}
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
