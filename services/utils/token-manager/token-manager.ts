import { refreshAPI, RefreshTokenResponse } from '../../api/refresh-api/refresh-api';
import { tokenUtils } from '../token-utils';

// Safe cookie utilities with browser checks
const cookieUtils = {
  set: (name: string, value: string, days: number = 7) => {
    if (typeof document === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure=${typeof window !== 'undefined' && window.location.protocol === 'https:'}`;
  },
  
  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  
  delete: (name: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

// BroadcastChannel for tab synchronization with browser check
class TabSyncManager {
  private channel: BroadcastChannel | null = null;
  
  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('wastetrack_auth');
      this.setupListener();
    }
  }
  
  private setupListener() {
    if (!this.channel) return;
    
    this.channel.onmessage = (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'TOKEN_REFRESHED':
          this.updateLocalTokens(data);
          break;
        case 'LOGOUT':
          this.handleLogout();
          break;
        case 'LOGIN':
          this.updateLocalTokens(data);
          break;
      }
    };
  }
  
  broadcast(type: string, data?: any) {
    if (!this.channel) return;
    this.channel.postMessage({ type, data });
  }
  
  private updateLocalTokens(data: any) {
    if (typeof window === 'undefined') return;
    
    if (data.access_token) {
      sessionStorage.setItem('access_token', data.access_token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }
  
  private handleLogout() {
    if (typeof window === 'undefined') return;
    
    sessionStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('session_id');
    cookieUtils.delete('refresh_token');
    
    // Redirect to login if not already there
    if (!window.location.pathname.includes('/auth/login')) {
      window.location.href = '/auth/login';
    }
  }
  
  cleanup() {
    if (this.channel) {
      this.channel.close();
    }
  }
}

export class TokenManager {
  private refreshPromise: Promise<string | null> | null = null;
  private tabSync: TabSyncManager | null = null;
  private sessionId: string = '';
  private isInitialized: boolean = false;
  
  constructor() {
    // Don't initialize browser-specific features during SSR
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }
  
  private initialize() {
    if (this.isInitialized) return;
    
    this.tabSync = new TabSyncManager();
    this.sessionId = this.getOrCreateSessionId();
    this.isInitialized = true;
  }
  
  private ensureInitialized() {
    if (typeof window !== 'undefined' && !this.isInitialized) {
      this.initialize();
    }
  }
  
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }
  
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  // Store tokens securely
  storeTokens(data: RefreshTokenResponse['data']) {
    if (typeof window === 'undefined') return;
    this.ensureInitialized();
    
    // Access token in sessionStorage (cleared when tab closes)
    sessionStorage.setItem('access_token', data.access_token);
    
    // Refresh token in httpOnly-like cookie (more secure)
    cookieUtils.set('refresh_token', data.refresh_token, 7); // 7 days
    
    // User data in localStorage
    localStorage.setItem('user', JSON.stringify(data));
    
    // Broadcast to other tabs
    if (this.tabSync) {
      this.tabSync.broadcast('LOGIN', {
        access_token: data.access_token,
        user: data
      });
    }
  }
  
  // Get valid access token (auto-refresh if needed)
  async getValidAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    this.ensureInitialized();
    
    const accessToken = sessionStorage.getItem('access_token');
    
    // If no access token, try to refresh
    if (!accessToken) {
      return await this.refreshAccessToken();
    }
    
    // If token is expired, refresh it
    if (tokenUtils.isTokenExpired(accessToken)) {
      return await this.refreshAccessToken();
    }
    
    return accessToken;
  }
  
  // Refresh access token
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
      console.error('Token refresh failed:', error);
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
  logout() {
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
    
    // Redirect to login
    window.location.href = '/auth/login';
  }
  
  // Cleanup (call when component unmounts)
  cleanup() {
    if (this.tabSync) {
      this.tabSync.cleanup();
    }
  }
}

// Lazy initialization singleton
let tokenManagerInstance: TokenManager | null = null;

export const getTokenManager = (): TokenManager => {
  if (!tokenManagerInstance) {
    tokenManagerInstance = new TokenManager();
  }
  return tokenManagerInstance;
};

// For backward compatibility, but safer
export const tokenManager = getTokenManager();
