import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Only try to get token in browser environment
    if (typeof window !== 'undefined') {
      const tokenManager = getTokenManager();
      const token = await tokenManager.getValidAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Try to refresh token one more time
      const tokenManager = getTokenManager();
      const refreshedToken = await tokenManager.getValidAccessToken();

      if (refreshedToken && error.config && !error.config._retry) {
        error.config._retry = true;
        error.config.headers.Authorization = `Bearer ${refreshedToken}`;
        return apiClient.request(error.config);
      } else {
        // If refresh fails, logout
        tokenManager.logout();
      }
    }
    return Promise.reject(error);
  }
);

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar_url?: string;
  phone_number?: string;
  institution?: string;
  address?: string;
  city?: string;
  province?: string;
  points: number;
  balance: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  is_email_verified: boolean;
  access_token?: string;
  refresh_token?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IndustryProfile {
  id: string;
  user_id: string;
  total_waste_weight: number;
  total_recycled_weight: number;
  user?: UserResponse;
}

export interface IndustryProfileRequest {
  total_waste_weight?: number;
  total_recycled_weight?: number;
}

export interface IndustryProfileResponse {
  success: boolean;
  message: string;
  data: IndustryProfile;
}

// API Functions
export const industryProfileAPI = {
  // Get industry profile by user_id
  async getProfile(userId: string): Promise<IndustryProfileResponse> {
    try {
      const response = await apiClient.get(`/api/industry/profiles/${userId}`);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch industry profile';
        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred while fetching industry profile');
    }
  },
};
