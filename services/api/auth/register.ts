import axios from 'axios';
import { getTokenManager } from '@/lib/token-manager';

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

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
  phone_number: string;
  institution?: string;
  address: string;
  city: string;
  province: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface RegisterResponse {
  data: {
    id: string;
    username: string;
    email: string;
    role: string;
    phone_number: string;
    institution?: string;
    address: string;
    city: string;
    province: string;
    points: number;
    balance: number;
    location: {
      latitude: number;
      longitude: number;
    };
    is_email_verified: boolean;
    created_at: string;
    updated_at: string;
  };
}

export const registerAPI = {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post('/api/auth/register', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          throw new Error(
            'Email sudah terdaftar. Silakan gunakan email lain atau login.'
          );
        }
        if (error.response?.status === 400) {
          throw new Error(
            error.response.data?.message || 'Data registrasi tidak valid'
          );
        }
        throw new Error(error.response?.data?.message || 'Registrasi gagal');
      }
      throw new Error('Terjadi kesalahan jaringan');
    }
  },
};
