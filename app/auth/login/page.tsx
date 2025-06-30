'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, LogIn, Check, Bell, Zap } from 'lucide-react';
import { loginFunctions } from '../../../services/functions/login-function/login-function';
import { alerts } from '../../../components/alerts/alerts';
import { getTokenManager } from '../../../services/utils/token-manager/token-manager';

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
    password: ''
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
      router.replace('/auth/login');
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
    setFormData(prev => ({ ...prev, [name]: value }));
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
        setFormData(prev => ({ ...prev, password: '' }));
      } else if ('invalidCredentials' in result && result.invalidCredentials) {
        // Invalid credentials - already handled in loginFunctions
        console.log('Invalid credentials');
        // Clear password for security
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        // Other errors - already handled in loginFunctions
        console.log('Other login error');
        // Clear password for security
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (error) {
      console.error('Login error:', error);
      alerts.error('Error', 'Terjadi kesalahan yang tidak terduga saat login');
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '-24px' }}>
      <main className="flex min-h-screen w-full font-poppins">
        {/* Left Panel – Form Login */}
        <section className="w-full flex items-center justify-center p-4 sm:p-6 md:p-8 lg:w-1/2">
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl space-y-4 sm:space-y-6 rounded-lg sm:p-4 md:p-6 lg:p-8">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-full shadow-sm bg-emerald-100">
                <LogIn size={20} className="sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 text-center">
                Selamat Datang Kembali!
              </h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600 text-center">
                Masuk ke akun Anda
              </p>
            </div>
            
            {/* Make sure form doesn't submit to URL */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" method="post" action="#">
              <div>
                <label htmlFor="email" className="text-left block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-500">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Masukkan email Anda"
                    className="text-sm sm:text-base w-full p-2.5 sm:p-3 pl-9 sm:pl-10 text-gray-800 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm transition-all duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="text-left block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-500">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Masukkan kata sandi Anda"
                    className="text-sm sm:text-base w-full p-2.5 sm:p-3 pl-9 sm:pl-10 pr-10 sm:pr-12 text-gray-800 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm transition-all duration-200"
                  />
                  <span
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-3 text-gray-500 cursor-pointer select-none hover:text-gray-700 transition-colors"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') setShowPassword(prev => !prev); }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                  </span>
                </div>
                <div className="text-right pt-1 sm:pt-2">
                  <Link href="/auth/forgot-password" className="text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                    Lupa Password?
                  </Link>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="text-sm sm:text-base font-semibold w-full p-2.5 sm:p-3 text-white transition-all duration-200 rounded-lg shadow-sm bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Masuk...' : 'Masuk'}
              </button>
              
              <p className="text-xs sm:text-sm text-center text-gray-700">
                Belum punya akun?{' '}
                <Link href="/auth/register" className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Daftar
                </Link>
              </p>
            </form>
          </div>
        </section>

        {/* Right Panel – Informasi */}
        <section className="hidden lg:flex lg:w-1/2 flex-col justify-center bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
          <div className="w-full max-w-lg xl:max-w-xl mx-auto px-6 lg:px-8 xl:px-12">
            <h2 className="mb-4 lg:mb-6 text-2xl lg:text-3xl xl:text-4xl font-bold text-center text-white leading-tight">
              Selamat Datang di WasteTrack
            </h2>
            <p className="mb-8 lg:mb-12 text-base lg:text-lg xl:text-xl text-center text-white/90 leading-relaxed">
              Bergabunglah dengan kami untuk mewujudkan masa depan yang berkelanjutan melalui pengelolaan sampah yang efisien.
            </p>
            <div className="space-y-4 lg:space-y-6 xl:space-y-8">
              <div className="flex items-center gap-4 lg:gap-5 p-4 lg:p-5 xl:p-6 text-white rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-full shadow-sm flex-shrink-0">
                  <Check className="w-6 h-6 lg:w-7 lg:h-7 text-emerald-600" />
                </div>
                <p className="text-base lg:text-lg xl:text-xl font-medium">Pantau progres pengelolaan sampah Anda</p>
              </div>
              <div className="flex items-center gap-4 lg:gap-5 p-4 lg:p-5 xl:p-6 text-white rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-full shadow-sm flex-shrink-0">
                  <Bell className="w-6 h-6 lg:w-7 lg:h-7 text-emerald-600" />
                </div>
                <p className="text-base lg:text-lg xl:text-xl font-medium">Dapatkan notifikasi penting</p>
              </div>
              <div className="flex items-center gap-4 lg:gap-5 p-4 lg:p-5 xl:p-6 text-white rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-full shadow-sm flex-shrink-0">
                  <Zap className="w-6 h-6 lg:w-7 lg:h-7 text-emerald-600" />
                </div>
                <p className="text-base lg:text-lg xl:text-xl font-medium">Solusi efisien dan berkelanjutan</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
