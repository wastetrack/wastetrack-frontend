import axios from 'axios';

export const logoutApi = async (refreshToken: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
      { refresh_token: refreshToken }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
