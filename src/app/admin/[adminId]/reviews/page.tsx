"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface Review {
  _id: string;
  businessId: {
    _id: string;
    name: string;
  };
  authorId: {
    _id: string;
    email: string;
    name: string;
  };
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  reviews: Review[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function PendingReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 5,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchPendingReviews = async (page: number = 1) => {
    try {
      const accessToken = Cookies.get("client-token");

      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/pending?page=${page}&limit=${pagination.limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setReviews(response.data.reviews);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
        limit: pagination.limit,
      });
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to load pending reviews");

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        Cookies.remove("client-token");
        Cookies.remove("user-role");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const accessToken = Cookies.get("client-token");
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/${reviewId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      fetchPendingReviews(pagination.currentPage);
    } catch (error) {
      console.error("Approve error:", error);
      setError("Failed to approve review");
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const accessToken = Cookies.get("client-token");
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/${reviewId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      fetchPendingReviews(pagination.currentPage);
    } catch (error) {
      console.error("Reject error:", error);
      setError("Failed to reject review");
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  if (loading) {
    return <div className="p-4">Loading pending reviews...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl text-orange-500 font-bold">Pending Reviews</h2>
      <p className="text-gray-600 mb-4">
        Reviews waiting for approval or rejection.
      </p>

      {reviews.length === 0 ? (
        <div className="p-4 bg-gray-100 rounded">No pending reviews found.</div>
      ) : (
        <div>
          <table className="min-w-full bg-white rounded shadow mb-4">
            <thead className="bg-orange-100">
              <tr>
                <th className="p-3 text-left">Business</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Rating</th>
                <th className="p-3 text-left">Comment</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{review.businessId.name}</td>
                  <td className="p-3">
                    {review.authorId.name} ({review.authorId.email})
                  </td>
                  <td className="p-3">{review.rating}/5</td>
                  <td className="p-3 text-sm">{review.comment}</td>
                  <td className="p-3">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleApprove(review._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(review._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          {/* <div className="flex justify-between items-center">
            <button
              onClick={() => fetchPendingReviews(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className={`px-4 py-2 rounded ${
                pagination.hasPrevPage
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchPendingReviews(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className={`px-4 py-2 rounded ${
                pagination.hasNextPage
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}
