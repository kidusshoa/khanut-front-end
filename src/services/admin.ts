// Admin service API module

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string;
    }
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  notificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProfileUpdateData {
  name?: string;
  email?: string;
  notificationsEnabled?: boolean;
  twoFactorEnabled?: boolean;
}

export interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
}

export interface NewAdminData {
  name: string;
  email: string;
  password: string;
}

// Helper function to get auth token from cookies
function getAuthToken(): string | undefined {
  try {
    // For client-side code
    if (typeof document !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('client-token='))
        ?.split('=')[1];
      return token;
    }
    return undefined;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return undefined;
  }
}

/**
 * Get admin profile
 */
export async function getAdminProfile(): Promise<AdminProfile> {
  const response = await fetch(`${API_URL}/api/admin/settings/profile`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch admin profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update admin profile
 */
export async function updateAdminProfile(
  profileData: AdminProfileUpdateData
): Promise<AdminProfile> {
  const response = await fetch(`${API_URL}/api/admin/settings/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update admin profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Change admin password
 */
export async function changeAdminPassword(
  passwordData: PasswordChangeData
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/admin/settings/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    throw new Error(`Failed to change password: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Add new admin
 */
export async function addNewAdmin(
  adminData: NewAdminData
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/admin/settings/new-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(adminData),
  });

  if (!response.ok) {
    throw new Error(`Failed to add new admin: ${response.statusText}`);
  }

  return response.json();
}

const adminService = {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  addNewAdmin,
};

export default adminService;
