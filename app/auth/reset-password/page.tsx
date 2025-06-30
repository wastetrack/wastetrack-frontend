'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, RefreshCw } from 'lucide-react';
import { resetPasswordFunctions } from '../../../services/functions/reset-password-function.ts/reset-password-function';
import { alerts } from '../../../components/alerts/alerts';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      await alerts.passwordMismatch();
      return;
    }
    
    const token = searchParams.get('token');
    if (!token) {
      await alerts.invalidResetToken();
      router.push('/auth/forgot-password');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await resetPasswordFunctions.handleResetPassword(token, newPassword);
      if (result.success) {
        await alerts.resetPasswordSuccess();
        router.push('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ margin: '-24px' }}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="text-center text-2xl font-bold text-gray-800">
              Reset Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your new password
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="text-sm w-full p-3 pl-10 pr-10 text-gray-800 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="text-sm w-full p-3 pl-10 pr-10 text-gray-800 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400"
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
