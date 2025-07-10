import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Configure axios instance for refresh
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface RefreshTokenResponse {
  data: {
    id: string;
    username: string;
    email: string;
    role: string;
    phone_number: string;
    institution: string;
    address: string;
    city: string;
    province: string;
    points: number;
    balance: number;
    location: {
      latitude: number;
      longitude: number;
    };
    is_email_verified: boolean;
    access_token: string;
    refresh_token: string;
    created_at: string;
    updated_at: string;
  };
}

export const refreshAPI = {
  async refreshToken(
    refreshToken: string,
    accessToken: string
  ): Promise<RefreshTokenResponse> {
    try {
      const response = await refreshClient.post(
        '/api/auth/refresh-token',
        {
          refresh_token: refreshToken,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Token refresh failed';
        throw new Error(message);
      }
      throw new Error('Network error occurred during token refresh');
    }
  },
};
