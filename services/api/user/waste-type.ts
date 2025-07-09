import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';
import {
  WasteTypesListParams,
  WasteTypesListResponse,
  WasteTypeDetailResponse,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_DEVELOPMENT_API_URL || 'http://localhost:8000';

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

export const wasteTypeAPI = {
  /**
   * Get list of waste types with optional filtering and pagination
   */
  async getWasteTypes(
    params?: WasteTypesListParams
  ): Promise<WasteTypesListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.size) {
        queryParams.append('size', params.size.toString());
      }
      if (params?.category_id) {
        queryParams.append('category_id', params.category_id);
      }
      if (params?.subcategory_id) {
        queryParams.append('subcategory_id', params.subcategory_id);
      }

      const queryString = queryParams.toString();
      const url = `/api/waste-types${queryString ? `?${queryString}` : ''}`;

      const response = await authenticatedApiClient.get(url);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste types';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Get waste type details by ID
   */
  async getWasteTypeById(id: string): Promise<WasteTypeDetailResponse> {
    try {
      const response = await authenticatedApiClient.get(
        `/api/waste-types/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste type details';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },
};
