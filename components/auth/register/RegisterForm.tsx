'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  MapPin,
  UserPlus,
} from 'lucide-react';
import { RegisterFormProps } from '@/types/auth';
import { getCurrentLocation } from '@/helpers/utils/register/register';
import { alerts } from '@/components/alerts/alerts';
import { ROLES, ROLE_DESCRIPTIONS } from '@/helpers/utils/register/register';

export default function RegisterForm({
  formData,
  onFormDataChange,
  onSubmit,
  loading,
  error,
}: RegisterFormProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const handleBlur = (fieldName: string) => {
    setTouchedFields((prev) => new Set([...prev, fieldName]));
  };

  const formatPhoneDisplay = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');

    // Make sure it starts with '08'
    if (!numbers.startsWith('08')) {
      return numbers.startsWith('8') ? '0' + numbers : '08';
    }

    // Split into groups of 4
    const groups = [];
    for (let i = 0; i < numbers.length && i < 12; i += 4) {
      groups.push(numbers.slice(i, i + 4));
    }

    return groups.join('-');
  };

  const getCleanPhoneNumber = (phone: string) => {
    return phone.replace(/-/g, '');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const formattedValue = formatPhoneDisplay(value);
      const cleanValue = getCleanPhoneNumber(formattedValue);

      onFormDataChange({
        ...formData,
        [name]: formattedValue,
        phoneClean: cleanValue, // Add this to your FormData interface
      });
      return;
    }

    onFormDataChange({
      ...formData,
      [name]: value,
    });
  };

  const isValidEmail = (email: string) => {
    // RFC 5322 standard email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const isValidIndonesianPhone = (phone: string) => {
    // Remove dashes and check format
    const cleanNumber = phone.replace(/-/g, '');
    const phoneRegex = /^08[1-9][0-9]{7,9}$/;
    return phoneRegex.test(cleanNumber);
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
      case 'phone':
        if (!isValidIndonesianPhone(value)) {
          return 'Format: 08xx-xxxx-xxxx (10-12 digit)';
        }
        break;
      case 'fullName':
        if (value.trim().length < 2) return 'Nama minimal 2 karakter';
        if (value.trim().length > 100) return 'Nama maksimal 100 karakter';
        break;
      case 'institution':
        if (isRequired && value.trim().length < 2)
          return 'Institusi minimal 2 karakter';
        if (value.trim().length > 100) return 'Institusi maksimal 100 karakter';
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

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const locationData = await getCurrentLocation();

      onFormDataChange({
        ...formData,
        coordinates: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        },
        address: locationData.address || formData.address,
        city: locationData.city || formData.city,
        province: locationData.province || formData.province,
      });
    } catch (error) {
      console.error('Error getting location:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Error mendapatkan lokasi';

      if (errorMessage.includes('ditolak')) {
        await alerts.locationPermissionDenied();
      } else {
        await alerts.error('Gagal Mendapatkan Lokasi', errorMessage);
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const handleNextStep = () => {
    setTouchedFields(
      (prev) => new Set([...prev, 'email', 'password', 'confirmPassword'])
    );

    if (!formData.password || !formData.confirmPassword) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (formData.password.length < 8) {
      return;
    }

    if (!isValidEmail(formData.email)) {
      return;
    }

    setStep(step + 1);
  };

  return (
    <div className='w-full rounded-lg'>
      {/* Header Icon */}
      <div className='mb-6 text-center'>
        <div className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100'>
          <UserPlus size={20} className='text-emerald-600 h-6 w-6' />
        </div>
      </div>

      {/* Form Header */}
      <div className='mb-6 text-center'>
        <h1 className='mb-2 text-base font-bold text-gray-800 sm:text-2xl'>
          Buat Akun
        </h1>
        <p className='mt-2 text-xs text-gray-600 sm:text-base'>
          {step === 1 ? 'Pilih role Anda' : 'Lengkapi informasi Anda'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className='mx-auto mb-8 max-w-[240px] sm:max-w-sm'>
        <div className='mb-2 flex items-center'>
          <div className='flex items-center'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-500 bg-white text-xs font-medium text-emerald-500'>
              1
            </div>
          </div>
          <div
            className={`mx-2 h-1 flex-1 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`}
          ></div>
          <div className='flex items-center'>
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-medium ${step >= 2 ? 'border-emerald-500 bg-white text-emerald-500' : 'border-gray-300 bg-white text-gray-400'}`}
            >
              2
            </div>
          </div>
        </div>
        <div className='flex justify-between text-sm text-gray-600'>
          <span
            className={`${step >= 1 ? 'font-medium text-emerald-600' : ''}`}
          >
            Akun
          </span>
          <span
            className={`${step >= 2 ? 'font-medium text-emerald-600' : ''}`}
          >
            Profil
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='mb-6 rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm text-red-600'>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className='space-y-5'>
        {step === 1 ? (
          <>
            {/* Role Selection */}
            <div>
              <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
                Pilih Role Anda
              </label>
              <select
                name='role'
                value={formData.role}
                onChange={handleChange}
                className='w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-800 sm:text-base'
              >
                {Object.entries(ROLES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              <p className='mt-1 text-sm text-center text-gray-400'>
                {
                  ROLE_DESCRIPTIONS[
                    formData.role as keyof typeof ROLE_DESCRIPTIONS
                  ]
                }
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
                  placeholder='Masukkan email Anda'
                  className={`w-full rounded-lg border border-gray-200 bg-white p-3 pl-9 text-sm text-gray-800 shadow-xs transition-all duration-200 placeholder:text-xs placeholder:text-gray-400 sm:p-3 sm:pl-10 sm:text-base sm:placeholder:text-sm ${
                    touchedFields.has('email') &&
                    !isFieldValid('email', formData.email)
                      ? 'border-red-300 bg-red-50'
                      : touchedFields.has('email') &&
                          isFieldValid('email', formData.email)
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200'
                  }`}
                  required
                />
                {touchedFields.has('email') &&
                  isFieldValid('email', formData.email) && (
                    <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                      <span className='hidden text-green-500'>✓</span>
                    </div>
                  )}
              </div>
              {touchedFields.has('email') && (
                <p
                  className={`mt-1 text-[10px] sm:text-xs ${
                    isFieldValid('email', formData.email)
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
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
                  className={`w-full rounded-lg border border-gray-200 bg-white p-3 pl-9 pr-10 text-sm text-gray-800 shadow-xs transition-all duration-200 placeholder:text-xs placeholder:text-gray-400 sm:p-3 sm:pl-10 sm:pr-12 sm:text-base sm:placeholder:text-sm ${
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
                  {touchedFields.has('password') &&
                    isFieldValid('password', formData.password) && (
                      <span className='hidden text-green-500'>✓</span>
                    )}
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
                  className={`text-[10px] sm:text-xs ${
                    isFieldValid('password', formData.password)
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
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
                  placeholder='Konfirmasi kata sandi Anda'
                  className={`w-full rounded-lg border border-gray-200 bg-white p-3 pl-9 pr-10 text-sm text-gray-800 shadow-xs transition-all duration-200 placeholder:text-xs placeholder:text-gray-400 sm:p-3 sm:pl-10 sm:pr-12 sm:text-base sm:placeholder:text-sm ${
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
                  {touchedFields.has('confirmPassword') &&
                    isFieldValid(
                      'confirmPassword',
                      formData.confirmPassword
                    ) && <span className='hidden text-green-500'>✓</span>}
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
                  className={`text-[10px] sm:text-xs ${
                    isFieldValid('confirmPassword', formData.confirmPassword)
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {getFieldError('confirmPassword', formData.confirmPassword) ||
                    'Password sesuai'}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
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
                  name='fullName'
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fullName')}
                  placeholder='Masukkan nama lengkap Anda'
                  className={`w-full rounded-lg border bg-white p-3 pl-10 text-sm text-gray-800 placeholder:text-xs placeholder:text-gray-400 sm:text-base sm:placeholder:text-sm ${
                    touchedFields.has('fullName') &&
                    !isFieldValid('fullName', formData.fullName)
                      ? 'border-red-300 bg-red-50'
                      : touchedFields.has('fullName') &&
                          isFieldValid('fullName', formData.fullName)
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200'
                  }`}
                  required
                />
                {touchedFields.has('fullName') &&
                  isFieldValid('fullName', formData.fullName) && (
                    <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                      <span className='hidden text-green-500'>✓</span>
                    </div>
                  )}
              </div>
              {touchedFields.has('fullName') && (
                <p
                  className={`text-[10px] sm:text-xs ${
                    isFieldValid('fullName', formData.fullName)
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {getFieldError('fullName', formData.fullName) || 'Nama valid'}
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
                  name='phone'
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phone')}
                  placeholder='0812-3456-7890'
                  className={`w-full rounded-lg border bg-white p-3 pl-10 text-sm text-gray-800 placeholder:text-xs placeholder:text-gray-400 sm:text-base sm:placeholder:text-sm ${
                    touchedFields.has('phone') &&
                    !isFieldValid('phone', formData.phone)
                      ? 'border-red-300 bg-red-50'
                      : touchedFields.has('phone') &&
                          isFieldValid('phone', formData.phone)
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200'
                  }`}
                  required
                  maxLength={14} // 12 digits + 2 dashes
                  onKeyDown={(e) => {
                    // Allow: backspace, delete, tab, escape, enter, dash
                    if (
                      [8, 9, 13, 27, 46, 189, 109].includes(e.keyCode) ||
                      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                      ([65, 67, 86, 88].includes(e.keyCode) &&
                        e.ctrlKey === true) ||
                      // Allow: home, end, left, right
                      (e.keyCode >= 35 && e.keyCode <= 39)
                    ) {
                      return;
                    }
                    // Block any non-number inputs
                    if (
                      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                      (e.keyCode < 96 || e.keyCode > 105)
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
                {touchedFields.has('phone') &&
                  isFieldValid('phone', formData.phone) && (
                    <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                      <span className='hidden text-green-500'>✓</span>
                    </div>
                  )}
              </div>
              {touchedFields.has('phone') && (
                <p
                  className={`text-[10px] sm:text-xs ${
                    isFieldValid('phone', formData.phone)
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {getFieldError('phone', formData.phone) ||
                    'Format nomor telepon valid'}
                </p>
              )}
            </div>

            {/* Institution */}
            {formData.role !== 'customer' && (
              <div>
                <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
                  Institusi <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4'>
                    <Building2 className='h-4 w-4 text-gray-400' />
                  </div>
                  <input
                    type='text'
                    name='institution'
                    value={formData.institution}
                    onChange={handleChange}
                    onBlur={() => handleBlur('institution')}
                    placeholder='Masukkan nama institusi Anda'
                    className={`w-full rounded-lg border bg-white p-3 pl-10 text-sm text-gray-800 placeholder:text-xs placeholder:text-gray-400 sm:text-base sm:placeholder:text-sm ${
                      touchedFields.has('institution') &&
                      !isFieldValid(
                        'institution',
                        formData.institution,
                        formData.role !== 'customer'
                      )
                        ? 'border-red-300 bg-red-50'
                        : touchedFields.has('institution') &&
                            isFieldValid(
                              'institution',
                              formData.institution,
                              formData.role !== 'customer'
                            )
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200'
                    }`}
                    required
                  />
                  {touchedFields.has('institution') &&
                    isFieldValid(
                      'institution',
                      formData.institution,
                      formData.role !== 'customer'
                    ) && (
                      <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                        <span className='hidden text-green-500'>✓</span>
                      </div>
                    )}
                </div>
                {touchedFields.has('institution') && (
                  <p
                    className={`text-[10px] sm:text-xs ${
                      isFieldValid(
                        'institution',
                        formData.institution,
                        formData.role !== 'customer'
                      )
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {getFieldError(
                      'institution',
                      formData.institution,
                      formData.role !== 'customer'
                    ) || 'Institusi valid'}
                  </p>
                )}
              </div>
            )}

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
                  placeholder='Masukkan alamat Anda'
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
                {touchedFields.has('address') &&
                  isFieldValid('address', formData.address) && (
                    <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                      <span className='hidden text-green-500'>✓</span>
                    </div>
                  )}
              </div>
              {touchedFields.has('address') && (
                <p
                  className={`text-[10px] sm:text-xs ${
                    isFieldValid('address', formData.address)
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {getFieldError('address', formData.address) || 'Alamat valid'}
                </p>
              )}
            </div>

            {/* City & Province */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div>
                <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
                  Kota <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='city'
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={() => handleBlur('city')}
                  placeholder='Masukkan kota Anda'
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
                    className={`text-[10px] sm:text-xs ${
                      isFieldValid('city', formData.city)
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
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
                  placeholder='Masukkan provinsi Anda'
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
                    className={`text-[10px] sm:text-xs ${
                      isFieldValid('province', formData.province)
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
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
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  className='flex items-center p-0 text-xs sm:text-sm text-emerald-600 hover:text-emerald-500 focus:outline-none focus:ring-0 disabled:opacity-50'
                >
                  <MapPin className='mr-2 h-4 w-4' />
                  {locationLoading
                    ? 'Mendapatkan Lokasi...'
                    : 'Dapatkan Lokasi Saat Ini'}
                </button>
                {formData.coordinates && (
                  <div className='hidden flex items-center space-x-2'>
                    <span className='text-sm font-medium text-green-600'>
                      📍 Lokasi berhasil didapat
                    </span>
                    <span className='text-xs text-gray-500'>
                      ({formData.coordinates.latitude.toFixed(4)},{' '}
                      {formData.coordinates.longitude.toFixed(4)})
                    </span>
                  </div>
                )}
              </div>

              {/* Location requirement info */}
              {!formData.coordinates && (
                <div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
                  <div className='flex items-start space-x-2'>
                    <span className='mt-0.5 text-amber-500'>⚠️</span>
                    <div className='text-sm'>
                      <p className='font-medium text-amber-800'>
                        Lokasi GPS Diperlukan
                      </p>
                      <p className='mt-1 text-amber-700'>
                        Silakan klik tombol &quot;Dapatkan Lokasi Saat Ini&quot; untuk
                        mengisi koordinat lokasi Anda secara otomatis.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Buttons */}
        <div className='flex justify-between'>
          {step > 1 && (
            <button
              type='button'
              onClick={() => setStep(step - 1)}
              className='mr-auto mt-4 transform rounded-lg border border-gray-200 px-10 py-3 text-sm font-semibold text-gray-400 shadow-sm transition-all duration-200 hover:border-gray-400 hover:text-gray-500 hover:scale-[1.02] focus:outline-none sm:text-base'
            >
              Kembali
            </button>
          )}
          {step < 2 && (
            <button
              type='button'
              onClick={handleNextStep}
              className='ml-auto mt-4 px-12 transform rounded-lg bg-emerald-600 p-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-700 sm:text-base'
            >
              Lanjut
            </button>
          )}
          {step === 2 && (
            <button
              type='submit'
              disabled={loading}
              className='ml-auto mt-4 px-10 transform rounded-lg bg-emerald-600 p-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-700 sm:text-base'
            >
              {loading ? 'Membuat Akun...' : 'Buat Akun'}
            </button>
          )}
        </div>
      </form>

      {/* Footer - Login Link */}
      <p className='mt-6 text-center text-xs text-gray-700 sm:text-sm'>
        Sudah punya akun?{' '}
        <Link
          href='/login'
          className='text-xs font-semibold text-emerald-600 hover:text-emerald-700 sm:text-sm'
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
