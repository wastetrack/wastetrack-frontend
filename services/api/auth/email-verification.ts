// Constants
const API_BASE_URL =
  process.env.NEXT_PUBLIC_DEVELOPMENT_API_URL || 'http://localhost:8000';

// Types & Interfaces
export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

// API Functions
export const emailVerificationAPI = {
  // Verify email with token
  verifyEmail: async (token: string): Promise<EmailVerificationResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      return {
        success: true,
        message: data.message || 'Email verified successfully',
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  },

  // Resend verification email
  resendVerification: async (
    email: string
  ): Promise<EmailVerificationResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification');
      }

      return {
        success: true,
        message: data.message || 'Verification email sent successfully',
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to resend verification',
      };
    }
  },

  // Check email verification status
  checkVerificationStatus: async (
    email: string
  ): Promise<EmailVerificationResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/check-verification-status?email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check verification status');
      }

      return {
        success: true,
        message: data.message || 'Status checked successfully',
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to check verification status',
      };
    }
  },
};
