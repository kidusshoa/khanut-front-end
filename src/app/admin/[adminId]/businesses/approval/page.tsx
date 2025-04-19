"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface Business {
  id: string;
  _id: string;
  name: string;
  owner: string;
  status: "pending" | "approved" | "rejected";
  location: string;
  description: string;
  legalDoc: string;
  createdAt: string;
}

export default function ApprovalPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch pending businesses
  useEffect(() => {
    const fetchPendingBusinesses = async () => {
      try {
        const accessToken = Cookies.get("client-token");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/businesses/approval`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const pendingBusinesses = response.data.businesses.map((biz: any) => ({
          id: biz._id,
          _id: biz._id,
          name: biz.name,
          owner: biz.ownerId || "Unknown",
          status: "pending",
          location: biz.city || "Unknown location",
          description: biz.description || "No description provided",
          legalDoc: biz.legalDoc || "#",
          createdAt: biz.createdAt,
        }));

        setBusinesses(pendingBusinesses);
      } catch (err) {
        console.error("Failed to fetch pending businesses:", err);
        setError("Failed to load pending businesses");

        if (axios.isAxiosError(err) && err.response?.status === 401) {
          Cookies.remove("client-token");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBusinesses();
  }, [router]);

  const handleApprove = async (businessId: string) => {
    try {
      const accessToken = Cookies.get("client-token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/businesses/${businessId}/approve`,
        {}, // Empty body since we're just changing status
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setBusinesses(businesses.filter((b) => b.id !== businessId));
    } catch (err) {
      console.error("Failed to approve business:", err);
      setError("Failed to approve business. Please try again.");
    }
  };

  const handleReject = async (businessId: string) => {
    try {
      const accessToken = Cookies.get("client-token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/businesses/${businessId}/reject`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setBusinesses(businesses.filter((b) => b.id !== businessId));
    } catch (err) {
      console.error("Failed to reject business:", err);
      setError("Failed to reject business. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading pending businesses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-orange-600">
        Business Approvals
      </h1>

      {businesses.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">
          <p>No pending businesses to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map((business) => (
            <div key={business.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{business.name}</h2>
                  <p className="text-gray-600">Owner: {business.owner}</p>
                  <p className="text-gray-600">Location: {business.location}</p>
                  <p className="text-gray-600 mt-2">{business.description}</p>
                </div>
                <div className="text-sm text-gray-500">
                  Submitted: {new Date(business.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <a
                  href={business.legalDoc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline"
                >
                  View Legal Documents
                </a>

                <div className="space-x-2">
                  <button
                    onClick={() => handleApprove(business.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(business.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
