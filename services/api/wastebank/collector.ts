import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';
import {
  CollectorManagementResponse,
  CollectorManagementListResponse,
  CollectorManagementParams,
  CreateCollectorManagementRequest,
  UpdateCollectorManagementRequest,
} from '@/types';

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

/**
 * Get list of collector managements with optional filtering
 * @param params Optional parameters for filtering
 * @returns List of collector managements
 */
export const getCollectorManagements = async (
  params?: CollectorManagementParams
): Promise<CollectorManagementListResponse> => {
  try {
    const response = await apiClient.get(
      '/api/waste-bank/collector-management',
      { params }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a specific collector management by ID
 * @param id The ID of the collector management to retrieve
 * @returns The collector management details
 */
export const getCollectorManagementById = async (
  id: string
): Promise<CollectorManagementResponse> => {
  try {
    const response = await apiClient.get(
      `/api/waste-bank/collector-management/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new collector management entry
 * @param data The collector management data to create
 * @returns The created collector management
 */
export const createCollectorManagement = async (
  data: CreateCollectorManagementRequest
): Promise<CollectorManagementResponse> => {
  try {
    const response = await apiClient.post(
      '/api/waste-bank/collector-management',
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing collector management
 * @param id The ID of the collector management to update
 * @param data The data to update
 * @returns The updated collector management
 */
export const updateCollectorManagement = async (
  id: string,
  data: UpdateCollectorManagementRequest
): Promise<CollectorManagementResponse> => {
  try {
    const response = await apiClient.put(
      `/api/waste-bank/collector-management/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a collector management
 * @param id The ID of the collector management to delete
 * @returns Success message
 */
export const deleteCollectorManagement = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete(
      `/api/waste-bank/collector-management/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
