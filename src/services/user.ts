import axios from "axios";
import { getAccessToken } from "@/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const userService = {
  async getCustomerProfile() {
    try {
      const accessToken = await getAccessToken();
      const response = await axios.get(`${API_URL}/customer/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      throw error;
    }
  },

  async updateCustomerProfile(data: { name?: string; currentPassword?: string; newPassword?: string }) {
    try {
      const accessToken = await getAccessToken();
      const response = await axios.patch(`${API_URL}/customer/profile`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating customer profile:", error);
      throw error;
    }
  },

  async updateProfilePicture(formData: FormData) {
    try {
      const accessToken = await getAccessToken();
      const response = await axios.patch(`${API_URL}/customer/profile/picture`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating profile picture:", error);
      throw error;
    }
  },
};
