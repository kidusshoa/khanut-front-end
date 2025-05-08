import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Update business profile
 */
export const updateBusinessProfile = async (profileData: any) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_URL}/api/businesses/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error("Failed to update business profile");
  }

  return response.json();
};

/**
 * Update business profile picture
 */
export const updateBusinessPicture = async (imageFile: File) => {
  const token = await getAuthToken();

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${API_URL}/api/businesses/picture`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to update business picture");
  }

  return response.json();
};

/**
 * Get business details
 */
export const getBusinessDetails = async (businessId: string) => {
  try {
    console.log("Fetching business details for ID:", businessId);

    const url = `${API_URL}/api/business/${businessId}`;
    console.log("Business details URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(
        "Business details endpoint failed:",
        response.status,
        response.statusText
      );
      throw new Error(
        `Failed to fetch business details: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Business details received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching business details:", error);
    throw error;
  }
};

/**
 * Get business status
 */
export const getBusinessStatus = async () => {
  const token = await getAuthToken();

  const response = await fetch(`${API_URL}/api/business/status`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch business status");
  }

  return response.json();
};

/**
 * Fetches business reviews by business ID
 * @param businessId The ID of the business to fetch reviews for
 * @returns Array of reviews
 */
export const getBusinessReviews = async (businessId: string) => {
  try {
    console.log("Fetching reviews for business ID:", businessId);

    const url = `${API_URL}/api/reviews/business/${businessId}`;
    console.log("Reviews URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(
        "Reviews endpoint failed:",
        response.status,
        response.statusText
      );
      return []; // Return empty array instead of throwing to handle gracefully
    }

    const data = await response.json();
    console.log("Reviews data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching business reviews:", error);
    return []; // Return empty array on error
  }
};

/**
 * Fetches business services by business ID
 * @param businessId The ID of the business to fetch services for
 * @returns Array of services
 */
export const getBusinessServices = async (businessId: string) => {
  try {
    console.log("Fetching services for business ID:", businessId);

    const url = `${API_URL}/api/services/business/${businessId}`;
    console.log("Services URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(
        "Services endpoint failed:",
        response.status,
        response.statusText
      );
      return []; // Return empty array instead of throwing
    }

    const data = await response.json();
    console.log("Services data received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching business services:", error);
    return []; // Return empty array on error
  }
};
