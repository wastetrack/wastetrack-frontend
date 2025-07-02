const API_URL =
  process.env.NEXT_PUBLIC_DEVELOPMENT_API_URL || 'http://localhost:8000';

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export const forgotPasswordApi = {
  // Request password reset link
  requestReset: async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request password reset');
      }

      return {
        success: true,
        message: data.message || 'Password reset email sent successfully',
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to request password reset',
      };
    }
  },
};
