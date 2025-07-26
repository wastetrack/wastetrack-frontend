'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  UserPlus,
  Save,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  MapPin,
} from 'lucide-react';
import { getTokenManager } from '@/lib/token-manager';
import { showToast } from '@/components/ui';
import PickLocation from '@/components/ui/PickLocation';
import { SavedLocationPayload } from '@/types';
// import { userListAPI } from '@/services/api/user';
import { registerAPI } from '@/services/api/auth';

interface CollectorFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  phone_number: string;
  institution: string;
  institution_id: string;
  address: string;
  city: string;
  province: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

export default function AddCollectorPage() {
  const router = useRouter();
  // Semua field tampil sekaligus, tidak ada step
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  // Current user data
  interface CurrentUser {
    id: string;
    role: string;
    institution?: string;
    [key: string]: unknown; // Add more fields as needed for your app
  }
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Form state
  const [formData, setFormData] = useState<CollectorFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone_number: '',
    institution: '',
    institution_id: '',
    address: '',
    city: '',
    province: '',
    location: null,
  });

  // Get current user data and set default values
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const tokenManager = getTokenManager();

        if (!tokenManager.isAuthenticated()) {
          setError('Anda belum login. Silakan login terlebih dahulu.');
          setLoading(false);
          return;
        }

        const userData = tokenManager.getCurrentUser();
        console.log('Current user data:', userData);

        if (!userData) {
          setError('Data pengguna tidak ditemukan. Silakan login kembali.');
          setLoading(false);
          return;
        }

        if (
          userData.role !== 'waste_bank_unit' &&
          userData.role !== 'waste_bank_central'
        ) {
          setError('Akses ditolak. Anda bukan pengguna bank sampah.');
          setLoading(false);
          return;
        }

        setCurrentUser(userData);

        // Set default form data based on current user
        const collectorRole =
          userData.role === 'waste_bank_unit'
            ? 'waste_collector_unit'
            : 'waste_collector_central';

        setFormData((prev) => ({
          ...prev,
          role: collectorRole,
          institution: userData.institution || '',
          institution_id: userData.id || '',
        }));
      } catch (err) {
        console.error('Failed to get user profile:', err);
        setError('Gagal mendapatkan profil pengguna. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    getUserProfile();
  }, []);

  const handleBlur = (fieldName: string) => {
    setTouchedFields((prev) => new Set([...prev, fieldName]));
  };

  const formatPhoneDisplay = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.startsWith('8') && !numbers.startsWith('08')) {
      return '0' + numbers.slice(0, 12);
    }
    return numbers.slice(0, 13);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'phone_number') {
      const formattedValue = formatPhoneDisplay(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const isValidIndonesianPhone = (phone_number: string) => {
    const cleanNumber = phone_number.replace(/\D/g, '');
    if (!cleanNumber.startsWith('08')) return false;
    if (cleanNumber.length < 10 || cleanNumber.length > 13) return false;
    if (cleanNumber.length >= 3 && cleanNumber[2] === '0') return false;
    return /^08[1-9][0-9]{7,10}$/.test(cleanNumber);
  };

  const getFieldError = (
    fieldName: string,
    value: string,
    isRequired: boolean = true
  ) => {
    if (!touchedFields.has(fieldName)) return '';

    if (isRequired && !value.trim()) {
      return 'Field ini wajib diisi';
    }

    switch (fieldName) {
      case 'email':
        if (!value.includes('@')) return 'Email harus mengandung @';
        if (!isValidEmail(value))
          return 'Format email tidak valid (contoh: nama@domain.com)';
        if (value.length > 100) return 'Email maksimal 100 karakter';
        break;
      case 'password':
        if (value.length < 8) return 'Password minimal 8 karakter';
        if (value.length > 100) return 'Password maksimal 100 karakter';
        break;
      case 'confirmPassword':
        if (value !== formData.password)
          return 'Konfirmasi password tidak sesuai';
        break;
      case 'phone_number':
        if (!isValidIndonesianPhone(value)) {
          const cleanNumber = value.replace(/\D/g, '');
          if (cleanNumber.length < 10) {
            return 'Nomor telepon minimal 10 digit';
          } else if (cleanNumber.length > 13) {
            return 'Nomor telepon maksimal 13 digit';
          } else if (!cleanNumber.startsWith('08')) {
            return 'Nomor harus dimulai dengan 08';
          } else if (cleanNumber.length >= 3 && cleanNumber[2] === '0') {
            return 'Digit ketiga tidak boleh 0';
          }
          return 'Format nomor telepon tidak valid';
        }
        break;
      case 'username':
        if (value.trim().length < 2) return 'Nama minimal 2 karakter';
        if (value.trim().length > 100) return 'Nama maksimal 100 karakter';
        break;
      case 'address':
        if (value.trim().length < 5) return 'Alamat minimal 5 karakter';
        if (value.trim().length > 200) return 'Alamat maksimal 200 karakter';
        break;
      case 'city':
        if (value.trim().length < 2) return 'Kota minimal 2 karakter';
        if (value.trim().length > 50) return 'Kota maksimal 50 karakter';
        break;
      case 'province':
        if (value.trim().length < 2) return 'Provinsi minimal 2 karakter';
        if (value.trim().length > 50) return 'Provinsi maksimal 50 karakter';
        break;
    }
    return '';
  };

  const isFieldValid = (
    fieldName: string,
    value: string,
    isRequired: boolean = true
  ) => {
    return !getFieldError(fieldName, value, isRequired);
  };

  const convertToPickLocationFormat = (
    location: { address: string; latitude: number; longitude: number } | null
  ): { latitude: number; longitude: number } | null => {
    if (!location) return null;
    return {
      latitude: location.latitude,
      longitude: location.longitude,
    };
  };

  const handleSaveLocationFromPicker = (payload: SavedLocationPayload) => {
    console.log('=== LOCATION PICKER SAVE ===');
    console.log('Raw address:', payload.address);
    console.log('Parsed components:', payload.addressComponents);

    const locationData = {
      address: payload.address,
      latitude: payload.latitude,
      longitude: payload.longitude,
    };

    setSelectedLocation(locationData);

    const cityFromPicker =
      payload.city || payload.addressComponents?.kota || '';
    const provinceFromPicker =
      payload.province || payload.addressComponents?.provinsi || '';

    console.log('Using parsed data:');
    console.log('City:', cityFromPicker);
    console.log('Province:', provinceFromPicker);

    setFormData((prev) => ({
      ...prev,
      location: {
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
      address: payload.address,
      city: cityFromPicker,
      province: provinceFromPicker,
    }));

    setShowLocationPicker(false);
    console.log('=== DONE ===');
  };

  const handleCancelLocationPicker = () => {
    setShowLocationPicker(false);
  };

  const handleOpenLocationPicker = () => {
    setShowLocationPicker(true);
  };

  // handleNextStep dihapus, tidak diperlukan

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      'username',
      'phone_number',
      'address',
      'city',
      'province',
      'email',
      'password',
      'confirmPassword',
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof CollectorFormData]?.toString().trim()
    );
    if (missingFields.length > 0) {
      setError('Mohon lengkapi semua field yang wajib diisi.');
      return;
    }
    if (!formData.location) {
      setError('Mohon pilih lokasi di peta.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak sesuai.');
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError('Format email tidak valid.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Prepare data for registration API (same format as register)
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone_number: formData.phone_number,
        institution: formData.institution,
        institution_id: formData.institution_id,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        location: {
          latitude: Number(formData.location.latitude),
          longitude: Number(formData.location.longitude),
        },
      };
      await registerAPI.register(registrationData);
      showToast.success('Kolektor berhasil ditambahkan!');
      router.push('/wastebank-unit/collectors');
    } catch {
      setError('Gagal menambah kolektor!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='text-lg text-gray-600'>Loading...</div>
          <div className='mt-2 text-sm text-gray-500'>Loading form data...</div>
        </div>
      </div>
    );
  }

  if (error && !currentUser) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='text-lg text-red-600'>{error}</div>
          <button
            onClick={() => router.push('/wastebank-unit/collectors')}
            className='mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700'
          >
            Kembali ke Daftar Kolektor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='shadow-xs rounded-xl border border-zinc-200 bg-white p-4'>
            <UserPlus className='text-emerald-600' size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Tambah Kolektor Baru
            </h1>
            <p className='mt-1 text-gray-600'>
              Daftarkan kolektor baru untuk {currentUser?.institution}
            </p>
          </div>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button
            onClick={() => router.back()}
            className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'
          >
            <ArrowLeft size={20} className='mr-2 inline' />
            Kembali
          </button>
        </div>
      </div>

      {/* Form Container */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        {/* Error Message */}
        {error && (
          <div className='mb-6 rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm text-red-600'>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleFormSubmit} className='space-y-5'>
          {/* Role Display (disabled) */}
          <div>
            <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
              Role Kolektor
            </label>
            <input
              type='text'
              value={
                formData.role === 'waste_collector_unit'
                  ? 'Waste Collector Unit'
                  : 'Waste Collector Central'
              }
              disabled
              className='w-full rounded-lg border border-gray-200 bg-gray-100 p-3 text-sm text-gray-600 sm:text-base'
            />
            <p className='mt-1 text-center text-sm text-gray-400'>
              Role otomatis disesuaikan dengan bank sampah Anda
            </p>
          </div>

          {/* Institution Display (disabled) */}
          <div>
            <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
              Institusi
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4'>
                <Building2 className='h-4 w-4 text-gray-400' />
              </div>
              <input
                type='text'
                value={formData.institution}
                disabled
                className='w-full rounded-lg border border-gray-200 bg-gray-100 p-3 pl-10 text-sm text-gray-600 sm:text-base'
              />
            </div>
            <p className='mt-1 text-center text-sm text-gray-400'>
              Kolektor akan terdaftar di institusi yang sama dengan Anda
            </p>
          </div>

          {/* Email */}
          <div>
            <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
              Alamat Email <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4'>
                <Mail className='h-4 w-4 text-gray-400' />
              </div>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder='Masukkan email kolektor'
                autoComplete='email'
                inputMode='email'
                className={`shadow-xs w-full rounded-lg border border-gray-200 bg-white p-3 pl-9 text-sm text-gray-800 transition-all duration-200 placeholder:text-xs placeholder:text-gray-400 sm:p-3 sm:pl-10 sm:text-base sm:placeholder:text-sm ${
                  touchedFields.has('email') &&
                  !isFieldValid('email', formData.email)
                    ? 'border-red-300 bg-red-50'
                    : touchedFields.has('email') &&
                        isFieldValid('email', formData.email)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                }`}
                required
                spellCheck={false}
                autoCapitalize='none'
              />
            </div>
            {touchedFields.has('email') && (
              <p
                className={`mt-1 text-[10px] sm:text-xs ${isFieldValid('email', formData.email) ? 'text-green-600' : 'text-red-600'}`}
              >
                {getFieldError('email', formData.email) || 'Email valid'}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
              Kata Sandi <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4'>
                <Lock className='h-4 w-4 text-gray-400' />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                placeholder='Minimal 8 karakter'
                className={`shadow-xs w-full rounded-lg border border-gray-200 bg-white p-3 pl-9 pr-10 text-sm text-gray-800 transition-all duration-200 placeholder:text-xs placeholder:text-gray-400 sm:p-3 sm:pl-10 sm:pr-12 sm:text-base sm:placeholder:text-sm ${
                  touchedFields.has('password') &&
                  !isFieldValid('password', formData.password)
                    ? 'border-red-300 bg-red-50'
                    : touchedFields.has('password') &&
                        isFieldValid('password', formData.password)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                }`}
                required
                maxLength={100}
              />
              <div className='absolute inset-y-0 right-0 flex items-center space-x-2 pr-3'>
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  className='cursor-pointer select-none text-gray-500'
                  role='button'
                  tabIndex={0}
                >
                  {showPassword ? (
                    <Eye className='h-4.5 w.5 text-gray-400' />
                  ) : (
                    <EyeOff className='h-4.5 w.5 text-gray-400' />
                  )}
                </span>
              </div>
            </div>
            {touchedFields.has('password') && (
              <p
                className={`text-[10px] sm:text-xs ${isFieldValid('password', formData.password) ? 'text-green-600' : 'text-red-600'}`}
              >
                {getFieldError('password', formData.password) ||
                  'Password memenuhi syarat'}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
              Konfirmasi Kata Sandi <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4'>
                <Lock className='h-4 w-4 text-gray-400' />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name='confirmPassword'
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder='Konfirmasi kata sandi'
                className={`shadow-xs w-full rounded-lg border border-gray-200 bg-white p-3 pl-9 pr-10 text-sm text-gray-800 transition-all duration-200 placeholder:text-xs placeholder:text-gray-400 sm:p-3 sm:pl-10 sm:pr-12 sm:text-base sm:placeholder:text-sm ${
                  touchedFields.has('confirmPassword') &&
                  !isFieldValid('confirmPassword', formData.confirmPassword)
                    ? 'border-red-300 bg-red-50'
                    : touchedFields.has('confirmPassword') &&
                        isFieldValid(
                          'confirmPassword',
                          formData.confirmPassword
                        )
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                }`}
                required
              />
              <div className='absolute inset-y-0 right-0 flex items-center space-x-2 pr-3'>
                <span
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className='cursor-pointer select-none text-gray-500'
                  role='button'
                  tabIndex={0}
                >
                  {showConfirmPassword ? (
                    <Eye className='h-4.5 w.5 text-gray-400' />
                  ) : (
                    <EyeOff className='h-4.5 w.5 text-gray-400' />
                  )}
                </span>
              </div>
            </div>
            {touchedFields.has('confirmPassword') && (
              <p
                className={`text-[10px] sm:text-xs ${isFieldValid('confirmPassword', formData.confirmPassword) ? 'text-green-600' : 'text-red-600'}`}
              >
                {getFieldError('confirmPassword', formData.confirmPassword) ||
                  'Password sesuai'}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
              Nama Lengkap <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4'>
                <User className='h-4 w-4 text-gray-400' />
              </div>
              <input
                type='text'
                name='username'
                value={formData.username}
                onChange={handleChange}
                onBlur={() => handleBlur('username')}
                placeholder='Masukkan nama lengkap kolektor'
                className={`w-full rounded-lg border bg-white p-3 pl-10 text-sm text-gray-800 placeholder:text-xs placeholder:text-gray-400 sm:text-base sm:placeholder:text-sm ${
                  touchedFields.has('username') &&
                  !isFieldValid('username', formData.username)
                    ? 'border-red-300 bg-red-50'
                    : touchedFields.has('username') &&
                        isFieldValid('username', formData.username)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                }`}
                required
              />
            </div>
            {touchedFields.has('username') && (
              <p
                className={`text-[10px] sm:text-xs ${isFieldValid('username', formData.username) ? 'text-green-600' : 'text-red-600'}`}
              >
                {getFieldError('username', formData.username) || 'Nama valid'}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
              Nomor Telepon <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4'>
                <Phone className='h-4 w-4 text-gray-400' />
              </div>
              <input
                type='tel'
                name='phone_number'
                value={formData.phone_number}
                onChange={handleChange}
                onBlur={() => handleBlur('phone_number')}
                placeholder='081234567890'
                className={`w-full rounded-lg border bg-white p-3 pl-10 text-sm text-gray-800 placeholder:text-xs placeholder:text-gray-400 sm:text-base sm:placeholder:text-sm ${
                  touchedFields.has('phone_number') &&
                  !isFieldValid('phone_number', formData.phone_number)
                    ? 'border-red-300 bg-red-50'
                    : touchedFields.has('phone_number') &&
                        isFieldValid('phone_number', formData.phone_number)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                }`}
                required
                maxLength={13}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    return;
                  }
                  if (
                    [8, 9, 13, 27, 46].includes(e.keyCode) ||
                    ([65, 67, 86, 88].includes(e.keyCode) &&
                      e.ctrlKey === true) ||
                    (e.keyCode >= 35 && e.keyCode <= 40)
                  ) {
                    return;
                  }
                  if (
                    (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                    (e.keyCode < 96 || e.keyCode > 105)
                  ) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const paste = e.clipboardData.getData('text');
                  const cleanPaste = paste.replace(/\D/g, '');
                  if (cleanPaste) {
                    setFormData((prev) => ({
                      ...prev,
                      phone_number: cleanPaste.slice(0, 13),
                    }));
                  }
                }}
              />
            </div>
            {touchedFields.has('phone_number') && (
              <p
                className={`text-[10px] sm:text-xs ${isFieldValid('phone_number', formData.phone_number) ? 'text-green-600' : 'text-red-600'}`}
              >
                {getFieldError('phone_number', formData.phone_number) ||
                  'Format nomor telepon valid'}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
              Alamat <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4'>
                <MapPin className='h-4 w-4 text-gray-400' />
              </div>
              <input
                type='text'
                name='address'
                value={formData.address}
                onChange={handleChange}
                onBlur={() => handleBlur('address')}
                placeholder='Masukkan alamat kolektor'
                className={`w-full rounded-lg border bg-white p-3 pl-10 text-sm text-gray-800 placeholder:text-xs placeholder:text-gray-400 sm:text-base sm:placeholder:text-sm ${
                  touchedFields.has('address') &&
                  !isFieldValid('address', formData.address)
                    ? 'border-red-300 bg-red-50'
                    : touchedFields.has('address') &&
                        isFieldValid('address', formData.address)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                }`}
                required
              />
            </div>
            {touchedFields.has('address') && (
              <p
                className={`text-[10px] sm:text-xs ${isFieldValid('address', formData.address) ? 'text-green-600' : 'text-red-600'}`}
              >
                {getFieldError('address', formData.address) || 'Alamat valid'}
              </p>
            )}
          </div>

          {/* City & Province */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
                Kota/Kabupaten <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='city'
                value={formData.city}
                onChange={handleChange}
                onBlur={() => handleBlur('city')}
                placeholder='Masukkan kota/kabupaten'
                className={`w-full rounded-lg border bg-white p-3 text-sm text-gray-800 placeholder:text-xs placeholder:text-gray-400 sm:text-base sm:placeholder:text-sm ${
                  touchedFields.has('city') &&
                  !isFieldValid('city', formData.city)
                    ? 'border-red-300 bg-red-50'
                    : touchedFields.has('city') &&
                        isFieldValid('city', formData.city)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                }`}
                required
              />
              {touchedFields.has('city') && (
                <p
                  className={`text-[10px] sm:text-xs ${isFieldValid('city', formData.city) ? 'text-green-600' : 'text-red-600'}`}
                >
                  {getFieldError('city', formData.city) || 'Kota valid'}
                </p>
              )}
            </div>
            <div>
              <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
                Provinsi <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='province'
                value={formData.province}
                onChange={handleChange}
                onBlur={() => handleBlur('province')}
                placeholder='Masukkan provinsi'
                className={`w-full rounded-lg border bg-white p-3 text-sm text-gray-800 placeholder:text-xs placeholder:text-gray-400 sm:text-base sm:placeholder:text-sm ${
                  touchedFields.has('province') &&
                  !isFieldValid('province', formData.province)
                    ? 'border-red-300 bg-red-50'
                    : touchedFields.has('province') &&
                        isFieldValid('province', formData.province)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                }`}
                required
              />
              {touchedFields.has('province') && (
                <p
                  className={`text-[10px] sm:text-xs ${isFieldValid('province', formData.province) ? 'text-green-600' : 'text-red-600'}`}
                >
                  {getFieldError('province', formData.province) ||
                    'Provinsi valid'}
                </p>
              )}
            </div>
          </div>

          {/* Get Location */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <button
                type='button'
                onClick={handleOpenLocationPicker}
                className='flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-0'
              >
                <MapPin className='h-4 w-4' />
                {selectedLocation
                  ? 'Ubah Lokasi di Peta'
                  : 'Pilih Lokasi di Peta'}
              </button>

              {formData.location && (
                <div className='flex hidden items-center space-x-2'>
                  <span className='text-sm font-medium text-green-600'>
                    📍 Lokasi berhasil didapat
                  </span>
                  <span className='text-xs text-gray-500'>
                    ({formData.location.latitude.toFixed(4)},{' '}
                    {formData.location.longitude.toFixed(4)})
                  </span>
                </div>
              )}
            </div>

            {/* Location requirement info */}
            {!formData.location && (
              <div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
                <div className='flex items-start space-x-2'>
                  <span className='mt-0.5 text-amber-500'>⚠️</span>
                  <div className='text-sm'>
                    <p className='font-medium text-amber-800'>
                      Lokasi GPS Diperlukan
                    </p>
                    <p className='mt-1 text-amber-700'>
                      Silakan klik tombol &quot;Pilih Lokasi di Peta&quot; untuk
                      mengisi koordinat lokasi kolektor.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={submitting}
              className='mt-4 transform rounded-lg bg-emerald-600 p-3 px-10 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-700 disabled:opacity-50 sm:text-base'
            >
              {submitting ? (
                <>
                  <div className='mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                  Mendaftarkan...
                </>
              ) : (
                <>
                  <Save size={20} className='mr-2 inline' />
                  Daftarkan Kolektor
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className='fixed inset-0 z-50 bg-black bg-opacity-50'>
          <div className='h-full w-full bg-white'>
            <PickLocation
              initialLocation={convertToPickLocationFormat(selectedLocation)}
              onSaveLocation={handleSaveLocationFromPicker}
              onCancel={handleCancelLocationPicker}
              allowBack={true}
              pageTitle='Pilih Lokasi Kolektor'
            />
          </div>
        </div>
      )}

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className='mt-4 hidden rounded border border-yellow-300 bg-yellow-50 p-2 text-xs'>
          <strong>DEBUG Location State:</strong>
          <pre>
            {JSON.stringify(
              {
                showLocationPicker,
                selectedLocation,
                formDataCoordinates: formData.location,
                formDataAddress: formData.address,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
