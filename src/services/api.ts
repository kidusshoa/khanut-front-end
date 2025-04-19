import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import Cookies from "js-cookie";
import { handleLogout } from "@/lib/auth-utils";

const API_URL =
  `${process.env.NEXT_PUBLIC_API_URL}/api` || "http://localhost:4000/api";

// Create a custom axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("client-token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
          // No refresh token, logout
          await handleLogout();
        }
      } catch (refreshError) {
        // Refresh token failed, logout
        await handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
