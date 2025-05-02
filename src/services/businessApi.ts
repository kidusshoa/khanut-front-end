import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Update business profile
 */
export const updateBusinessProfile = async (profileData: any) => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/api/businesses/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update business profile');
  }
  
  return response.json();
};

/**
 * Update business profile picture
 */
export const updateBusinessPicture = async (imageFile: File) => {
  const token = await getAuthToken();
  
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch(`${API_URL}/api/businesses/picture`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to update business picture');
  }
  
  return response.json();
};

/**
 * Get business details
 */
export const getBusinessDetails = async (businessId: string) => {
  const response = await fetch(`${API_URL}/api/businesses/${businessId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch business details');
  }
  
  return response.json();
};

/**
 * Get business status
 */
export const getBusinessStatus = async () => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/api/business/status`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch business status');
  }
  
  return response.json();
};
