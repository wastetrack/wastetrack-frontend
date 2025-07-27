import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';
import {
  CreateStorageItemParams,
  CreateStorageItemResponse,
  UpdateStorageItemParams,
  UpdateStorageItemResponse,
  DeductWeightParams,
  DeductWeightResponse,
  DeleteStorageItemResponse,
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

export const wasteBankStorageItemsAPI = {
  /**
   * Create or add weight to storage item
   * POST /api/waste-bank/storage-items
   *
   * Note: Jika sudah ada kombinasi storage_id + waste_type_id di database,
   * maka weight_kgs akan ditambahkan ke data existing.
   * Response weight_kgs bisa berbeda dari request jika data sudah ada sebelumnya.
   */
  async createStorageItem(
    params: CreateStorageItemParams
  ): Promise<CreateStorageItemResponse> {
    try {
      const response = await authenticatedApiClient.post(
        '/api/waste-bank/storage-items',
        params
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to create storage item';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Update storage item
   * PUT /api/waste-bank/storage-items/:id
   */
  async updateStorageItem(
    id: string,
    params: UpdateStorageItemParams
  ): Promise<UpdateStorageItemResponse> {
    try {
      const response = await authenticatedApiClient.put(
        `/api/waste-bank/storage-items/${id}`,
        params
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to update storage item';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Deduct weight from storage item
   * PUT /api/waste-bank/storage-items/:id/deduct-weight
   */
  async deductWeight(
    id: string,
    params: DeductWeightParams
  ): Promise<DeductWeightResponse> {
    try {
      const response = await authenticatedApiClient.put(
        `/api/waste-bank/storage-items/${id}/deduct-weight`,
        params
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to deduct weight from storage item';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Delete storage item
   * DELETE /api/waste-bank/storage-items/:id
   */
  async deleteStorageItem(id: string): Promise<DeleteStorageItemResponse> {
    try {
      const response = await authenticatedApiClient.delete(
        `/api/waste-bank/storage-items/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to delete storage item';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },
};
