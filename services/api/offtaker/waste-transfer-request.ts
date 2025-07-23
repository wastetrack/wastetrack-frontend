import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';
import {
  WasteTransferStatusUpdateParams,
  UpdateTransferStatusResponse,
  AssignCollectorParams,
  AssignCollectorToTransferResponse,
  CompleteWasteTransferParams,
  CompleteWasteTransferResponse,
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

export const industryTransferRequestAPI = {
  /**
   * Update industry waste transfer request status
   * PUT /api/industry/waste-transfer-requests/:id?status=:status
   */
  async updateWasteTransferRequestStatus(
    id: string,
    params: WasteTransferStatusUpdateParams
  ): Promise<UpdateTransferStatusResponse> {
    try {
      const response = await authenticatedApiClient.put(
        `/api/industry/waste-transfer-requests/${id}?status=${params.status}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to update waste transfer request status';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  async assignCollectorToWasteTransferRequest(
    id: string,
    params: AssignCollectorParams
  ): Promise<AssignCollectorToTransferResponse> {
    try {
      const response = await authenticatedApiClient.put(
        `/api/industry/waste-transfer-requests/${id}/assign-collector`,
        params
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to assign collector to waste transfer request';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Complete industry waste transfer request
   * PUT /api/waste-bank/waste-transfer-requests/:id/complete
   */
  async completeWasteTransferRequest(
    id: string,
    params: CompleteWasteTransferParams
  ): Promise<CompleteWasteTransferResponse> {
    try {
      const response = await authenticatedApiClient.put(
        `/api/industry/waste-transfer-requests/${id}/complete`,
        params
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to complete waste transfer request';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },
};
