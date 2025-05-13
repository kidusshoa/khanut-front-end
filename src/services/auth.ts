import { LoginInput, RegisterInput } from "@/lib/validations/auth";
import api from "./api";

export const authService = {
  async register(data: RegisterInput) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async login(data: LoginInput) {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  async verify2FA(email: string, code: string) {
    const response = await api.post("/auth/verify-2fa", {
      email,
      code,
    });
    return response.data;
  },

  async resendCode(email: string) {
    const response = await api.post("/auth/request-2fa", {
      email,
    });
    return response.data;
  },

  async getUserRole(email: string) {
    const response = await api.post("/auth/get-role", {
      email,
    });
    return response.data;
  },

  async logout(refreshToken: string) {
    const response = await api.post("/auth/logout", {
      token: refreshToken,
    });
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post("/auth/refresh", {
      token: refreshToken,
    });
    return response.data;
  },

  // Get the current business status
  async getBusinessStatus() {
    const response = await api.get("/business/status");
    return response.data;
  },

  // Password reset methods
  async forgotPassword(email: string) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  async validateResetToken(token: string, userId: string) {
    const response = await api.post("/auth/validate-reset-token", {
      token,
      userId,
    });
    return response.data;
  },

  async resetPassword(token: string, userId: string, password: string) {
    const response = await api.post("/auth/reset-password", {
      token,
      userId,
      password,
    });
    return response.data;
  },
};
