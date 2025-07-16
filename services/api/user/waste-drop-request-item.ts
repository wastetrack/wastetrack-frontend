import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';
import {
  WasteDropRequestItem,
  WasteDropRequestItemListParams,
  WasteDropRequestItemListResponse,
  WasteDropRequestItemDetailResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

// ===== API FUNCTIONS =====
export const wasteDropRequestItemAPI = {
  /**
   * Get list of waste drop request items with optional filtering and pagination
   */
  async getWasteDropRequestItems(
    params: WasteDropRequestItemListParams
  ): Promise<WasteDropRequestItemListResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Required parameter
      queryParams.append('request_id', params.request_id);

      // Pagination parameters
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params.size) {
        queryParams.append('size', params.size.toString());
      }

      // Sorting parameters
      if (params.sort_by) {
        queryParams.append('sort_by', params.sort_by);
      }
      if (params.sort_order) {
        queryParams.append('sort_order', params.sort_order);
      }

      const queryString = queryParams.toString();
      const url = `/api/waste-drop-request-items${queryString ? `?${queryString}` : ''}`;

      const response = await authenticatedApiClient.get(url);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste drop request items';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Get waste drop request item details by ID
   */
  async getWasteDropRequestItemById(
    id: string
  ): Promise<WasteDropRequestItemDetailResponse> {
    try {
      const response = await authenticatedApiClient.get(
        `/api/waste-drop-request-items/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste drop request item details';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Get waste drop request items for specific request (convenience method)
   */
  async getItemsByRequestId(
    requestId: string,
    params?: Omit<WasteDropRequestItemListParams, 'request_id'>
  ): Promise<WasteDropRequestItemListResponse> {
    return this.getWasteDropRequestItems({
      ...params,
      request_id: requestId,
    });
  },

  /**
   * Get waste drop request items with verified weights only
   */
  async getVerifiedItems(
    requestId: string,
    params?: Omit<WasteDropRequestItemListParams, 'request_id'>
  ): Promise<WasteDropRequestItem[]> {
    const response = await this.getWasteDropRequestItems({
      ...params,
      request_id: requestId,
    });

    // Filter items that have been verified (weight > 0)
    return response.data.filter((item) => item.verified_weight > 0);
  },

  /**
   * Get total verified subtotal for a request
   */
  async getTotalVerifiedValue(requestId: string): Promise<number> {
    const response = await this.getWasteDropRequestItems({
      request_id: requestId,
      size: 1000, // Get all items
    });

    return response.data.reduce(
      (total, item) => total + item.verified_subtotal,
      0
    );
  },

  /**
   * Get waste drop request items sorted by quantity (highest first)
   */
  async getItemsSortedByQuantity(
    requestId: string,
    params?: Omit<
      WasteDropRequestItemListParams,
      'request_id' | 'sort_by' | 'sort_order'
    >
  ): Promise<WasteDropRequestItemListResponse> {
    return this.getWasteDropRequestItems({
      ...params,
      request_id: requestId,
      sort_by: 'quantity',
      sort_order: 'desc',
    });
  },

  /**
   * Get waste drop request items sorted by verified weight (highest first)
   */
  async getItemsSortedByWeight(
    requestId: string,
    params?: Omit<
      WasteDropRequestItemListParams,
      'request_id' | 'sort_by' | 'sort_order'
    >
  ): Promise<WasteDropRequestItemListResponse> {
    return this.getWasteDropRequestItems({
      ...params,
      request_id: requestId,
      sort_by: 'verified_weight',
      sort_order: 'desc',
    });
  },

  /**
   * Get waste drop request items sorted by subtotal (highest first)
   */
  async getItemsSortedByValue(
    requestId: string,
    params?: Omit<
      WasteDropRequestItemListParams,
      'request_id' | 'sort_by' | 'sort_order'
    >
  ): Promise<WasteDropRequestItemListResponse> {
    return this.getWasteDropRequestItems({
      ...params,
      request_id: requestId,
      sort_by: 'verified_subtotal',
      sort_order: 'desc',
    });
  },
};
