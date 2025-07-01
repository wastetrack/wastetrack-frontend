import { refreshAPI } from '../../api/refresh-token-api/refresh-token-api';
import { tokenUtils } from '../token-utils';
import { cookieUtils } from '../cookie-utils';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { jwtDecode } from "jwt-decode";

let tokenManagerInstance: TokenManager | null = null;

export class TokenManager {
  private refreshPromise: Promise<string | null> | null = null;
  private tabSync: any = null; // Define tabSync property

  storeTokens(data: any) {
    if (typeof window === 'undefined') return;

    // Access token (15 menit)
    sessionStorage.setItem('access_token', data.access_token);

    // Simpan access token ke cookie agar bisa dibaca middleware/server
    document.cookie = `token=${data.access_token}; path=/;`;

    // Refresh token (1 bulan)
    localStorage.setItem('refresh_token', data.refresh_token);
    document.cookie = `refresh_token=${data.refresh_token}; path=/;`;

    // User data
    localStorage.setItem('user', JSON.stringify(data));
  }

  async getValidAccessToken(): Promise<string | null> {
    const accessToken = sessionStorage.getItem('access_token');
    if (!accessToken) return null;

    // Cek apakah token akan expired dalam 1 menit
    if (this.isTokenExpiringSoon(accessToken, 1)) {
      return await this.refreshAccessToken();
    }

    return accessToken;
  }

  // Tambahkan fungsi utilitas untuk cek waktu expired token
  private isTokenExpiringSoon(token: string, thresholdMinutes: number = 1): boolean {
    try {
      const decoded: { exp: number } = jwtDecode(token);
      const now = Date.now() / 1000; // detik
      // Jika waktu expired kurang dari threshold (dalam menit)
      return decoded.exp - now < thresholdMinutes * 60;
    } catch (e) {
      // Jika gagal decode, anggap token sudah tidak valid
      return true;
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    
    // Prevent multiple simultaneous refresh calls
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = cookieUtils.get('refresh_token');
      const currentAccessToken = sessionStorage.getItem('access_token');
      
      if (!refreshToken) {
        this.logout();
        return null;
      }
      
      // Use current access token for auth (even if expired, backend might accept it for refresh)
      const response = await refreshAPI.refreshToken(refreshToken, currentAccessToken || '');
      
      // Store new tokens
      this.storeTokens(response.data);
      
      // Broadcast token refresh to other tabs
      if (this.tabSync) {
        this.tabSync.broadcast('TOKEN_REFRESHED', {
          access_token: response.data.access_token,
          user: response.data
        });
      }
      
      return response.data.access_token;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  // Get current user
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const refreshToken = cookieUtils.get('refresh_token');
    const user = this.getCurrentUser();
    return !!(refreshToken && user);
  }
  
  // Logout
  logout(router?: AppRouterInstance) {
    if (typeof window === 'undefined') return;
    
    // Clear all tokens and data
    sessionStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('session_id');
    cookieUtils.delete('refresh_token');
    
    // Broadcast logout to other tabs
    if (this.tabSync) {
      this.tabSync.broadcast('LOGOUT');
    }
    
    // Use router if provided, otherwise fallback to window.location
    if (router) {
      router.push('/login');
    } else {
      window.location.href = '/login';
    }
  }
  
  // Cleanup (call when component unmounts)
  cleanup() {
    if (this.tabSync) {
      this.tabSync.cleanup();
    }
  }
}

export const getTokenManager = (): TokenManager => {
  if (!tokenManagerInstance) {
    tokenManagerInstance = new TokenManager();
  }
  return tokenManagerInstance;
};

// For backward compatibility, but safer
export const tokenManager = getTokenManager();
