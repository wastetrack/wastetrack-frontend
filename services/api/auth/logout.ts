import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_DEVELOPMENT_API_URL || 'http://localhost:8000';

export const logoutAPI = async (refreshToken: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/logout`,
      { refresh_token: refreshToken }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
