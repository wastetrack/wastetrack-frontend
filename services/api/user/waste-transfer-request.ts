import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';
import {
  GetWasteTransferRequestsResponse,
  GetWasteTransferRequestByIdResponse,
  GetWasteTransferRequestsParams,
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

export const wasteTransferRequestAPI = {
  /**
   * Get waste transfer requests with filters (available for all roles)
   * GET /api/waste-transfer-requests
   */
  async getWasteTransferRequests(
    params?: GetWasteTransferRequestsParams
  ): Promise<GetWasteTransferRequestsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.source_user_id)
        queryParams.append('source_user_id', params.source_user_id);
      if (params?.destination_user_id)
        queryParams.append('destination_user_id', params.destination_user_id);
      if (params?.form_type) queryParams.append('form_type', params.form_type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.appointment_start_time)
        queryParams.append(
          'appointment_start_time',
          params.appointment_start_time
        );
      if (params?.appointment_end_time)
        queryParams.append('appointment_end_time', params.appointment_end_time);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.size) queryParams.append('size', params.size.toString());
      if (params?.latitude)
        queryParams.append('latitude', params.latitude.toString());
      if (params?.longitude)
        queryParams.append('longitude', params.longitude.toString());

      const queryString = queryParams.toString();
      const url = `/api/waste-transfer-requests${queryString ? `?${queryString}` : ''}`;

      const response = await authenticatedApiClient.get(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste transfer requests';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },

  /**
   * Get waste transfer request by ID (available for all roles)
   * GET /api/waste-transfer-requests/:id
   */
  async getWasteTransferRequestById(
    id: string
  ): Promise<GetWasteTransferRequestByIdResponse> {
    try {
      const response = await authenticatedApiClient.get(
        `/api/waste-transfer-requests/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch waste transfer request';

        throw new Error(errorMessage);
      }
      throw new Error('Network error occurred. Please try again.');
    }
  },
};
