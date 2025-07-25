'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import { RegisterFormProps, InstitutionSuggestion } from '@/types';
import PickLocation from '@/components/ui/PickLocation';
import { SavedLocationPayload } from '@/types';
import { ROLES, ROLE_DESCRIPTIONS } from '@/constants';
import { Alert } from '@/components/ui';
import { userListAPI } from '@/services/api/user';

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
  // const [locationLoading, setLocationLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Institution autocomplete state
  const [institutionSuggestions, setInstitutionSuggestions] = useState<
    InstitutionSuggestion[]
  >([]);
  const [showInstitutionSuggestions, setShowInstitutionSuggestions] =
    useState(false);
  const [institutionLoading, setInstitutionLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleBlur = (fieldName: string) => {
    setTouchedFields((prev) => new Set([...prev, fieldName]));
  };

  // Hybrid approach: Format with dash for display, but allow normal input
  const formatPhoneDisplay = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');

    if (numbers.length === 0) return '';

    // Auto-correct: if starts with 8, add 0
    if (numbers.startsWith('8') && !numbers.startsWith('08')) {
      return '0' + numbers.slice(0, 12);
    }

    // Limit to 13 digits
    return numbers.slice(0, 13);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'phone_number') {
      const formattedValue = formatPhoneDisplay(value);

      onFormDataChange({
        ...formData,
        [name]: formattedValue,
      });
      return;
    }

    // Handle institution autocomplete for collector roles
    if (
      name === 'institution' &&
      (formData.role === 'waste_collector_unit' ||
        formData.role === 'waste_collector_central')
    ) {
      // Clear previous search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Show/hide suggestions based on input
      if (value.length > 0) {
        setShowInstitutionSuggestions(true);
        // Debounce the search to avoid too many API calls
        searchTimeoutRef.current = setTimeout(() => {
          searchInstitutions(value);
        }, 300);
      } else {
        setShowInstitutionSuggestions(false);
        setInstitutionSuggestions([]);
        setInstitutionLoading(false);
      }

      // Reset institution_id when typing manually (only for institution field)
      onFormDataChange({
        ...formData,
        [name]: value,
        institution_id: '', // Reset institution_id only when typing in institution field
      });
      return;
    }

    // For all other fields, preserve institution_id
    onFormDataChange({
      ...formData,
      [name]: value,
    });
  };

  // Search institutions based on role and query
  const searchInstitutions = useCallback(
    async (query: string) => {
      // Double check role before proceeding
      if (
        !formData.role ||
        (formData.role !== 'waste_collector_unit' &&
          formData.role !== 'waste_collector_central')
      ) {
        return;
      }

      // Don't search if query is too short
      if (query.trim().length < 1) {
        setInstitutionSuggestions([]);
        setShowInstitutionSuggestions(false);
        return;
      }

      setInstitutionLoading(true);
      try {
        // console.log(
        //   'Searching institutions with query:',
        //   query,
        //   'role:',
        //   formData.role
        // );

        // Use public API for institution suggestions (no authentication required)
        const response = await userListAPI.getPublicInstitutionSuggestions({
          role: formData.role,
          query: query.trim(),
          limit: 10,
        });

        // console.log('Institution search response:', response);

        if (response && response.data && response.data.institutions) {
          setInstitutionSuggestions(response.data.institutions);
        } else {
          setInstitutionSuggestions([]);
        }
      } catch (error) {
        console.error('Error searching institutions:', error);
        setInstitutionSuggestions([]);

        // Don't show error to user, just silently fail
        // The autocomplete will show "Tidak ada hasil ditemukan"
      } finally {
        setInstitutionLoading(false);
      }
    },
    [formData.role]
  );

  // Handle institution selection from suggestions
  const handleInstitutionSelect = (suggestion: InstitutionSuggestion) => {
    try {
      onFormDataChange({
        ...formData,
        institution: suggestion.institution,
        institution_id: suggestion.id.toString(), // Simpan institution_id
      });
      setShowInstitutionSuggestions(false);
      setInstitutionSuggestions([]);

      // Clear any pending searches
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    } catch (error) {
      console.error('Error selecting institution:', error);
    }
  };

  // Close suggestions when clicking outside
  const handleInstitutionBlur = () => {
    try {
      // Clear any pending searches
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }

      // Add a small delay to allow clicking on suggestions
      setTimeout(() => {
        setShowInstitutionSuggestions(false);
      }, 200);

      handleBlur('institution');
    } catch (error) {
      console.error('Error in institution blur:', error);
      setShowInstitutionSuggestions(false);
    }
  };

  const isValidEmail = (email: string) => {
    // RFC 5322 standard email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const isValidIndonesianPhone = (phone_number: string) => {
    // Remove dashes and check format
    const cleanNumber = phone_number.replace(/\D/g, '');

    // Must start with 08 and have 10-13 digits total
    if (!cleanNumber.startsWith('08')) return false;
    if (cleanNumber.length < 10 || cleanNumber.length > 13) return false;

    // Third digit must be 1-9 (not 0)
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

    onFormDataChange({
      ...formData,
      location: {
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
      address: payload.address,
      city: cityFromPicker,
      province: provinceFromPicker,
      // district: payload.district || payload.addressComponents?.kecamatan || '',
      // postalCode: payload.postalCode || payload.addressComponents?.kodePos || '',
    });

    setShowLocationPicker(false);
    console.log('=== DONE ===');
  };

  const handleCancelLocationPicker = () => {
    setShowLocationPicker(false);
  };

  const handleOpenLocationPicker = () => {
    setShowLocationPicker(true);
  };

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only send fields needed by backend (exclude confirmPassword)
    const pureData = JSON.parse(
      JSON.stringify({
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
        location: formData.location
          ? {
              latitude: Number(formData.location.latitude),
              longitude: Number(formData.location.longitude),
            }
          : null,
      })
    );

    if (step === 1) {
      handleNextStep();
    } else {
      if (
        formData.role === 'waste_collector_unit' ||
        formData.role === 'waste_collector_central'
      ) {
        if (!formData.institution_id || formData.institution_id.trim() === '') {
          Alert.warning({
            title: 'Pilih Institusi',
            text: 'Untuk role waste collector, Anda harus memilih institusi dari daftar suggestions.',
          });
          return;
        }
      }
      // Pass only pureData to onSubmit, not the whole formData
      onSubmit(pureData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step === 2) {
      e.preventDefault();
      return false;
    }
  };

  return (
    <div className='w-full rounded-lg'>
      {/* Header Icon */}
      <div className='mb-6 hidden text-center'>
        <div className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100'>
          <UserPlus size={20} className='h-6 w-6 text-emerald-600' />
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
      <form onSubmit={handleFormSubmit} className='space-y-5'>
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
              <p className='mt-1 text-center text-sm text-gray-400'>
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
                  name='username'
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={() => handleBlur('username')}
                  onKeyDown={handleKeyDown}
                  placeholder='Masukkan nama lengkap Anda'
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
                {touchedFields.has('username') &&
                  isFieldValid('username', formData.username) && (
                    <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                      <span className='hidden text-green-500'>✓</span>
                    </div>
                  )}
              </div>
              {touchedFields.has('username') && (
                <p
                  className={`text-[10px] sm:text-xs ${
                    isFieldValid('username', formData.username)
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
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
                  maxLength={13} // 08 + 11 digits max
                  onKeyDown={(e) => {
                    // Prevent form submission on Enter key
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      return;
                    }
                    // Allow: backspace, delete, tab, escape, enter
                    if (
                      [8, 9, 13, 27, 46].includes(e.keyCode) ||
                      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                      ([65, 67, 86, 88].includes(e.keyCode) &&
                        e.ctrlKey === true) ||
                      // Allow: home, end, left, right, up, down
                      (e.keyCode >= 35 && e.keyCode <= 40)
                    ) {
                      return;
                    }
                    // Only allow numbers (0-9)
                    if (
                      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                      (e.keyCode < 96 || e.keyCode > 105)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    // Allow paste but clean the pasted content
                    e.preventDefault();
                    const paste = e.clipboardData.getData('text');
                    const cleanPaste = paste.replace(/\D/g, '');
                    if (cleanPaste) {
                      onFormDataChange({
                        ...formData,
                        phone_number: cleanPaste.slice(0, 13),
                      });
                    }
                  }}
                />
                {touchedFields.has('phone_number') &&
                  isFieldValid('phone_number', formData.phone_number) && (
                    <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                      <span className='hidden text-green-500'>✓</span>
                    </div>
                  )}
              </div>
              {touchedFields.has('phone_number') && (
                <p
                  className={`text-[10px] sm:text-xs ${
                    isFieldValid('phone_number', formData.phone_number)
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {getFieldError('phone_number', formData.phone_number) ||
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
                    onBlur={handleInstitutionBlur}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (
                        formData.role === 'waste_collector_unit' ||
                        formData.role === 'waste_collector_central'
                      ) {
                        if (
                          formData.institution &&
                          formData.institution.length > 0
                        ) {
                          setShowInstitutionSuggestions(true);
                          // Clear previous timeout
                          if (searchTimeoutRef.current) {
                            clearTimeout(searchTimeoutRef.current);
                          }
                          // Add delay to avoid immediate search on focus
                          searchTimeoutRef.current = setTimeout(() => {
                            searchInstitutions(formData.institution);
                          }, 100);
                        }
                      }
                    }}
                    placeholder={
                      formData.role === 'waste_collector_unit'
                        ? 'Ketik nama bank sampah unit...'
                        : formData.role === 'waste_collector_central'
                          ? 'Ketik nama bank sampah induk...'
                          : 'Masukkan nama institusi Anda'
                    }
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
                    autoComplete='off'
                  />
                  {institutionLoading && (
                    <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600'></div>
                    </div>
                  )}
                  {!institutionLoading &&
                    touchedFields.has('institution') &&
                    isFieldValid(
                      'institution',
                      formData.institution,
                      formData.role !== 'customer'
                    ) && (
                      <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                        <span className='hidden text-green-500'>✓</span>
                      </div>
                    )}

                  {/* Institution Suggestions Dropdown */}
                  {showInstitutionSuggestions &&
                    (formData.role === 'waste_collector_unit' ||
                      formData.role === 'waste_collector_central') &&
                    formData.institution &&
                    formData.institution.length > 0 && (
                      <div className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5'>
                        {institutionLoading ? (
                          <div className='px-4 py-2 text-sm text-gray-500'>
                            <div className='flex items-center space-x-2'>
                              <div className='h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600'></div>
                              <span>Mencari...</span>
                            </div>
                          </div>
                        ) : institutionSuggestions &&
                          institutionSuggestions.length > 0 ? (
                          institutionSuggestions.map((suggestion, index) => (
                            <div
                              key={`${suggestion.id}-${index}`}
                              className='cursor-pointer px-4 py-2 text-sm hover:bg-gray-100'
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleInstitutionSelect(suggestion); // Pass entire suggestion object
                              }}
                              onMouseDown={(e) => {
                                // Prevent blur from firing before click
                                e.preventDefault();
                              }}
                            >
                              <div className='font-medium'>
                                {suggestion.institution}
                              </div>
                              {(suggestion.address ||
                                suggestion.city ||
                                suggestion.province) && (
                                <div className='text-xs text-gray-500'>
                                  {[
                                    suggestion.address,
                                    suggestion.city,
                                    suggestion.province,
                                  ]
                                    .filter(Boolean)
                                    .join(', ')}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className='px-4 py-2 text-sm text-gray-500'>
                            Tidak ada hasil ditemukan
                          </div>
                        )}
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
                {(formData.role === 'waste_collector_unit' ||
                  formData.role === 'waste_collector_central') && (
                  <p className='mt-1 text-xs text-gray-500'>
                    Ketik nama institusi untuk melihat saran
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
                  onKeyDown={handleKeyDown}
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
                  Kota/Kabupaten <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='city'
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={() => handleBlur('city')}
                  onKeyDown={handleKeyDown}
                  placeholder='Masukkan kota/kabupaten Anda'
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
                  onKeyDown={handleKeyDown}
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
                        Silakan klik tombol &quot;Dapatkan Lokasi Saat Ini&quot;
                        untuk mengisi koordinat lokasi Anda secara otomatis.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Is Acceptance Customer */}
            {formData.role === 'waste_bank_central' && (
              <div>
                <label className='mb-1 block text-left text-xs font-medium text-gray-500 sm:text-sm'>
                  Apakah Bank Sampah menerim sampah dari nasabah?{' '}
                  <span className='text-red-500'>*</span>
                </label>
                <div className='mt-2 flex items-center space-x-8'>
                  <label className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                    <input
                      type='radio'
                      name='is_accepting_customer'
                      value='true'
                      checked={formData.is_accepting_customer === true}
                      onChange={() =>
                        onFormDataChange({
                          ...formData,
                          is_accepting_customer: true,
                        })
                      }
                      className='h-4 w-4 accent-emerald-600'
                      required
                    />
                    <span>Iya</span>
                  </label>
                  <label className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                    <input
                      type='radio'
                      name='is_accepting_customer'
                      value='false'
                      checked={formData.is_accepting_customer === false}
                      onChange={() =>
                        onFormDataChange({
                          ...formData,
                          is_accepting_customer: false,
                        })
                      }
                      className='h-4 w-4 accent-emerald-600'
                      required
                    />
                    <span>Tidak</span>
                  </label>
                </div>
              </div>
            )}
          </>
        )}

        {/* Buttons */}
        <div className='flex justify-between'>
          {step > 1 && (
            <button
              type='button'
              onClick={() => setStep(step - 1)}
              className='mr-auto mt-4 transform rounded-lg border border-gray-200 px-10 py-3 text-sm font-semibold text-gray-400 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-gray-400 hover:text-gray-500 focus:outline-none sm:text-base'
            >
              Kembali
            </button>
          )}
          {step < 2 && (
            <button
              type='button'
              onClick={handleNextStep}
              className='ml-auto mt-4 transform rounded-lg bg-emerald-600 p-3 px-12 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-700 sm:text-base'
            >
              Lanjut
            </button>
          )}
          {step === 2 && (
            <button
              type='submit'
              disabled={loading}
              className='ml-auto mt-4 transform rounded-lg bg-emerald-600 p-3 px-10 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-700 sm:text-base'
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

      {showLocationPicker && (
        <div className='fixed inset-0 z-50 bg-black bg-opacity-50'>
          <div className='h-full w-full bg-white'>
            <PickLocation
              initialLocation={convertToPickLocationFormat(selectedLocation)}
              onSaveLocation={handleSaveLocationFromPicker}
              onCancel={handleCancelLocationPicker}
              allowBack={true}
              pageTitle='Pilih Lokasi Anda'
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
