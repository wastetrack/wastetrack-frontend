/**
 * Collector Profile API
 *
 * This module provides functions to interact with the waste collector profile API.
 * The API endpoint is: GET {{API_URL}}/api/waste-collector/profiles/:user_id
 *
 * @example
 * ```typescript
 * import { collectorProfileAPI } from '@/services/api/collector';
 *
 * // Get collector profile
 * const profile = await collectorProfileAPI.getProfile('user-id-123');
 * console.log(profile.data.user.username);
 *
 * // Get profile with error handling
 * const safeProfile = await collectorProfileAPI.getProfileSafe('user-id-123');
 * if (safeProfile) {
 *   console.log(safeProfile.user.email);
 * }
 * ```
 */

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
  (response) => {
    return response;
  },
  async (error) => {
    // Handle token refresh if needed
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const tokenManager = getTokenManager();
      const newToken = await tokenManager.getValidAccessToken();
      if (newToken) {
        // Retry the original request with new token
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

// Types for collector profile
export interface CollectorLocation {
  latitude: number;
  longitude: number;
}

export interface CollectorUser {
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
  location: CollectorLocation;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectorProfile {
  id: string;
  user_id: string;
  total_waste_weight: number;
  user: CollectorUser;
}

export interface CollectorProfileResponse {
  data: CollectorProfile;
}

// API functions
export const collectorProfileAPI = {
  /**
   * Get collector profile by user ID
   * @param userId - The user ID of the collector
   * @returns Promise<CollectorProfileResponse>
   */
  getProfile: async (userId: string): Promise<CollectorProfileResponse> => {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }

    const response = await apiClient.get<CollectorProfileResponse>(
      `/api/waste-collector/profiles/${userId}`
    );
    return response.data;
  },

  /**
   * Get collector profile with error handling
   * @param userId - The user ID of the collector
   * @returns Promise with profile data or null if error
   */
  getProfileSafe: async (userId: string): Promise<CollectorProfile | null> => {
    try {
      const response = await collectorProfileAPI.getProfile(userId);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch collector profile:', error);
      return null;
    }
  },
};

export default collectorProfileAPI;
