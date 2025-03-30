"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";

const reviews = [
  {
    id: 1,
    author: "Kidus Birhanu",
    business: "Tech Gurus",
    rating: 4,
    comment: "Great service and fast repair!",
    date: "2024-03-15",
    status: "pending",
  },
  {
    id: 2,
    author: "Mekdes Assefa",
    business: "Local Bites",
    rating: 5,
    comment: "Delicious food, loved it!",
    date: "2024-04-01",
    status: "pending",
  },
];

export default function ReviewModeration() {
  const [moderatedReviews, setModeratedReviews] = useState(reviews);

  const handleModeration = (id: number, action: string) => {
    const actionText = action === "approve" ? "approved" : "rejected";
    const confirmed = confirm(
      `Are you sure you want to ${action} this review?`
    );
    if (!confirmed) return;

    setModeratedReviews((prev) =>
      prev.map((review) =>
        review.id === id ? { ...review, status: action } : review
      )
    );
    toast.success(`Review ${actionText} ✅`);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">
        Review Moderation
      </h2>
      <div className="space-y-4">
        {moderatedReviews
          .filter((r) => r.status === "pending")
          .map((review) => (
            <div
              key={review.id}
              className="bg-white p-4 rounded shadow border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold text-gray-800">
                    {review.author} on{" "}
                    <span className="text-blue-600">{review.business}</span>
                  </p>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`${
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-3">{review.comment}</p>
              <div className="flex gap-3">
                <button
                  className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                  onClick={() => handleModeration(review.id, "approve")}
                >
                  Approve
                </button>
                <button
                  className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                  onClick={() => handleModeration(review.id, "reject")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}

        {moderatedReviews.filter((r) => r.status === "pending").length ===
          0 && (
          <p className="text-center text-gray-500">
            No reviews pending moderation.
          </p>
        )}
      </div>
    </div>
  );
}
