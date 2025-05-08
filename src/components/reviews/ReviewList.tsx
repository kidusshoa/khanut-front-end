"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Star, StarHalf, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { reviewApi } from "@/services/review";
import dayjs from "dayjs";
// Replaced date-fns with dayjs
import { toast } from "react-hot-toast";
import { WriteReviewModal } from "./WriteReviewModal";

interface ReviewListProps {
  serviceId: string;
  businessId: string;
}

export function ReviewList({ serviceId, businessId }: ReviewListProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        
        // Fetch reviews
        const reviewsData = await reviewApi.getServiceReviews(serviceId);
        setReviews(reviewsData);
        
        // Fetch stats
        const statsData = await reviewApi.getServiceRatingStats(serviceId);
        setStats(statsData);
        
        // Check if current user has already reviewed
        if (session?.user?.id) {
          const userReview = reviewsData.find(
            (review: any) => review.customerId._id === session.user.id
          );
          
          if (userReview) {
            setUserHasReviewed(true);
            setUserReview(userReview);
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to load reviews");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [serviceId, session]);

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      const newReview = await reviewApi.createReview({
        serviceId,
        businessId,
        customerId: session?.user?.id as string,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      
      // Refetch reviews and stats
      const reviewsData = await reviewApi.getServiceReviews(serviceId);
      setReviews(reviewsData);
      
      const statsData = await reviewApi.getServiceRatingStats(serviceId);
      setStats(statsData);
      
      setUserHasReviewed(true);
      setUserReview(newReview);
      
      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  const handleReviewUpdate = async (reviewData: any) => {
    try {
      await reviewApi.updateReview(userReview._id, {
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      
      // Refetch reviews and stats
      const reviewsData = await reviewApi.getServiceReviews(serviceId);
      setReviews(reviewsData);
      
      const statsData = await reviewApi.getServiceRatingStats(serviceId);
      setStats(statsData);
      
      // Update user review
      const updatedUserReview = reviewsData.find(
        (review: any) => review.customerId._id === session?.user?.id
      );
      setUserReview(updatedUserReview);
      
      toast.success("Review updated successfully!");
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    }
  };

  const handleReviewDelete = async () => {
    try {
      await reviewApi.deleteReview(userReview._id);
      
      // Refetch reviews and stats
      const reviewsData = await reviewApi.getServiceReviews(serviceId);
      setReviews(reviewsData);
      
      const statsData = await reviewApi.getServiceRatingStats(serviceId);
      setStats(statsData);
      
      setUserHasReviewed(false);
      setUserReview(null);
      
      toast.success("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
      
      {stats && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center mb-2">
            <div className="flex items-center mr-2">
              {renderStars(stats.averageRating)}
            </div>
            <span className="font-medium text-lg">
              {stats.averageRating.toFixed(1)}
            </span>
            <span className="text-gray-500 ml-2">
              ({stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"})
            </span>
          </div>
          
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <span className="w-8 text-sm text-gray-600">{rating} star</span>
                <div className="flex-grow mx-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: stats.totalReviews
                        ? `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100}%`
                        : "0%",
                    }}
                  ></div>
                </div>
                <span className="w-8 text-sm text-gray-600 text-right">
                  {stats.ratingDistribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {session?.user?.id && (
        <div className="mb-6">
          {userHasReviewed ? (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-medium text-orange-800 mb-2">Your Review</h3>
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {renderStars(userReview.rating)}
                </div>
                <span className="ml-2 text-gray-600">
                  {formatDistanceToNow(new Date(userReview.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-gray-700 mb-3">{userReview.comment}</p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  Edit Review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={handleReviewDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Write a Review
            </Button>
          )}
        </div>
      )}
      
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews
            .filter((review) => review.customerId._id !== session?.user?.id)
            .map((review) => (
              <Card key={review._id}>
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      {review.customerId.profilePicture ? (
                        <img
                          src={review.customerId.profilePicture}
                          alt={review.customerId.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{review.customerId.name}</p>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reviews yet. Be the first to review this service!</p>
        </div>
      )}
      
      <WriteReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={userHasReviewed ? handleReviewUpdate : handleReviewSubmit}
        initialData={userHasReviewed ? userReview : undefined}
        isEditing={userHasReviewed}
      />
    </div>
  );
}
