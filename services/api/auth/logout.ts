// Di logout.ts
import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const logoutAPI = async (refreshToken: string) => {
  try {
    const tokenManager = getTokenManager();
    const validAccessToken = await tokenManager.getValidAccessToken();

    if (!validAccessToken) {
      return { success: false, reason: 'no_valid_access_token' };
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/auth/logout`,
      { refresh_token: refreshToken },
      {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validAccessToken}`,
        },
      }
    );

    console.log('Logout Berhasil');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend logout failed:', error);

    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }

    return { success: false, error };
  }
};
