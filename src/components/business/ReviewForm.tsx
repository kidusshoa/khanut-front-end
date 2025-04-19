"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { businessDetailApi } from "@/services/businessDetail";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useAuthStatus } from "@/hooks/useAuthStatus";

// Create a simple alert component since the ui/alert is missing
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

const Alert = ({
  children,
  className,
  variant = "default",
  ...props
}: AlertProps) => (
  <div
    className={cn(
      "rounded-md p-3 flex items-center gap-2",
      variant === "destructive"
        ? "bg-destructive/15 text-destructive"
        : "bg-primary/15 text-primary",
      className
    )}
    role="alert"
    {...props}
  >
    {children}
  </div>
);

const AlertDescription = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-sm", className)} {...props}>
    {children}
  </div>
);

interface ReviewFormProps {
  businessId: string;
  onReviewSubmitted: () => void;
  forceLoggedIn?: boolean; // For cases where we know the user is logged in but session might not be detected
}

export function ReviewForm({
  businessId,
  onReviewSubmitted,
  forceLoggedIn = false,
}: ReviewFormProps) {
  // Use our custom auth hook for more reliable authentication checking
  const { isAuthenticated, customerId } = useAuthStatus();

  // Determine if user is logged in either via auth hook or forced login state
  const isLoggedIn = isAuthenticated || forceLoggedIn;

  // Debug auth state
  useEffect(() => {
    console.log("IsAuthenticated:", isAuthenticated);
    console.log("CustomerId:", customerId);
    console.log("ForceLoggedIn:", forceLoggedIn);
    console.log("IsLoggedIn:", isLoggedIn);
  }, [isAuthenticated, customerId, forceLoggedIn, isLoggedIn]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Clear error when user makes changes
  useEffect(() => {
    if (error) setError("");
  }, [rating, comment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLoggedIn) {
      setError("Please log in to submit a review");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please share your experience in the comment field");
      return;
    }

    if (comment.trim().length < 10) {
      setError(
        "Please provide a more detailed review (at least 10 characters)"
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Include customerId in the review submission if available
      await businessDetailApi.submitReview(
        businessId,
        rating,
        comment,
        customerId
      );

      console.log("Review submitted with customerId:", customerId);

      toast.success("Review submitted successfully");
      setRating(0);
      setComment("");
      setHasSubmitted(true);
      onReviewSubmitted();
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Failed to submit review. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show thank you message after submission
  if (hasSubmitted) {
    return (
      <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-medium text-green-800 dark:text-green-400 mb-2">
          Thank you for your review!
        </h3>
        <p className="text-green-700 dark:text-green-300 mb-4">
          Your feedback helps other customers make informed decisions.
        </p>
        <Button
          variant="outline"
          onClick={() => setHasSubmitted(false)}
          className="border-green-500 text-green-600 hover:bg-green-50"
        >
          Write Another Review
        </Button>
      </div>
    );
  }

  // If we have a customerId in the URL, we know the user is logged in
  // even if the session isn't detected properly
  if (!isLoggedIn) {
    return (
      <div className="text-center p-6 bg-muted/50 rounded-lg border border-border">
        <p className="text-muted-foreground mb-3">
          Please log in to leave a review
        </p>
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/login")}
          >
            Log In
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => {
              // Force a login state for testing
              localStorage.setItem("forceLoggedIn", "true");
              window.location.reload();
            }}
          >
            Continue as Guest
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none p-1"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  (hoverRating || rating) >= star
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                )}
              />
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {rating === 1 && "Poor"}
          {rating === 2 && "Fair"}
          {rating === 3 && "Good"}
          {rating === 4 && "Very Good"}
          {rating === 5 && "Excellent"}
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="comment" className="text-sm font-medium">
          Your Review <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this business..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className={cn(
            "resize-none",
            error &&
              !comment.trim() &&
              "border-red-500 focus-visible:ring-red-500"
          )}
        />
        <p className="text-xs text-muted-foreground">
          {comment.length} characters (minimum 10)
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 min-w-[150px]"
          disabled={isSubmitting}
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
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Fields marked with <span className="text-red-500">*</span> are required
      </p>
    </form>
  );
}
