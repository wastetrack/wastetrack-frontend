'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, LogIn, Check, Bell, Zap } from 'lucide-react';
import { loginFunctions } from '@/helpers/utils/login/login';
import { alerts } from '@/components/alerts/alerts';
import { getTokenManager } from '@/lib/token-manager';

// Interfaces defined here for login page
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data?: {
    id: string;
    username: string;
    email: string;
    role: string;
    phone_number: string;
    institution: string;
    address: string;
    city: string;
    province: string;
    points: number;
    balance: number;
    location: {
      latitude: number;
      longitude: number;
    };
    is_email_verified: boolean;
    access_token: string;
    refresh_token: string;
    created_at: string;
    updated_at: string;
  };
  message?: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Clean URL on component mount if it contains sensitive data
    const email = searchParams.get('email');
    const password = searchParams.get('password');

    if (email || password) {
      router.replace('/login');
      alerts.error(
        'Peringatan Keamanan! 🚨',
        'Kredensial login tidak boleh muncul di URL. Halaman telah dibersihkan untuk keamanan Anda.'
      );
    }
  }, [searchParams, router]);

  useEffect(() => {
    loginFunctions.checkAndRedirectIfAuthenticated(router);
  }, [router]);

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
      alerts.validationError('Email dan password harus diisi');
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alerts.validationError('Format email tidak valid');
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
      alerts.error('Error', 'Terjadi kesalahan yang tidak terduga saat login');
      setFormData((prev) => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '-24px' }}>
      <main className='flex min-h-screen w-full font-poppins'>
        {/* Left Panel – Form Login */}
        <section className='flex w-full items-center justify-center p-4 sm:p-6 md:p-8 lg:w-1/2'>
          <div className='w-full max-w-sm space-y-4 rounded-lg sm:max-w-md sm:space-y-6 sm:p-4 md:max-w-lg md:p-6 lg:max-w-xl lg:p-8'>
            <div className='flex flex-col items-center'>
              <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 shadow-sm sm:mb-4 sm:h-12 sm:w-12'>
                <LogIn size={20} className='text-emerald-600 sm:h-6 sm:w-6' />
              </div>
              <h1 className='text-center text-base font-bold text-gray-800 sm:text-lg md:text-xl lg:text-2xl'>
                Selamat Datang Kembali!
              </h1>
              <p className='mt-1 text-center text-xs text-gray-600 sm:mt-2 sm:text-sm md:text-base'>
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
                  className='mb-1 block text-left text-xs font-medium text-gray-500 sm:mb-2 sm:text-sm'
                >
                  Alamat Email
                </label>
                <div className='relative'>
                  <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-3.5'>
                    <Mail className='h-4 w-4 text-gray-400 sm:h-5 sm:w-5' />
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
                    className='w-full rounded-lg border border-gray-200 bg-white p-2.5 pl-9 text-sm text-gray-800 shadow-sm transition-all duration-200 placeholder:text-xs placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 sm:p-3 sm:pl-10 sm:text-base sm:placeholder:text-sm'
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='mb-1 block text-left text-xs font-medium text-gray-500 sm:mb-2 sm:text-sm'
                >
                  Kata Sandi
                </label>
                <div className='relative'>
                  <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-3.5'>
                    <Lock className='h-4 w-4 text-gray-400 sm:h-5 sm:w-5' />
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
                    className='w-full rounded-lg border border-gray-200 bg-white p-2.5 pl-9 pr-10 text-sm text-gray-800 shadow-sm transition-all duration-200 placeholder:text-xs placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 sm:p-3 sm:pl-10 sm:pr-12 sm:text-base sm:placeholder:text-sm'
                  />
                  <span
                    onClick={() => setShowPassword((prev) => !prev)}
                    className='absolute inset-y-0 right-0 flex cursor-pointer select-none items-center pr-2.5 text-gray-500 transition-colors hover:text-gray-700 sm:pr-3'
                    role='button'
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setShowPassword((prev) => !prev);
                    }}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4 text-gray-400 sm:h-5 sm:w-5' />
                    ) : (
                      <Eye className='h-4 w-4 text-gray-400 sm:h-5 sm:w-5' />
                    )}
                  </span>
                </div>
                <div className='pt-1 text-right sm:pt-2'>
                  <Link
                    href='/forgot-password'
                    className='text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700 sm:text-sm'
                  >
                    Lupa Password?
                  </Link>
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full transform rounded-lg bg-emerald-600 p-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:p-3 sm:text-base'
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
        </section>

        {/* Right Panel – Informasi */}
        <section className='hidden flex-col justify-center bg-gradient-to-br from-emerald-600 to-emerald-800 text-white lg:flex lg:w-1/2'>
          <div className='mx-auto w-full max-w-lg px-6 lg:px-8 xl:max-w-xl xl:px-12'>
            <h2 className='mb-4 text-center text-2xl font-bold leading-tight text-white lg:mb-6 lg:text-3xl xl:text-4xl'>
              Selamat Datang di WasteTrack
            </h2>
            <p className='mb-8 text-center text-base leading-relaxed text-white/90 lg:mb-12 lg:text-lg xl:text-xl'>
              Bergabunglah dengan kami untuk mewujudkan masa depan yang
              berkelanjutan melalui pengelolaan sampah yang efisien.
            </p>
            <div className='space-y-4 lg:space-y-6 xl:space-y-8'>
              <div className='flex transform items-center gap-4 rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/15 lg:gap-5 lg:p-5 xl:p-6'>
                <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm lg:h-14 lg:w-14'>
                  <Check className='h-6 w-6 text-emerald-600 lg:h-7 lg:w-7' />
                </div>
                <p className='text-base font-medium lg:text-lg xl:text-xl'>
                  Pantau progres pengelolaan sampah Anda
                </p>
              </div>
              <div className='flex transform items-center gap-4 rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/15 lg:gap-5 lg:p-5 xl:p-6'>
                <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm lg:h-14 lg:w-14'>
                  <Bell className='h-6 w-6 text-emerald-600 lg:h-7 lg:w-7' />
                </div>
                <p className='text-base font-medium lg:text-lg xl:text-xl'>
                  Dapatkan notifikasi penting
                </p>
              </div>
              <div className='flex transform items-center gap-4 rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/15 lg:gap-5 lg:p-5 xl:p-6'>
                <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm lg:h-14 lg:w-14'>
                  <Zap className='h-6 w-6 text-emerald-600 lg:h-7 lg:w-7' />
                </div>
                <p className='text-base font-medium lg:text-lg xl:text-xl'>
                  Solusi efisien dan berkelanjutan
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
