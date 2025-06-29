import { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  MapPin,
  Eye,
  EyeOff,
  MapPinIcon,
  EyeIcon
} from 'lucide-react';
import { FormData, ROLES, ROLE_DESCRIPTIONS, getCurrentLocation } from '../../services/functions/register-function/register-function';
import { alerts } from '../alerts/alerts';

interface RegisterFormProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
}

export default function RegisterForm({ 
  formData, 
  onFormDataChange, 
  onSubmit, 
  loading, 
  error 
}: RegisterFormProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFormDataChange({
      ...formData,
      [name]: value
    });
  };

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
  };

  const getFieldError = (fieldName: string, value: string, isRequired: boolean = true) => {
    if (!touchedFields.has(fieldName)) return '';
    
    if (isRequired && !value.trim()) {
      return 'Field ini wajib diisi';
    }
    
    switch (fieldName) {
      case 'email':
        if (!value.includes('@')) return 'Format email tidak valid';
        if (value.length > 100) return 'Email maksimal 100 karakter';
        break;
      case 'password':
        if (value.length < 8) return 'Password minimal 8 karakter';
        if (value.length > 100) return 'Password maksimal 100 karakter';
        break;
      case 'confirmPassword':
        if (value !== formData.password) return 'Konfirmasi password tidak sesuai';
        break;
      case 'phone':
        if (value.length < 10) return 'Nomor telepon minimal 10 digit';
        if (value.length > 20) return 'Nomor telepon maksimal 20 digit';
        break;
      case 'fullName':
        if (value.trim().length < 2) return 'Nama minimal 2 karakter';
        if (value.trim().length > 100) return 'Nama maksimal 100 karakter';
        break;
      case 'institution':
        if (isRequired && value.trim().length < 2) return 'Institusi minimal 2 karakter';
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

  const isFieldValid = (fieldName: string, value: string, isRequired: boolean = true) => {
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
          longitude: locationData.longitude
        },
        address: locationData.address || formData.address,
        city: locationData.city || formData.city,
        province: locationData.province || formData.province
      });
    } catch (error) {
      console.error('Error getting location:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error mendapatkan lokasi';
      
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
    setTouchedFields(prev => new Set([...prev, 'email', 'password', 'confirmPassword']));
    
    if (!formData.password || !formData.confirmPassword) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (formData.password.length < 8) {
      return;
    }

    if (!formData.email.includes('@')) {
      return;
    }

    setStep(step + 1);
  };

  return (
    <div className="w-full max-w-2xl rounded-xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-lg font-bold text-gray-800 sm:text-3xl">Buat Akun</h2>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          {step === 1 ? 'Pilih role Anda' : 'Lengkapi informasi Anda'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 max-w-[240px] sm:max-w-sm mx-auto">
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-6 h-6 text-xs font-medium bg-white border-2 rounded-full border-emerald-500 text-emerald-500">
              1
            </div>
          </div>
          <div className={`flex-1 h-1 mx-2 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-6 h-6 text-xs font-medium border-2 rounded-full ${step >= 2 ? 'bg-white border-emerald-500 text-emerald-500' : 'bg-white border-gray-300 text-gray-400'}`}>
              2
            </div>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span className={`${step >= 1 ? 'text-emerald-600 font-medium' : ''}`}>Akun</span>
          <span className={`${step >= 2 ? 'text-emerald-600 font-medium' : ''}`}>Profil</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 mb-6 text-sm text-center text-red-600 border border-red-100 rounded-lg bg-red-50">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        {step === 1 ? (
          <>
            {/* Role Selection */}
            <div>
              <label className="block text-xs text-left font-medium text-gray-500 mb-1.5 sm:text-sm">
                Pilih Role Anda
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 bg-white text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 sm:text-base"
              >
                {Object.entries(ROLES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-600">
                {ROLE_DESCRIPTIONS[formData.role as keyof typeof ROLE_DESCRIPTIONS]}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-left font-medium text-gray-500 mb-1.5 sm:text-sm">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="Masukkan email Anda"
                  className={`text-sm w-full p-3 pl-10 text-gray-800 bg-white border rounded-lg shadow-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm ${
                    touchedFields.has('email') && !isFieldValid('email', formData.email)
                      ? 'border-red-300 bg-red-50'
                      : touchedFields.has('email') && isFieldValid('email', formData.email)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                  }`}
                  required
                />
                {touchedFields.has('email') && isFieldValid('email', formData.email) && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-green-500">✓</span>
                  </div>
                )}
              </div>
              {touchedFields.has('email') && (
                <p className={`mt-1 text-xs ${
                  isFieldValid('email', formData.email) ? 'text-green-600' : 'text-red-600'
                }`}>
                  {getFieldError('email', formData.email) || 'Email valid'}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-left font-medium text-gray-500 mb-1.5 sm:text-sm">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="Minimal 8 karakter"
                  className={`text-sm w-full p-3 pl-10 pr-10 text-gray-800 bg-white border rounded-lg shadow-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm ${
                    touchedFields.has('password') && !isFieldValid('password', formData.password)
                      ? 'border-red-300 bg-red-50'
                      : touchedFields.has('password') && isFieldValid('password', formData.password)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                  }`}
                  required
                  maxLength={100}
                />
                <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                  {touchedFields.has('password') && isFieldValid('password', formData.password) && (
                    <span className="text-green-500">✓</span>
                  )}
                  <span
                    onClick={() => setShowPassword(prev => !prev)}
                    className="text-gray-500 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                  >
                    {showPassword ? <EyeIcon className="w-5 h-5 text-gray-400" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
                  </span>
                </div>
              </div>
              {touchedFields.has('password') && (
                <p className={`mt-1 text-xs ${
                  isFieldValid('password', formData.password) ? 'text-green-600' : 'text-red-600'
                }`}>
                  {getFieldError('password', formData.password) || 'Password memenuhi syarat'}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs text-left font-medium text-gray-500 mb-1.5 sm:text-sm">
                Konfirmasi Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Konfirmasi kata sandi Anda"
                  className={`text-sm w-full p-3 pl-10 pr-10 text-gray-800 bg-white border rounded-lg shadow-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm ${
                    touchedFields.has('confirmPassword') && !isFieldValid('confirmPassword', formData.confirmPassword)
                      ? 'border-red-300 bg-red-50'
                      : touchedFields.has('confirmPassword') && isFieldValid('confirmPassword', formData.confirmPassword)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                  }`}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                  {touchedFields.has('confirmPassword') && isFieldValid('confirmPassword', formData.confirmPassword) && (
                    <span className="text-green-500">✓</span>
                  )}
                  <span
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="text-gray-500 cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                  >
                    {showConfirmPassword ? <EyeIcon className="w-5 h-5 text-gray-400" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
                  </span>
                </div>
              </div>
              {touchedFields.has('confirmPassword') && (
                <p className={`mt-1 text-xs ${
                  isFieldValid('confirmPassword', formData.confirmPassword) ? 'text-green-600' : 'text-red-600'
                }`}>
                  {getFieldError('confirmPassword', formData.confirmPassword) || 'Password sesuai'}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Full Name */}
            <div>
              <label className="block text-xs text-left font-medium text-gray-500 mb-1.5 sm:text-sm">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="Masukkan nama lengkap Anda"
                  className={`text-sm w-full p-3 pl-10 text-gray-800 bg-white border rounded-lg shadow-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm ${
                    touchedFields.has('fullName') && !isFieldValid('fullName', formData.fullName)
                      ? 'border-red-300 bg-red-50'
                      : touchedFields.has('fullName') && isFieldValid('fullName', formData.fullName)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                  }`}
                  required
                />
                {touchedFields.has('fullName') && isFieldValid('fullName', formData.fullName) && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-green-500">✓</span>
                  </div>
                )}
              </div>
              {touchedFields.has('fullName') && (
                <p className={`mt-1 text-xs ${
                  isFieldValid('fullName', formData.fullName) ? 'text-green-600' : 'text-red-600'
                }`}>
                  {getFieldError('fullName', formData.fullName) || 'Nama valid'}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs text-left font-medium text-gray-500 mb-1.5 sm:text-sm">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phone')}
                  placeholder="Masukkan nomor telepon Anda"
                  className={`text-sm w-full p-3 pl-10 text-gray-800 bg-white border rounded-lg shadow-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm ${
                    touchedFields.has('phone') && !isFieldValid('phone', formData.phone)
                      ? 'border-red-300 bg-red-50'
                      : touchedFields.has('phone') && isFieldValid('phone', formData.phone)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                  }`}
                  required
                />
                {touchedFields.has('phone') && isFieldValid('phone', formData.phone) && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-green-500">✓</span>
                  </div>
                )}
              </div>
              {touchedFields.has('phone') && (
                <p className={`mt-1 text-xs ${
                  isFieldValid('phone', formData.phone) ? 'text-green-600' : 'text-red-600'
                }`}>
                  {getFieldError('phone', formData.phone) || 'Nomor telepon valid'}
                </p>
              )}
            </div>

            {/* Institution */}
            {formData.role !== 'customer' && (
              <div>
                <label className="block text-xs text-left font-medium text-gray-500 mb-1.5 sm:text-sm">
                  Institusi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Building2 className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    onBlur={() => handleBlur('institution')}
                    placeholder="Masukkan nama institusi Anda"
                    className={`text-sm w-full p-3 pl-10 text-gray-800 bg-white border rounded-lg shadow-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm ${
                      touchedFields.has('institution') && !isFieldValid('institution', formData.institution, formData.role !== 'customer')
                        ? 'border-red-300 bg-red-50'
                        : touchedFields.has('institution') && isFieldValid('institution', formData.institution, formData.role !== 'customer')
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200'
                    }`}
                    required
                  />
                  {touchedFields.has('institution') && isFieldValid('institution', formData.institution, formData.role !== 'customer') && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <span className="text-green-500">✓</span>
                    </div>
                  )}
                </div>
                {touchedFields.has('institution') && (
                  <p className={`mt-1 text-xs ${
                    isFieldValid('institution', formData.institution, formData.role !== 'customer') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getFieldError('institution', formData.institution, formData.role !== 'customer') || 'Institusi valid'}
                  </p>
                )}
              </div>
            )}

            {/* Address */}
            <div>
              <label className="block text-xs text-left font-medium text-gray-500 mb-1.5 sm:text-sm">
                Alamat <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MapPin className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={() => handleBlur('address')}
                  placeholder="Masukkan alamat Anda"
                  className={`text-sm w-full p-3 pl-10 text-gray-800 bg-white border rounded-lg shadow-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm ${
                    touchedFields.has('address') && !isFieldValid('address', formData.address)
                      ? 'border-red-300 bg-red-50'
                      : touchedFields.has('address') && isFieldValid('address', formData.address)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                  }`}
                  required
                />
                {touchedFields.has('address') && isFieldValid('address', formData.address) && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-green-500">✓</span>
                  </div>
                )}
              </div>
              {touchedFields.has('address') && (
                <p className={`mt-1 text-xs ${
                  isFieldValid('address', formData.address) ? 'text-green-600' : 'text-red-600'
                }`}>
                  {getFieldError('address', formData.address) || 'Alamat valid'}
                </p>
              )}
            </div>

            {/* City & Province */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-left font-medium text-gray-500 mb-1.5 sm:text-sm">
                  Kota <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={() => handleBlur('city')}
                  placeholder="Masukkan kota Anda"
                  className={`text-sm w-full p-3 text-gray-800 bg-white border rounded-lg shadow-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm ${
                    touchedFields.has('city') && !isFieldValid('city', formData.city)
                      ? 'border-red-300 bg-red-50'
                      : touchedFields.has('city') && isFieldValid('city', formData.city)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                  }`}
                  required
                />
                {touchedFields.has('city') && (
                  <p className={`mt-1 text-xs ${
                    isFieldValid('city', formData.city) ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getFieldError('city', formData.city) || 'Kota valid'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-left font-medium text-gray-500 mb-1.5 sm:text-sm">
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  onBlur={() => handleBlur('province')}
                  placeholder="Masukkan provinsi Anda"
                  className={`text-sm w-full p-3 text-gray-800 bg-white border rounded-lg shadow-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm ${
                    touchedFields.has('province') && !isFieldValid('province', formData.province)
                      ? 'border-red-300 bg-red-50'
                      : touchedFields.has('province') && isFieldValid('province', formData.province)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                  }`}
                  required
                />
                {touchedFields.has('province') && (
                  <p className={`mt-1 text-xs ${
                    isFieldValid('province', formData.province) ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getFieldError('province', formData.province) || 'Provinsi valid'}
                  </p>
                )}
              </div>
            </div>

            {/* Get Location */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  className="flex items-center p-0 text-sm text-emerald-600 hover:text-emerald-500 focus:outline-none focus:ring-0 disabled:opacity-50"
                >
                  <MapPinIcon className="w-4 h-4 mr-2 sm:w-5 sm:h-5" />
                  {locationLoading ? 'Mendapatkan Lokasi...' : 'Dapatkan Lokasi Saat Ini'}
                </button>
                {formData.coordinates && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600 font-medium">
                      📍 Lokasi berhasil didapat
                    </span>
                    <span className="text-xs text-gray-500">
                      ({formData.coordinates.latitude.toFixed(4)}, {formData.coordinates.longitude.toFixed(4)})
                    </span>
                  </div>
                )}
              </div>
              
              {/* Location requirement info */}
              {!formData.coordinates && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <span className="text-amber-500 mt-0.5">⚠️</span>
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">Lokasi GPS Diperlukan</p>
                      <p className="text-amber-700 mt-1">
                        Silakan klik tombol "Dapatkan Lokasi Saat Ini" untuk mengisi koordinat lokasi Anda secara otomatis.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="text-sm font-semibold mr-auto px-10 py-3 text-gray-400 transition-colors rounded-lg shadow-sm border border-gray-200 hover:border-gray-400 hover:text-gray-500 focus:outline-none sm:text-base"
            >
              Kembali
            </button>
          )}
          {step < 2 && (
            <button
              type="button"
              onClick={handleNextStep}
              className="text-sm font-semibold ml-auto px-10 py-3 text-white transition-colors rounded-lg shadow-sm bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 sm:text-base"
            >
              Lanjut
            </button>
          )}
          {step === 2 && (
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 sm:text-base ml-auto"
            >
              {loading ? 'Membuat Akun...' : 'Buat Akun'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
