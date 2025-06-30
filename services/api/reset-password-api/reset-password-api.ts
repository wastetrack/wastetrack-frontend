const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const resetPasswordApi = {
  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<ResetPasswordResponse> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      return {
        success: true,
        message: data.message || 'Password reset successfully',
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reset password',
      };
    }
  }
};
