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
    <div style={{ margin: '-24px' }}>
      <div className='flex min-h-screen items-center justify-center bg-gray-100'>
        <div className='w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow'>
          <div>
            <h2 className='text-center text-2xl font-bold text-gray-800'>
              Lupa Password
            </h2>
            <p className='mt-2 text-center text-sm text-gray-600'>
              Masukkan email Anda untuk mereset password
            </p>
          </div>
          <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor='email'
                className='mb-2 block text-left text-sm font-medium text-gray-500'
              >
                Alamat Email
              </label>
              <div className='relative'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                  <Mail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='email'
                  name='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className='w-full rounded-lg border border-gray-200 bg-white p-3 pl-10 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                  placeholder='Masukkan email Anda'
                />
              </div>
            </div>
            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='w-full transform rounded-lg bg-emerald-600 p-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-400'
              >
                {isLoading ? (
                  <RefreshCw className='mx-auto h-5 w-5 animate-spin' />
                ) : (
                  'Kirim Link Reset Password'
                )}
              </button>
            </div>
            <div className='text-center'>
              <Link
                href='/login'
                className='text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700'
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
