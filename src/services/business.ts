import axios from 'axios'
import { BusinessRegistrationInput } from '@/lib/validations/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://khanut.onrender.com/api'

export const businessService = {
  async register(data: FormData) {
    const response = await axios.post(`${API_URL}/business/register`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async checkStatus() {
    const response = await axios.get(`${API_URL}/business/status`)
    return response.data
  },

  async getProfile() {
    const response = await axios.get(`${API_URL}/business/profile`)
    return response.data
  },

  async updateProfile(data: Partial<BusinessRegistrationInput>) {
    const response = await axios.put(`${API_URL}/business/profile`, data)
    return response.data
  },
}