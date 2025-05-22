// Customer service API module

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CustomerProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  profilePicture?: string;
}

/**
 * Get customer profile by ID
 */
export async function getCustomerProfile(customerId: string): Promise<CustomerProfile> {
  const response = await fetch(`${API_URL}/api/customers/${customerId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch customer profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update customer profile
 */
export async function updateCustomerProfile(
  customerId: string, 
  profileData: ProfileUpdateData
): Promise<CustomerProfile> {
  const response = await fetch(`${API_URL}/api/customers/${customerId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update customer profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Upload profile picture
 */
export async function uploadProfilePicture(
  customerId: string,
  file: File
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/api/customer/profile/picture`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload profile picture: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get customer notification settings
 */
export async function getNotificationSettings(customerId: string): Promise<any> {
  const response = await fetch(`${API_URL}/api/customers/${customerId}/notifications`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch notification settings: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update customer notification settings
 */
export async function updateNotificationSettings(
  customerId: string,
  settings: any
): Promise<any> {
  const response = await fetch(`${API_URL}/api/customers/${customerId}/notifications`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error(`Failed to update notification settings: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get customer security settings
 */
export async function getSecuritySettings(customerId: string): Promise<any> {
  const response = await fetch(`${API_URL}/api/customers/${customerId}/security`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch security settings: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update customer password
 */
export async function updatePassword(
  customerId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean, message: string }> {
  const response = await fetch(`${API_URL}/api/customers/${customerId}/password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update password: ${response.statusText}`);
  }

  return response.json();
}

// Helper function to get auth token from cookies
function getAuthToken(): string | undefined {
  try {
    // For client-side code
    if (typeof document !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      return token;
    }
    // For server-side code, but we'll avoid using server components here
    // as this is primarily a client-side service
    return undefined;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return undefined;
  }
}

// Export as an object for easier imports
export const customerService = {
  getCustomerProfile,
  updateCustomerProfile,
  uploadProfilePicture,
  getNotificationSettings,
  updateNotificationSettings,
  getSecuritySettings,
  updatePassword,
};
