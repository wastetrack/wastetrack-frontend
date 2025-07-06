import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_DEVELOPMENT_API_URL || 'http://localhost:8000';

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

// Types & Interfaces
export interface WasteBankProfile {
  id: string;
  user_id: string;
  username: string;
  email: string;
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
  business_license: string;
  operating_hours: {
    open: string;
    close: string;
  };
  waste_types_accepted: string[];
  created_at: string;
  updated_at: string;
}

export interface UpdateWasteBankProfileRequest {
  username?: string;
  email?: string;
  phone_number?: string;
  institution?: string;
  address?: string;
  city?: string;
  province?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  business_license?: string;
  operating_hours?: {
    open: string;
    close: string;
  };
  waste_types_accepted?: string[];
}

export interface WasteBankProfileResponse {
  success: boolean;
  message: string;
  data: WasteBankProfile;
}

export interface UpdateWasteBankProfileResponse {
  success: boolean;
  message: string;
  data: WasteBankProfile;
}

// API Functions
export const wasteBankProfileAPI = {
  // Get waste bank profile by user_id
  async getProfile(userId: string): Promise<WasteBankProfileResponse> {
    try {
      const response = await apiClient.get(
        `/api/waste-bank/profiles/${userId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste bank profile';
        throw new Error(errorMessage);
      }
      throw new Error(
        'Network error occurred while fetching waste bank profile'
      );
    }
  },

  // Update waste bank profile by id
  async updateProfile(
    id: string,
    profileData: UpdateWasteBankProfileRequest
  ): Promise<UpdateWasteBankProfileResponse> {
    try {
      const response = await apiClient.put(
        `/api/waste-bank/profiles/${id}`,
        profileData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to update waste bank profile';
        throw new Error(errorMessage);
      }
      throw new Error(
        'Network error occurred while updating waste bank profile'
      );
    }
  },
};
