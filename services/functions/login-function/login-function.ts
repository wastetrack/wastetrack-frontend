import { loginAPI } from '../../api/login-api/login-api';
import { alerts } from '../../../components/alerts/alerts';
import { LoginRequest } from '../../../app/(auth)/login/page';
import { getTokenManager } from '../../utils/token-manager/token-manager';
import { emailVerificationApi } from '../../api/email-verification-api/email-verification-api';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { jwtDecode } from "jwt-decode";
import { AxiosError } from 'axios';

export const loginFunctions = {
  async handleLogin(credentials: LoginRequest, router: AppRouterInstance) {
    try {
      // Clear any potential URL parameters that might contain credentials
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('email') || url.searchParams.has('password')) {
          window.history.replaceState({}, '', url.pathname);
        }
      }

      const response = await loginAPI.login(credentials);

      // Pastikan response dan data ada
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Case 1: Successful login with verified email
      if (response.data.access_token && response.data.is_email_verified) {
        const tokenManager = getTokenManager();
        tokenManager.storeTokens({
          ...response.data,
          role: response.data.role // Make sure role is included
        });

        const redirectPath = this.getRoleBasedRedirect(response.data.role);
        // console.log('Login success, role:', response.data.role); // Debug

        const decoded: { iat: number; nbf: number; exp: number; role: string } = jwtDecode(response.data.access_token);
        const issuedAt = new Date(decoded.iat * 1000);
        const notBefore = new Date(decoded.nbf * 1000);
        const expiresAt = new Date(decoded.exp * 1000);
        const timeUntilExpiry = Math.round((decoded.exp * 1000 - Date.now()) / 1000 / 60); // dalam menit

        // Debug log
        console.log('JWT Info:', {
          role: decoded.role,
          issuedAt: issuedAt.toLocaleString(),
          notBefore: notBefore.toLocaleString(),
          expiresAt: expiresAt.toLocaleString(),
          timeUntilExpiry: timeUntilExpiry + ' minutes'
        });


        // Tunggu alert selesai sebelum redirect
        try {
          await alerts.success('Login Berhasil! 🎉', 'Selamat datang kembali!');
          // Pastikan router tersedia
          if (router && typeof router.push === 'function') {
            router.push(redirectPath);
          } else {
            window.location.href = redirectPath; // Fallback jika router tidak tersedia
          }
        } catch (alertError) {
          console.error('Alert error:', alertError);
          // Fallback redirect jika terjadi error pada alert
          if (router && typeof router.push === 'function') {
            router.push(redirectPath);
          } else {
            window.location.href = redirectPath;
          }
        }

        return { success: true, data: response.data };
      }

      // Case 2: Login successful but email not verified
      if (response.data.access_token && !response.data.is_email_verified) {
        return await this.handleEmailNotVerified(credentials.email);
      }

      // Case 3: Login failed
      throw new Error('Login failed: Invalid credentials');

    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error instanceof AxiosError) {
        // Handle specific error cases
        if (error.response?.status === 401) {
          return await this.handleInvalidCredentials();
        }
        
        if (error.response?.data?.message) {
          await alerts.error('Login Error', error.response.data.message);
          return { success: false, message: error.response.data.message };
        }
        
        // Default error handling
        await alerts.error('Login Error', error.message || 'An unexpected error occurred');
        return { success: false, message: error.message };
      }
    }
  },

  async handleEmailNotVerified(email: string) {
    const result = await alerts.emailNotVerified(email);
    if (result.isConfirmed) {
      try {
        const resendResponse = await emailVerificationApi.resendVerification(email);
        if (resendResponse.success) {
          await alerts.emailVerificationSent();
        } else {
          await alerts.error('Failed to Send', resendResponse.message);
        }
      } catch {
        await alerts.error('Error', 'Failed to resend verification email');
      }
    }
    return { success: false, needsVerification: true };
  },

  async handleInvalidCredentials() {
    await alerts.error('Login Gagal', 'Email atau password yang Anda masukkan tidak valid');
    return { success: false, invalidCredentials: true };
  },

  async handleLoginError(error: unknown, email?: string) {
    let errorMessage = 'Terjadi kesalahan yang tidak terduga';

    // Extract error message from different error types
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      const errorObj = error as { response?: { data?: { errors?: string; message?: string; error?: string } }; message?: string; error?: string };
      if (errorObj.response?.data?.errors === 'Too many active sessions') {
        await alerts.error(
          'Terlalu Banyak Sesi',
          'Anda telah mencapai batas maksimal sesi aktif (5 sesi). Silakan logout dari perangkat lain.'
        );
        return { success: false, tooManySessions: true };
      }
      if (errorObj.response && errorObj.response.data) {
        errorMessage = errorObj.response.data.message ||
          errorObj.response.data.error ||
          'Terjadi kesalahan yang tidak terduga';
      } else {
        errorMessage = errorObj.message ||
          errorObj.error ||
          'Terjadi kesalahan yang tidak terduga';
      }
    }

    const normalizedError = errorMessage.toLowerCase();

    // Case 1: Email not verified error from API
    if (normalizedError.includes('email not verified') ||
      normalizedError.includes('email belum diverifikasi') ||
      normalizedError.includes('not verified') ||
      normalizedError.includes('belum diverifikasi') ||
      normalizedError.includes('please verify') ||
      normalizedError.includes('unverified email') ||
      normalizedError.includes('email verification required')) {
      if (email) {
        return await this.handleEmailNotVerified(email);
      }
      return { success: false, needsVerification: true };
    }

    // Case 2: Invalid credentials (email not found OR wrong password)
    if (normalizedError.includes('user not found') ||
      normalizedError.includes('email not found') ||
      normalizedError.includes('invalid password') ||
      normalizedError.includes('wrong password') ||
      normalizedError.includes('password salah') ||
      normalizedError.includes('invalid credentials') ||
      normalizedError.includes('authentication failed') ||
      normalizedError.includes('login failed') ||
      normalizedError.includes('unauthorized') ||
      normalizedError.includes('bad credentials')) {
      return await this.handleInvalidCredentials();
    }

    // Case 3: Server or network errors - show generic error
    await alerts.error('Ada Kendala', 'Terjadi kesalahan saat login. Silakan coba lagi.');
    return { success: false, message: errorMessage };
  },

  /**
   * Mengecek apakah user sudah login (token & refresh token valid) dan redirect ke dashboard sesuai role.
   * @param router Next.js router instance
   */
  checkAndRedirectIfAuthenticated(router: AppRouterInstance) {
    const tokenManager = getTokenManager();
    const user = tokenManager.getCurrentUser();
    const refreshToken = typeof document !== 'undefined' && document.cookie.includes('refresh_token=');

    if (user && refreshToken) {
      const role = user.role;
      const roleBasedRedirect: Record<string, string> = {
        'customer': '/customer/dashboard',
        'waste_collector_central': '/collector-central/dashboard',
        'waste_collector_unit': '/collector-unit/dashboard',
        'industry': '/offtaker/dashboard',
        'waste_bank_central': '/wastebank-central/dashboard',
        'waste_bank_unit': '/wastebank-unit/dashboard'
      };
      const redirectPath = roleBasedRedirect[role] || '/dashboard';
      router.replace(redirectPath);
      return true;
    }
    return false;
  },

  getRoleBasedRedirect(role: string): string {
    const routes: Record<string, string> = {
      'customer': '/customer/dashboard',
      'waste_collector_central': '/collector-central/dashboard',
      'waste_collector_unit': '/collector-unit/dashboard',
      'industry': '/offtaker/dashboard',
      'waste_bank_central': '/wastebank-central/dashboard',
      'waste_bank_unit': '/wastebank-unit/dashboard'
    };

    // Pastikan role ada dan sesuai format
    const normalizedRole = role.toLowerCase().trim();
    const path = routes[normalizedRole];

    if (!path) {
      console.error('Invalid role for redirect:', role);
      return '/dashboard'; // fallback
    }

    // Pastikan path dimulai dengan leading slash
    return path.startsWith('/') ? path : `/${path}`;
  },

  logout() {
    const tokenManager = getTokenManager();
    tokenManager.logout();
  },

  getCurrentUser() {
    const tokenManager = getTokenManager();
    return tokenManager.getCurrentUser();
  },

  async getToken() {
    const tokenManager = getTokenManager();
    return await tokenManager.getValidAccessToken();
  },

  isAuthenticated() {
    const tokenManager = getTokenManager();
    return tokenManager.isAuthenticated();
  }
};
