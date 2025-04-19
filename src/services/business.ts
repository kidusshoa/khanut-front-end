// Business API service
import api from "./api";

export const businessService = {
  async register(formData: FormData) {
    const response = await api.post(`/businesses/register`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async checkRegistrationStatus() {
    const response = await api.get(`/businesses/status`);
    return response.data;
  },
};
