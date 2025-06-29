import { loginAPI } from '../../api/login-api/login-api';
import { alerts } from '../../../component/alerts/alerts';
import { LoginRequest } from '../../../app/auth/login/page';
import { getTokenManager } from '../../utils/token-manager/token-manager';
import { emailVerificationApi } from '../../api/email-verification-api/email-verification-api';
import { useRouter } from 'next/navigation';

export const loginFunctions = {
  async handleLogin(credentials: LoginRequest) {
    try {
      // Clear any potential URL parameters that might contain credentials
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('email') || url.searchParams.has('password')) {
          window.history.replaceState({}, '', url.pathname);
        }
      }

      const response = await loginAPI.login(credentials);
      
      // Case 1: Successful login with verified email
      if (response.data && response.data.access_token && response.data.is_email_verified) {
        const tokenManager = getTokenManager();
        // Store token and role
        tokenManager.storeTokens({
          ...response.data,
          role: response.data.role // Make sure role is included
        });
        
        await alerts.success('Login Berhasil! 🎉', 'Selamat datang kembali!');
        
        const redirectPath = this.getRoleBasedRedirect(response.data.role);
        
        // Add delay before redirect
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 1000);
        
        return { 
          success: true, 
          data: response.data,
          redirect: redirectPath
        };
      }
      
      // Case 2: Login successful but email not verified
      if (response.data && response.data.access_token && !response.data.is_email_verified) {
        return this.handleEmailNotVerified(credentials.email);
      }
      
      // Case 3: Login failed - invalid credentials
      return this.handleInvalidCredentials();
      
    } catch (error) {
      return this.handleLoginError(error, credentials.email);
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
      } catch (error) {
        await alerts.error('Error', 'Failed to resend verification email');
      }
    }
    return { success: false, needsVerification: true };
  },

  handleInvalidCredentials() {
    alerts.error('Login Gagal', 'Email atau password yang Anda masukkan tidak valid');
    return { success: false, invalidCredentials: true };
  },

  handleLoginError(error: unknown, email?: string) {
    let errorMessage = 'Terjadi kesalahan yang tidak terduga';
    
    // Extract error message from different error types
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
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
        return this.handleEmailNotVerified(email);
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
      return this.handleInvalidCredentials();
    }
    
    // Case 3: Server or network errors - show generic error
    alerts.error('Ada Kendala', 'Terjadi kesalahan saat login. Silakan coba lagi.');
    return { success: false, message: errorMessage };
  },

  getRoleBasedRedirect(role: string): string {
    const routes = {
      'customer': '/dashboard/customer',
      'collector-central': '/dashboard/collector-central',
      'collector-unit': '/dashboard/collector-unit',
      'industry': '/dashboard/offtaker',
      'wastebank-central': '/dashboard/wastebank-central',
      'wastebank-unit': '/dashboard/wastebank-unit'
    };

    return routes[role as keyof typeof routes] || '/dashboard';
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
