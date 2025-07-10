import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';
import {
  WasteCategoriesListParams,
  WasteCategoriesListResponse,
  WasteCategoryDetailResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Configure axios instance for authenticated requests
const authenticatedApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authenticated requests
authenticatedApiClient.interceptors.request.use(
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

// Response interceptor for authenticated requests
authenticatedApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Try to refresh token one more time
      const tokenManager = getTokenManager();
      const refreshedToken = await tokenManager.getValidAccessToken();

      if (refreshedToken && error.config && !error.config._retry) {
        error.config._retry = true;
        error.config.headers.Authorization = `Bearer ${refreshedToken}`;
        return authenticatedApiClient.request(error.config);
      } else {
        // If refresh fails, logout
        tokenManager.logout();
      }
    }
    return Promise.reject(error);
  }
);

export const wasteCategoryAPI = {
  /**
   * Get list of waste categories with optional filtering and pagination
   */ async getWasteCategories(
    params?: WasteCategoriesListParams
  ): Promise<WasteCategoriesListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.name) {
        queryParams.append('name', params.name);
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.size) {
        queryParams.append('size', params.size.toString());
      }

      const queryString = queryParams.toString();
      const url = `/api/waste-categories${queryString ? `?${queryString}` : ''}`;

      const response = await authenticatedApiClient.get(url);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste categories';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Get waste category details by ID
   */
  async getWasteCategoryById(id: string): Promise<WasteCategoryDetailResponse> {
    try {
      const response = await authenticatedApiClient.get(
        `/api/waste-categories/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste category details';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },
};
