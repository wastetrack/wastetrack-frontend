'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { loginFunctions } from '@/helpers/utils/login/login';
// import { Alert } from '@/components/ui';
import { LoginRequest } from '@/types';

// Loading component untuk Suspense fallback
function LoginFormLoading() {
  return (
    <div className='w-full max-w-2xl space-y-4 rounded-lg sm:p-4 md:p-6'>
      <div className='flex flex-col items-center'>
        <h1 className='text-center text-base font-bold text-gray-800 sm:text-lg md:text-xl lg:text-2xl'>
          Loading...
        </h1>
        <p className='mt-2 text-center text-xs text-gray-600 sm:text-base'>
          Mohon tunggu sebentar
        </p>
      </div>
      <div className='space-y-4 sm:space-y-5'>
        <div className='animate-pulse'>
          <div className='mb-2 h-4 rounded bg-gray-200'></div>
          <div className='h-12 rounded bg-gray-200'></div>
        </div>
        <div className='animate-pulse'>
          <div className='mb-2 h-4 rounded bg-gray-200'></div>
          <div className='h-12 rounded bg-gray-200'></div>
        </div>
        <div className='h-12 animate-pulse rounded bg-gray-200'></div>
      </div>
    </div>
  );
}

// Komponen utama yang menggunakan useSearchParams
function LoginFormContent() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pastikan komponen sudah ter-mount di client sebelum mengakses browser APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Clean URL on component mount if it contains sensitive data
    const email = searchParams.get('email');
    const password = searchParams.get('password');

    if (email || password) {
      // Pastikan kita berada di browser sebelum melakukan replace
      if (typeof window !== 'undefined') {
        router.replace('/login');
        // Alert.error({
        //   title: 'Peringatan Keamanan! 🚨',
        //   text: 'Kredensial login tidak boleh muncul di URL. Halaman telah dibersihkan untuk keamanan Anda.',
        // });
      }
    }
  }, [mounted, searchParams, router]);

  useEffect(() => {
    if (!mounted) return;
    loginFunctions.checkAndRedirectIfAuthenticated(router);
  }, [mounted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);

    // Basic client-side validation
    if (!formData.email || !formData.password) {
      // Alert.error({
      //   title: 'Validation Error',
      //   text: 'Email dan password harus diisi',
      // });
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      // Alert.error({
      //   title: 'Validation Error',
      //   text: 'Format email tidak valid',
      // });
      setLoading(false);
      return;
    }

    try {
      // Pastikan router dioper ke fungsi handleLogin
      const result = await loginFunctions.handleLogin(formData, router);

      if (result.success) {
        setFormData({ email: '', password: '' });
        // Router push sudah ditangani di dalam loginFunctions
      } else if ('needsVerification' in result && result.needsVerification) {
        // Email not verified - already handled in loginFunctions
        console.log('Email verification required');
        // Clear password for security
        setFormData((prev) => ({ ...prev, password: '' }));
      } else if ('invalidCredentials' in result && result.invalidCredentials) {
        // Invalid credentials - already handled in loginFunctions
        console.log('Invalid credentials');
        // Clear password for security
        setFormData((prev) => ({ ...prev, password: '' }));
      } else {
        // Other errors - already handled in loginFunctions
        console.log('Other login error');
        // Clear password for security
        setFormData((prev) => ({ ...prev, password: '' }));
      }
    } catch (error) {
      console.error('Login error:', error);
      // Alert.error({
      //   title: 'Error',
      //   text: 'Terjadi kesalahan yang tidak terduga saat login',
      // });
      setFormData((prev) => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  // Jangan render apa-apa sampai komponen ter-mount di client
  if (!mounted) {
    return (
      <div className='w-full max-w-2xl space-y-4 rounded-lg sm:p-4 md:p-6'>
        <div className='flex flex-col items-center'>
          <h1 className='text-center text-base font-bold text-gray-800 sm:text-lg md:text-xl lg:text-2xl'>
            Selamat Datang Kembali!
          </h1>
          <p className='mt-2 text-center text-xs text-gray-600  sm:text-base'>
            Masuk ke akun Anda
          </p>
        </div>
        <div className='space-y-4 sm:space-y-5'>
          <div className='animate-pulse'>
            <div className='mb-2 h-4 rounded bg-gray-200'></div>
            <div className='h-12 rounded bg-gray-200'></div>
          </div>
          <div className='animate-pulse'>
            <div className='mb-2 h-4 rounded bg-gray-200'></div>
            <div className='h-12 rounded bg-gray-200'></div>
          </div>
          <div className='h-12 animate-pulse rounded bg-gray-200'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full max-w-2xl space-y-4 rounded-lg sm:p-4 md:p-6'>
      <div className='flex flex-col items-center'>
        <h1 className='text-center text-base font-bold text-gray-800 sm:text-lg md:text-xl lg:text-2xl'>
          Selamat Datang Kembali!
        </h1>
        <p className='mt-2 text-center text-xs text-gray-600  sm:text-base'>
          Masuk ke akun Anda
        </p>
      </div>

      {/* Make sure form doesn't submit to URL */}
      <form
        onSubmit={handleSubmit}
        className='space-y-4 sm:space-y-5'
        method='post'
        action='#'
      >
        <div>
          <label
            htmlFor='email'
            className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'
          >
            Alamat Email
          </label>
          <div className='relative'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4'>
              <Mail className='h-4 w-4 text-gray-400' />
            </div>
            <input
              id='email'
              type='email'
              name='email'
              required
              autoComplete='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='Masukkan email Anda'
              className='shadow-xs w-full rounded-lg border border-gray-200 bg-white p-3 pl-9 text-sm text-gray-800 transition-all duration-200 placeholder:text-xs placeholder:text-gray-400 sm:p-3 sm:pl-10 sm:text-base sm:placeholder:text-sm'
            />
          </div>
        </div>

        <div>
          <label
            htmlFor='password'
            className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'
          >
            Kata Sandi
          </label>
          <div className='relative'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4'>
              <Lock className='h-4 w-4 text-gray-400' />
            </div>
            <input
              id='password'
              type={showPassword ? 'text' : 'password'}
              name='password'
              required
              autoComplete='current-password'
              value={formData.password}
              onChange={handleChange}
              placeholder='Masukkan kata sandi Anda'
              className='shadow-xs w-full rounded-lg border border-gray-200 bg-white p-3 pl-9 pr-10 text-sm text-gray-800 transition-all duration-200 placeholder:text-xs placeholder:text-gray-400 sm:p-3 sm:pl-10 sm:pr-12 sm:text-base sm:placeholder:text-sm'
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className='absolute inset-y-0 right-0 flex cursor-pointer select-none items-center pr-4 text-gray-500 transition-colors hover:text-gray-700'
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setShowPassword((prev) => !prev);
              }}
            >
              {showPassword ? (
                <Eye className='h-4.5 w-4.5 text-gray-400' />
              ) : (
                <EyeOff className='h-4.5 w-4.5 text-gray-400' />
              )}
            </span>
          </div>
          <div className='pt-2 text-right'>
            <Link
              href='/forgot-password'
              className='text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700'
            >
              Lupa Password?
            </Link>
          </div>
        </div>

        <button
          type='submit'
          disabled={loading}
          className='mt-4 w-full transform rounded-lg bg-emerald-600 p-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-700 sm:text-base'
        >
          {loading ? 'Masuk...' : 'Masuk'}
        </button>

        <p className='text-center text-xs text-gray-700 sm:text-sm'>
          Belum punya akun?{' '}
          <Link
            href='/register'
            className='text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 sm:text-sm'
          >
            Daftar
          </Link>
        </p>
      </form>
    </div>
  );
}

// Export default component yang dibungkus dengan Suspense
export default function LoginForm() {
  return (
    <Suspense fallback={<LoginFormLoading />}>
      <LoginFormContent />
    </Suspense>
  );
}
