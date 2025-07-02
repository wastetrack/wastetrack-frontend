import axios from 'axios';
import { LoginRequest, LoginResponse } from '../../../types/auth';
import { getTokenManager } from '@/lib/token-manager';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_DEVELOPMENT_API_URL || 'http://localhost:8000';

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

export const loginAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);

      const tokenManager = getTokenManager();
      tokenManager.storeTokens(response.data.data);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('Login Error:', error.response?.data);

        // Check for too many sessions error
        if (error.response?.data?.errors === 'Too many active sessions') {
          throw new Error('Too many active sessions');
        }

        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Invalid credentials';

        throw new Error(errorMessage);
      }
      console.log('Network Error:', error);
      throw new Error('Network error occurred. Please try again.');
    }
  },
};
