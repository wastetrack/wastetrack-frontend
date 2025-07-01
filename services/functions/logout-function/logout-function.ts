import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { logoutApi } from '../../api/logout-api/logout-api';
import { deleteCookie } from 'cookies-next';

export const handleLogout = async (router: AppRouterInstance) => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await logoutApi(refreshToken);
    }
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    deleteCookie('token');
    deleteCookie('refreshToken');
    
    // Redirect to login page
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};
