"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { reviewApi } from "@/services/review";

// Validation schema for review
const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  comment: z.string().min(3, "Comment must be at least 3 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  businessId: string;
  serviceId?: string;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({
  businessId,
  serviceId,
  onReviewSubmitted,
}: ReviewFormProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const rating = watch("rating");

  const handleRatingClick = (value: number) => {
    setValue("rating", value, { shouldValidate: true });
  };

  const onSubmit = async (data: ReviewFormValues) => {
    if (!session?.user?.id) {
      toast.error("Please log in to submit a review");
      return;
    }

    try {
      setIsSubmitting(true);

      const reviewData = {
        businessId,
        serviceId,
        rating: data.rating,
        comment: data.comment,
      };

      await reviewApi.createReview(reviewData);

      toast.success("Review submitted successfully!");
      reset();
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mt-8">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      
      {!session ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground mb-2">
            Please log in to submit a review
          </p>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => toast.error("Please log in to submit a review")}
          >
            Log In to Review
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="p-1 focus:outline-none"
                  onClick={() => handleRatingClick(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= (hoveredRating || rating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Your Review
            </label>
            <Textarea
              id="comment"
              {...register("comment")}
              placeholder="Share your experience..."
              rows={4}
              className="w-full"
            />
            {errors.comment && (
              <p className="text-red-500 text-sm mt-1">{errors.comment.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
