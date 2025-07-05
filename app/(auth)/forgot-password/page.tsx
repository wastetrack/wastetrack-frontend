'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, RefreshCw } from 'lucide-react';
import { forgotPasswordFunctions } from '@/helpers/utils/forgot-password/forgot-password';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPasswordFunctions.handleForgotPassword(email);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className='flex min-h-screen items-center justify-center bg-gray-100 sm:px-6 lg:px-8'>
        <div className='w-full max-w-md space-y-6 rounded-lg sm:bg-white p-6 sm:shadow-lg sm:p-8'>
          <div>
            <h2 className='text-center text-xl font-bold text-gray-800 sm:text-2xl'>
              Lupa Password
            </h2>
            <p className='mt-2 text-center text-xs text-gray-600 sm:text-sm'>
              Masukkan email Anda untuk mereset password
            </p>
          </div>
          <form className='mt-6 space-y-4 sm:mt-8 sm:space-y-6' onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor='email'
                className='mb-2 block text-left text-xs font-medium text-gray-500 sm:text-sm'
              >
                Alamat Email
              </label>
              <div className='relative'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                  <Mail className='h-4 w-4 text-gray-400 sm:h-5 sm:w-5' />
                </div>
                <input
                  id='email'
                  name='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className='w-full rounded-lg border border-gray-200 bg-white p-3 pl-9 text-sm text-gray-800 shadow-xs transition-all duration-200 placeholder:text-xs placeholder:text-gray-400 sm:p-3 sm:pl-10 sm:text-base sm:placeholder:text-sm'
                  placeholder='Masukkan email Anda'
                />
              </div>
            </div>
            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='mt-4 w-full transform rounded-lg bg-emerald-600 p-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-700 sm:text-base'
              >
                {isLoading ? (
                  <RefreshCw className='mx-auto h-4 w-4 animate-spin sm:h-5 sm:w-5' />
                ) : (
                  'Kirim Link Reset Password'
                )}
              </button>
            </div>
            <div className='text-center'>
              <Link
                href='/login'
                className='text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700 sm:text-sm'
              >
                Kembali ke Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
