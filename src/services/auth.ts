import axios from "axios";
import { LoginInput, RegisterInput } from "@/lib/validations/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://khanut.onrender.com/api";

export const authService = {
  async register(data: RegisterInput) {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },

  async login(data: LoginInput) {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    return response.data;
  },

  async verify2FA(email: string, code: string) {
    const response = await axios.post(`${API_URL}/auth/verify`, {
      email,
      code,
    });
    return response.data;
  },

  async resendCode(email: string) {
    const response = await axios.post(`${API_URL}/auth/resend-code`, {
      email,
    });
    return response.data;
  },

  async logout() {
    const response = await axios.post(`${API_URL}/auth/logout`);
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken,
    });
    return response.data;
  },
};
