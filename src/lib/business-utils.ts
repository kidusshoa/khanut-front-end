import api from "@/services/api";
import Cookies from "js-cookie";

/**
 * Get the authentication token from cookies or localStorage
 * @returns The authentication token or null if not found
 */
const getAuthToken = async (): Promise<string | null> => {
  // Try to get the token from cookies first
  const cookieToken = Cookies.get("client-token");
  if (cookieToken) {
    return cookieToken;
  }

  // Then try localStorage
  if (typeof window !== "undefined") {
    const localToken = localStorage.getItem("accessToken");
    if (localToken) {
      // If found in localStorage but not in cookies, set it in cookies for consistency
      Cookies.set("client-token", localToken, { expires: 7 });
      return localToken;
    }
  }

  // If no token is found, return null
  return null;
};

/**
 * Gets the correct business ID for the current user
 * This handles the case where the URL business ID might not match the actual business ID
 *
 * @param urlBusinessId The business ID from the URL
 * @returns The correct business ID
 */
export const getCorrectBusinessId = async (
  urlBusinessId: string
): Promise<string> => {
  try {
    // First try to get the business ID from the business status API
    const token = await getAuthToken();

    if (!token) {
      console.log("No auth token available, using URL business ID");
      return urlBusinessId;
    }

    try {
      console.log("Fetching business ID from status API...");
      const response = await api.get("/business/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.businessId) {
        const statusBusinessId = response.data.businessId;
        console.log(
          "Got business ID from status API:",
          statusBusinessId,
          "URL business ID:",
          urlBusinessId
        );

        // Store the correct business ID in localStorage for future use
        if (typeof window !== "undefined") {
          localStorage.setItem("correctBusinessId", statusBusinessId);
          console.log(
            "Stored correct business ID in localStorage:",
            statusBusinessId
          );
        }

        return statusBusinessId;
      }
    } catch (statusError) {
      console.warn("Failed to get business ID from status API:", statusError);
      // Continue with URL business ID
    }

    // Check if we have a stored correct business ID
    if (typeof window !== "undefined") {
      const storedBusinessId = localStorage.getItem("correctBusinessId");
      if (storedBusinessId) {
        console.log("Using stored correct business ID:", storedBusinessId);
        return storedBusinessId;
      }
    }

    // If we couldn't get the business ID from the status API, try to verify the URL business ID
    try {
      console.log("Verifying business ID from URL:", urlBusinessId);
      const response = await api.get(`/businesses/${urlBusinessId}`);
      if (response.status === 200) {
        console.log("Verified business ID from URL:", urlBusinessId);
        return urlBusinessId;
      }
    } catch (verifyError) {
      console.warn("Failed to verify business ID from URL:", verifyError);
      // Continue with URL business ID as fallback
    }

    // Return the URL business ID as a fallback
    console.log("Using URL business ID as fallback:", urlBusinessId);
    return urlBusinessId;
  } catch (error) {
    console.error("Error in getCorrectBusinessId:", error);
    return urlBusinessId;
  }
};
