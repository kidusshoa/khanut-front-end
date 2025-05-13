import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import Cookies from "js-cookie";
import { handleLogout } from "@/lib/auth-utils";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

console.log("API URL configured as:", API_URL);

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("client-token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // For FormData, let the browser set the Content-Type with boundary
    if (config.data instanceof FormData) {
      // Remove Content-Type header to let browser set it with correct boundary
      delete config.headers["Content-Type"];

      // Log the request for debugging
      console.log("Sending FormData request:", {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: Object.fromEntries(config.data.entries()),
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if the error is due to token expiration
      const responseData = error.response?.data as Record<string, any>;
      const isTokenExpired =
        (responseData && responseData.code === "TOKEN_EXPIRED") ||
        (responseData?.message &&
          (responseData.message.includes("expired") ||
            responseData.message.includes("Token expired")));

      if (isTokenExpired) {
        console.log("Token expired, attempting to refresh...");
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshToken = Cookies.get("refresh-token");

          if (refreshToken) {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              token: refreshToken,
            });

            const { accessToken } = response.data;

            // Update the token in cookies
            Cookies.set("client-token", accessToken);

            // Update the Authorization header
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${accessToken}`;

            // Retry the original request
            return api(originalRequest);
          } else {
            console.log("No refresh token available, logging out");
            // No refresh token, logout
            await handleLogout();
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // Refresh token failed, logout
          await handleLogout();
          return Promise.reject(refreshError);
        }
      } else {
        // Other 401 error, not related to token expiration
        console.log(
          "Unauthorized error (not token expiration):",
          error.response?.data
        );
        await handleLogout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
