"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Star } from "lucide-react";
import { z } from "zod";

// Validation schema
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(3, "Comment must be at least 3 characters"),
});

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { rating: number; comment: string }) => void;
  initialData?: {
    rating: number;
    comment: string;
  };
  isEditing?: boolean;
}

export function WriteReviewModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: initialData?.rating || 0,
      comment: initialData?.comment || "",
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await onSubmit({ ...data, rating });
      reset();
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Edit Your Review" : "Write a Review"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label className="block mb-2">Rating</Label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="p-1 focus:outline-none"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      (hoveredRating ? value <= hoveredRating : value <= rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-red-500 text-sm mt-1">Please select a rating</p>
            )}
          </div>

          <div>
            <Label htmlFor="comment">Review</Label>
            <Textarea
              id="comment"
              {...register("comment")}
              placeholder="Share your experience with this service..."
              rows={4}
            />
            {errors.comment && (
              <p className="text-red-500 text-sm mt-1">{errors.comment.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || rating === 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEditing ? "Update Review" : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
