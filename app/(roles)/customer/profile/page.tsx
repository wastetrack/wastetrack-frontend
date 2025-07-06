'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  customerProfileAPI,
  type CustomerProfile,
  type UpdateCustomerProfileRequest,
} from '@/services/api/customer';
import { Alert } from '@/components/ui';

export default function ProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<UpdateCustomerProfileRequest>({});

  // Get user ID from localStorage or wherever it's stored
  const getUserId = (): string | null => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      console.log('Raw user data from localStorage:', userData);
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log('Parsed user data:', user);
          const userId = user.id || user.user_id || null;
          console.log('Extracted user ID:', userId);
          return userId;
        } catch (error) {
          console.error('Error parsing user data:', error);
          return null;
        }
      }
    }
    return null;
  };

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getUserId();

      console.log('Fetching profile for user ID:', userId);

      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await customerProfileAPI.getProfile(userId);

      console.log('API Response:', response);

      if (response.data) {
        // The API returns { data: CustomerProfile } directly
        const profileData = response.data;
        console.log('Profile data:', profileData);
        setProfile(profileData);

        // Initialize form data with current user data from the nested user object
        const userData = profileData.user;
        setFormData({
          username: userData.username,
          email: userData.email,
          phone_number: userData.phone_number,
          address: userData.address,
          city: userData.city,
          province: userData.province,
          location: userData.location,
        });
      } else {
        console.error('API response missing data property:', response);
        throw new Error('Failed to fetch profile - no data received');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      await Alert.error({
        title: 'Gagal Memuat Profil',
        text:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat memuat profil.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle form input changes
  const handleInputChange = (
    field: keyof UpdateCustomerProfileRequest,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      return;
    }

    try {
      setSaving(true);

      const response = await customerProfileAPI.updateProfile(
        profile.id,
        formData
      );

      if (response.data) {
        // The API returns { data: CustomerProfile } directly
        const updatedProfileData = response.data;
        setProfile(updatedProfileData);

        await Alert.success({
          title: 'Berhasil',
          text: 'Profil berhasil diperbarui.',
          timer: 1500,
        });
      } else {
        throw new Error('Failed to update profile - no data received');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      await Alert.error({
        title: 'Gagal Menyimpan',
        text:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat menyimpan profil.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Load profile on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Show loading state
  if (loading) {
    return (
      <div>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>Profil Saya</h1>
          <p className='mt-2 text-gray-600'>Kelola informasi profil Anda.</p>
        </div>

        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <div className='animate-pulse'>
            <div className='mb-6 flex items-center gap-4'>
              <div className='h-20 w-20 rounded-full bg-gray-200'></div>
              <div>
                <div className='mb-2 h-6 w-48 rounded bg-gray-200'></div>
                <div className='h-4 w-32 rounded bg-gray-200'></div>
              </div>
            </div>
            <div className='space-y-4'>
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className='mb-2 h-4 w-24 rounded bg-gray-200'></div>
                  <div className='h-10 rounded bg-gray-200'></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no profile
  if (!profile) {
    return (
      <div className='p-4'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>Profil Saya</h1>
          <p className='mt-2 text-gray-600'>Kelola informasi profil Anda.</p>
        </div>

        <div className='rounded-lg border bg-white p-6 text-center shadow-sm'>
          <p className='mb-4 text-gray-600'>Gagal memuat data profil.</p>
          <button
            onClick={fetchProfile}
            className='rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Profil Saya</h1>
        <p className='mt-2 text-gray-600'>Kelola informasi profil Anda.</p>
      </div>

      <div className='rounded-lg border bg-white p-6 shadow-sm'>
        <div className='mb-6 flex items-center gap-4'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100'>
            <span className='text-2xl font-semibold text-emerald-600'>
              {profile.user.username?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h3 className='text-xl font-semibold text-gray-800'>
              {profile.user.username}
            </h3>
            <p className='text-gray-600'>{profile.user.email}</p>
            <div className='mt-2 flex items-center gap-4 text-sm text-gray-500'>
              <span>Poin: {profile.user.points || 0}</span>
              <span>
                Saldo: Rp {(profile.user.balance || 0).toLocaleString('id-ID')}
              </span>
            </div>
            <div className='mt-1 flex items-center gap-4 text-xs text-gray-400'>
              <span>CO₂ Deficit: {profile.carbon_deficit || 0}</span>
              <span>Air Disimpan: {profile.water_saved || 0}L</span>
              <span>Tas: {profile.bags_stored || 0}</span>
              <span>Pohon: {profile.trees || 0}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Nama Pengguna
            </label>
            <input
              type='text'
              value={formData.username || ''}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Email
            </label>
            <input
              type='email'
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Nomor Telepon
            </label>
            <input
              type='tel'
              value={formData.phone_number || ''}
              onChange={(e) =>
                handleInputChange('phone_number', e.target.value)
              }
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Alamat
            </label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                Kota
              </label>
              <input
                type='text'
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
              />
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>
                Provinsi
              </label>
              <input
                type='text'
                value={formData.province || ''}
                onChange={(e) => handleInputChange('province', e.target.value)}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
              />
            </div>
          </div>

          <div className='pt-4'>
            <button
              type='submit'
              disabled={saving}
              className='rounded-lg bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
