import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';
import {
  WasteDropRequestStatusUpdateParams,
  UpdateWasteDropRequestStatusResponse,
  AssignCollectorResponse,
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

export const wasteBankDropRequestAPI = {
  /**
   * Update waste drop request status
   * PUT /api/waste-bank/waste-drop-requests/:id?status=:status
   */
  async updateWasteDropRequestStatus(
    id: string,
    params: WasteDropRequestStatusUpdateParams
  ): Promise<UpdateWasteDropRequestStatusResponse> {
    try {
      const response = await authenticatedApiClient.put(
        `/api/waste-bank/waste-drop-requests/${id}?status=${params.status}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to update waste drop request status';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Assign collector to waste drop request
   * PUT /api/waste-bank/waste-drop-requests/:id/assign-collector?collector_id=:collector_id
   */
  async assignCollectorToWasteDropRequest(
    id: string,
    collectorId: string
  ): Promise<AssignCollectorResponse> {
    try {
      const response = await authenticatedApiClient.put(
        `/api/waste-bank/waste-drop-requests/${id}/assign-collector?collector_id=${collectorId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to assign collector to waste drop request';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },
};
