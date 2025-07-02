import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { logoutApi } from '../../../services/api/logout-api/logout-api';
import { deleteCookie } from 'cookies-next';
import { AxiosError } from 'axios';

// Interface for logout result
export interface LogoutResult {
  success: boolean;
  message: string;
  redirected: boolean;
}

// Error handling utility
const handleLogoutError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ||
      error.message ||
      'Network error during logout'
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred during logout';
};

// Clear all authentication data
const clearAuthData = (): void => {
  try {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('session_id');
    localStorage.removeItem('access_token');

    // Clear sessionStorage
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');

    // Clear cookies
    deleteCookie('token');
    deleteCookie('refresh_token');
    deleteCookie('refreshToken'); // Legacy cookie name
    deleteCookie('access_token');

    // Clear any other auth-related data
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('lastLoginTime');
  } catch (error) {
    console.warn('Error clearing auth data:', error);
  }
};

// Broadcast logout to other tabs
const broadcastLogout = (): void => {
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('auth_sync');
      channel.postMessage({ type: 'LOGOUT' });
      channel.close();
    }
  } catch (error) {
    console.warn('Error broadcasting logout:', error);
  }
};

// Main logout function
export const handleLogout = async (
  router: AppRouterInstance
): Promise<LogoutResult> => {
  try {
    // Get refresh token from different possible sources
    const refreshToken =
      localStorage.getItem('refresh_token') ||
      localStorage.getItem('refreshToken') ||
      document.cookie
        .split('; ')
        .find((row) => row.startsWith('refresh_token='))
        ?.split('=')[1];

    // Attempt to logout from server if refresh token exists
    if (refreshToken) {
      try {
        await logoutApi(refreshToken);
      } catch (apiError) {
        // Log the API error but don't fail the logout process
        console.warn('Server logout failed:', handleLogoutError(apiError));
      }
    }

    // Always clear local data regardless of API success
    clearAuthData();

    // Broadcast logout to other tabs
    broadcastLogout();

    // Redirect to login page
    if (router && typeof router.push === 'function') {
      await router.push('/login');
    } else {
      // Fallback redirect
      window.location.href = '/login';
    }

    return {
      success: true,
      message: 'Logout successful',
      redirected: true,
    };
  } catch (error) {
    const errorMessage = handleLogoutError(error);
    console.error('Logout failed:', errorMessage);

    // Even if logout fails, clear local data for security
    clearAuthData();
    broadcastLogout();

    // Still redirect to login page
    try {
      if (router && typeof router.push === 'function') {
        await router.push('/login');
      } else {
        window.location.href = '/login';
      }
    } catch (redirectError) {
      console.error('Redirect failed:', redirectError);
    }

    return {
      success: false,
      message: errorMessage,
      redirected: true,
    };
  }
};

// Force logout (clears everything and redirects immediately)
export const forceLogout = (router?: AppRouterInstance): void => {
  console.warn('Force logout initiated');

  clearAuthData();
  broadcastLogout();

  // Immediate redirect
  if (router && typeof router.push === 'function') {
    try {
      router.push('/login');
    } catch (error) {
      console.error('Router redirect failed:', error);
      window.location.href = '/login';
    }
  } else {
    window.location.href = '/login';
  }
};

// Check if user is authenticated (useful for logout button visibility)
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;

  const refreshToken =
    localStorage.getItem('refresh_token') ||
    localStorage.getItem('refreshToken');
  const user = localStorage.getItem('user');

  return !!(refreshToken && user);
};

// Logout with confirmation (for UI components)
export const logoutWithConfirmation = async (
  router: AppRouterInstance,
  confirmMessage: string = 'Are you sure you want to logout?'
): Promise<LogoutResult | null> => {
  if (typeof window !== 'undefined' && window.confirm(confirmMessage)) {
    return await handleLogout(router);
  }
  return null;
};
