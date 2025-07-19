// services/api/storage-item.ts

import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';
import {
  StorageItemListParams,
  StorageItemListResponse,
  StorageItemDetailResponse,
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

export const storageItemAPI = {
  /**
   * Get list of storage items with optional filtering and pagination
   */
  async getStorageItems(
    params?: StorageItemListParams
  ): Promise<StorageItemListResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Add all filtering parameters
      if (params?.storage_id) {
        queryParams.append('storage_id', params.storage_id);
      }
      if (params?.waste_type_id) {
        queryParams.append('waste_type_id', params.waste_type_id);
      }
      if (params?.order_by_weight_kgs) {
        queryParams.append('order_by_weight_kgs', params.order_by_weight_kgs);
      }

      // Pagination parameters
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.size) {
        queryParams.append('size', params.size.toString());
      }

      const queryString = queryParams.toString();
      const url = `/api/storage-items${queryString ? `?${queryString}` : ''}`;

      const response = await authenticatedApiClient.get(url);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch storage items';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Get storage item details by ID
   */
  async getStorageItemById(id: string): Promise<StorageItemDetailResponse> {
    try {
      const response = await authenticatedApiClient.get(
        `/api/storage-items/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch storage item details';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Get storage items for specific storage
   */
  async getStorageItemsByStorageId(
    storageId: string,
    params?: Omit<StorageItemListParams, 'storage_id'>
  ): Promise<StorageItemListResponse> {
    return this.getStorageItems({
      ...params,
      storage_id: storageId,
    });
  },

  /**
   * Get storage items by waste type
   */
  async getStorageItemsByWasteType(
    wasteTypeId: string,
    params?: Omit<StorageItemListParams, 'waste_type_id'>
  ): Promise<StorageItemListResponse> {
    return this.getStorageItems({
      ...params,
      waste_type_id: wasteTypeId,
    });
  },

  /**
   * Get storage items ordered by weight
   */
  async getStorageItemsOrderedByWeight(
    order: 'asc' | 'desc' = 'asc',
    params?: Omit<StorageItemListParams, 'order_by_weight_kgs'>
  ): Promise<StorageItemListResponse> {
    return this.getStorageItems({
      ...params,
      order_by_weight_kgs: order,
    });
  },
};
