import Cookies from 'js-cookie';

/**
 * Get the authentication token from cookies
 * @returns The authentication token or null if not found
 */
export const getAuthToken = async (): Promise<string | null> => {
  return Cookies.get('client-token') || null;
};

/**
 * Get the refresh token from cookies
 * @returns The refresh token or null if not found
 */
export const getRefreshToken = async (): Promise<string | null> => {
  return Cookies.get('refresh-token') || null;
};

/**
 * Get the user role from cookies
 * @returns The user role or null if not found
 */
export const getUserRole = (): string | null => {
  return Cookies.get('user-role') || null;
};

/**
 * Get the user ID from cookies
 * @returns The user ID or null if not found
 */
export const getUserId = (): string | null => {
  return Cookies.get('user-id') || null;
};

/**
 * Get the business ID from cookies (for business users)
 * @returns The business ID or null if not found
 */
export const getBusinessId = (): string | null => {
  return Cookies.get('businessId') || null;
};

/**
 * Check if the user is authenticated
 * @returns True if the user is authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return !!Cookies.get('client-token');
};

/**
 * Check if the user has a specific role
 * @param role The role to check
 * @returns True if the user has the specified role, false otherwise
 */
export const hasRole = (role: string): boolean => {
  const userRole = getUserRole();
  return userRole === role;
};
