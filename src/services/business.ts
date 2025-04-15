import axios from "axios";
import { BusinessRegistrationInput } from "@/lib/validations/business";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const businessService = {
  async register(formData: FormData) {
    const response = await axios.post(
      `${API_URL}/business/register`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // Important for auth
      }
    );
    return response.data;
  },

  async checkRegistrationStatus() {
    const response = await axios.get(`${API_URL}/business/status`, {
      withCredentials: true,
    });
    return response.data;
  },
};
