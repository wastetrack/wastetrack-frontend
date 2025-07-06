import { loginAPI } from '@/services/api/auth';
import { showToast } from '@/components/ui';
import { LoginRequest } from '@/types';
import { getTokenManager } from '@/lib/token-manager';
import { emailVerificationAPI } from '@/services/api/auth';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { jwtDecode } from 'jwt-decode';
import { AxiosError } from 'axios';

// Types and interfaces
export interface LoginResponse {
  success: boolean;
  data?: {
    access_token: string;
    refresh_token: string;
    role: string;
    is_email_verified: boolean;
    [key: string]: unknown;
  };
  message?: string;
  needsVerification?: boolean;
  invalidCredentials?: boolean;
  tooManySessions?: boolean;
}

export interface JWTPayload {
  iat: number;
  nbf: number;
  exp: number;
  role: string;
  email?: string;
  sub?: string;
}

// Error handling utility
const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message || error.message || 'Network error occurred'
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const loginFunctions = {
  async handleLogin(
    credentials: LoginRequest,
    router: AppRouterInstance
  ): Promise<LoginResponse> {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        showToast.error('Input Error', {
          description: 'Email dan password harus diisi',
        });
        return { success: false, message: 'Email dan password harus diisi' };
      }

      // Clear any potential URL parameters that might contain credentials
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('email') || url.searchParams.has('password')) {
          window.history.replaceState({}, '', url.pathname);
        }
      }

      const response = await loginAPI.login(credentials);

      // Validate response structure
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Case 1: Successful login with verified email
      if (response.data.access_token && response.data.is_email_verified) {
        const tokenManager = getTokenManager();

        // Store tokens with proper validation
        tokenManager.storeTokens({
          ...response.data,
          role: response.data.role, // Ensure role is included
        });

        const redirectPath = this.getRoleBasedRedirect(response.data.role);

        // Decode and validate JWT token
        try {
          const decoded: JWTPayload = jwtDecode(response.data.access_token);
          const issuedAt = new Date(decoded.iat * 1000);
          const notBefore = new Date(decoded.nbf * 1000);
          const expiresAt = new Date(decoded.exp * 1000);
          const timeUntilExpiry = Math.round(
            (decoded.exp * 1000 - Date.now()) / 1000 / 60
          );

          // Debug log for development
          if (process.env.NODE_ENV === 'development') {
            console.log('JWT Info:', {
              role: decoded.role,
              issuedAt: issuedAt.toLocaleString(),
              notBefore: notBefore.toLocaleString(),
              expiresAt: expiresAt.toLocaleString(),
              timeUntilExpiry: timeUntilExpiry + ' minutes',
            });
          }

          // Validate token expiry
          if (decoded.exp * 1000 <= Date.now()) {
            throw new Error('Token already expired');
          }
        } catch (jwtError) {
          console.error('JWT decode error:', jwtError);
          // Continue with login even if JWT decode fails
        }

        // Show success alert and redirect
        try {
          showToast.success('Login Berhasil! Selamat datang kembali!');
          this.performRedirect(router, redirectPath);
        } catch (alertError) {
          console.error('Alert error:', alertError);
          // Fallback redirect even if alert fails
          this.performRedirect(router, redirectPath);
        }

        return { success: true, data: response.data };
      }

      // Case 2: Login successful but email not verified
      if (response.data.access_token && !response.data.is_email_verified) {
        return await this.handleEmailNotVerified(credentials.email);
      }

      // Case 3: Login failed - no access token
      throw new Error('Login failed: Invalid credentials or server error');
    } catch (error: unknown) {
      console.error('Login error:', error);
      return await this.handleLoginError(error, credentials.email);
    }
  },

  async handleEmailNotVerified(email: string): Promise<LoginResponse> {
    // Show warning showToast for unverified email
    showToast.error('Email Belum Diverifikasi', {
      description: `Email ${email} belum diverifikasi. Silakan cek email Anda untuk link verifikasi.`,
    });

    // Optionally try to resend verification automatically
    try {
      const resendResponse =
        await emailVerificationAPI.resendVerification(email);
      if (resendResponse.success) {
        showToast.success('Email Verifikasi Terkirim', {
          description:
            'Silakan cek email Anda untuk link verifikasi yang baru.',
        });
      } else {
        showToast.error('Gagal Mengirim Email', {
          description: resendResponse.message,
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      showToast.error('Error', {
        description: 'Gagal mengirim ulang email verifikasi',
      });
    }

    return { success: false, needsVerification: true };
  },

  async handleInvalidCredentials(): Promise<LoginResponse> {
    showToast.error('Email atau password salah. Silakan coba lagi.');
    return { success: false, invalidCredentials: true };
  },

  // Helper method for redirecting
  performRedirect(router: AppRouterInstance, path: string): void {
    try {
      if (router && typeof router.push === 'function') {
        router.push(path);
      } else {
        window.location.href = path; // Fallback if router is not available
      }
    } catch (error) {
      console.error('Redirect error:', error);
      window.location.href = path; // Final fallback
    }
  },

  async handleLoginError(
    error: unknown,
    email?: string
  ): Promise<LoginResponse> {
    const errorMessage = handleApiError(error);

    // Handle specific error cases
    if (error instanceof AxiosError) {
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        return await this.handleInvalidCredentials();
      }

      // Handle too many sessions
      if (error.response?.data?.errors === 'Too many active sessions') {
        showToast.error('Terlalu Banyak Sesi', {
          description:
            'Anda telah mencapai batas maksimal sesi aktif (5 sesi). Silakan logout dari perangkat lain.',
        });
        return { success: false, tooManySessions: true };
      }

      // Handle specific API error messages
      if (error.response?.data?.message) {
        showToast.error('Login Error', {
          description: error.response.data.message,
        });
        return { success: false, message: error.response.data.message };
      }
    }

    const normalizedError = errorMessage.toLowerCase();

    // Case 1: Email not verified error from API
    if (
      normalizedError.includes('email not verified') ||
      normalizedError.includes('email belum diverifikasi') ||
      normalizedError.includes('not verified') ||
      normalizedError.includes('belum diverifikasi') ||
      normalizedError.includes('please verify') ||
      normalizedError.includes('unverified email') ||
      normalizedError.includes('email verification required')
    ) {
      if (email) {
        return await this.handleEmailNotVerified(email);
      }
      return { success: false, needsVerification: true };
    }

    // Case 2: Invalid credentials (email not found OR wrong password)
    if (
      normalizedError.includes('user not found') ||
      normalizedError.includes('email not found') ||
      normalizedError.includes('invalid password') ||
      normalizedError.includes('wrong password') ||
      normalizedError.includes('password salah') ||
      normalizedError.includes('invalid credentials') ||
      normalizedError.includes('authentication failed') ||
      normalizedError.includes('login failed') ||
      normalizedError.includes('unauthorized') ||
      normalizedError.includes('bad credentials')
    ) {
      return await this.handleInvalidCredentials();
    }

    // Case 3: Network or server errors
    if (
      normalizedError.includes('network') ||
      normalizedError.includes('connection') ||
      normalizedError.includes('timeout') ||
      normalizedError.includes('server error') ||
      normalizedError.includes('internal server error')
    ) {
      showToast.error('Koneksi Bermasalah', {
        description: 'Periksa koneksi internet Anda dan coba lagi.',
      });
      return { success: false, message: 'Network or server error' };
    }

    // Default error handling
    showToast.error('Ada Kendala', {
      description: 'Terjadi kesalahan saat login. Silakan coba lagi.',
    });
    return { success: false, message: errorMessage };
  },

  /**
   * Check if user is already authenticated and redirect to appropriate dashboard
   * @param router Next.js router instance
   * @returns boolean indicating if user was redirected
   */
  checkAndRedirectIfAuthenticated(router: AppRouterInstance): boolean {
    try {
      const tokenManager = getTokenManager();
      const user = tokenManager.getCurrentUser();
      const isAuthenticated = tokenManager.isAuthenticated();

      if (user && isAuthenticated && user.role) {
        const redirectPath = this.getRoleBasedRedirect(user.role);

        // Use replace instead of push to prevent going back to login page
        if (router && typeof router.replace === 'function') {
          router.replace(redirectPath);
        } else {
          window.location.href = redirectPath;
        }

        return true;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }

    return false;
  },

  getRoleBasedRedirect(role: string): string {
    // Define role routes with validation
    const routes: Record<string, string> = {
      customer: '/customer/dashboard',
      waste_collector_central: '/collector-central/dashboard',
      waste_collector_unit: '/collector-unit/dashboard',
      industry: '/offtaker/dashboard',
      waste_bank_central: '/wastebank-central',
      waste_bank_unit: '/wastebank-unit',
    };

    // Normalize and validate role
    if (!role || typeof role !== 'string') {
      console.error('Invalid role provided:', role);
      return '/dashboard'; // fallback
    }

    const normalizedRole = role.toLowerCase().trim();
    const path = routes[normalizedRole];

    if (!path) {
      console.error('Invalid role for redirect:', role);
      return '/dashboard'; // fallback
    }

    // Ensure path starts with forward slash
    return path.startsWith('/') ? path : `/${path}`;
  },

  // Enhanced logout with proper cleanup
  logout(router?: AppRouterInstance): void {
    try {
      const tokenManager = getTokenManager();
      tokenManager.logout(router);
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect to login even if logout fails
      if (router && typeof router.push === 'function') {
        router.push('/login');
      } else {
        window.location.href = '/login';
      }
    }
  },

  // Get current user with error handling
  getCurrentUser(): { role: string; [key: string]: unknown } | null {
    try {
      const tokenManager = getTokenManager();
      return tokenManager.getCurrentUser();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get valid access token
  async getToken(): Promise<string | null> {
    try {
      const tokenManager = getTokenManager();
      return await tokenManager.getValidAccessToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Check authentication status
  isAuthenticated(): boolean {
    try {
      const tokenManager = getTokenManager();
      return tokenManager.isAuthenticated();
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },
};
