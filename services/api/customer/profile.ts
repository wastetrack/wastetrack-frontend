import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  phone_number: string;
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
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  carbon_deficit: number;
  water_saved: number;
  bags_stored: number;
  trees: number;
  user: User;
}

export interface UpdateCustomerProfileRequest {
  username?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  province?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface CustomerProfileResponse {
  data: CustomerProfile;
}

export interface UpdateCustomerProfileResponse {
  data: CustomerProfile;
}

// API Functions
export const customerProfileAPI = {
  // Get customer profile by user_id
  async getProfile(userId: string): Promise<CustomerProfileResponse> {
    try {
      // Log the API call for debugging
      // console.log('Making API call to:', `/api/customer/profiles/${userId}`);
      const response = await apiClient.get(`/api/customer/profiles/${userId}`);
      // console.log('Raw API response:', response);
      // console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        });
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch customer profile';
        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred while fetching customer profile');
    }
  },

  // Update customer profile by id
  async updateProfile(
    id: string,
    profileData: UpdateCustomerProfileRequest
  ): Promise<UpdateCustomerProfileResponse> {
    try {
      const response = await apiClient.put(
        `/api/customer/profiles/${id}`,
        profileData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to update customer profile';
        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred while updating customer profile');
    }
  },
};
