import { AxiosError } from "axios";
import { toast } from "react-hot-toast";

/**
 * Handles API errors in a consistent way
 * 
 * @param error The error to handle
 * @param defaultMessage The default message to show if the error doesn't have a message
 * @returns The error message
 */
export const handleApiError = (error: any, defaultMessage = "An error occurred"): string => {
  console.error("API Error:", error);
  
  let errorMessage = defaultMessage;
  
  if (error instanceof AxiosError) {
    // Handle Axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = error.response.data?.message || 
                    error.response.data?.error || 
                    `Error ${error.response.status}: ${error.response.statusText}`;
      
      console.error("Response error data:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = "No response received from server. Please check your network connection.";
      console.error("Request error:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message || defaultMessage;
    }
  } else if (error instanceof Error) {
    // Handle regular errors
    errorMessage = error.message || defaultMessage;
  }
  
  // Show toast notification
  toast.error(errorMessage);
  
  return errorMessage;
};

/**
 * Safely parses JSON from a string
 * 
 * @param jsonString The JSON string to parse
 * @param fallback The fallback value to return if parsing fails
 * @returns The parsed JSON or the fallback value
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return fallback;
  }
};
