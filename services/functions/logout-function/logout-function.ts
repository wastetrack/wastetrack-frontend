import { logoutApi } from '../../api/logout-api/logout-api';
import { deleteCookie } from 'cookies-next';
// import { AppRouterInstance } from 'next/navigation';

export const handleLogout = async (router: any) => {
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
    router.push('/auth/login');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};
