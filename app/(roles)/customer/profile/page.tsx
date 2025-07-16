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
  const [, setFormData] = useState<UpdateCustomerProfileRequest>({});

  // Get user ID from localStorage or wherever it's stored
  const getUserId = (): string | null => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      // console.log('Raw user data from localStorage:', userData);
      if (userData) {
        try {
          const user = JSON.parse(userData);
          // console.log('Parsed user data:', user);
          const userId = user.id || user.user_id || null;
          // console.log('Extracted user ID:', userId);
          return userId;
        } catch {
          // console.error('Error parsing user data:', error);
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

      // console.log('Fetching profile for user ID:', userId);

      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await customerProfileAPI.getProfile(userId);

      // console.log('API Response:', response);

      if (response.data) {
        // The API returns { data: CustomerProfile } directly
        const profileData = response.data;
        // console.log('Profile data:', profileData);
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

  // Load profile on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Show loading state
  if (loading) {
    return (
      <div className='p-3 sm:p-4'>
        <div className='mb-4 sm:mb-6'>
          <h1 className='text-xl font-bold text-gray-800 sm:text-2xl'>
            Profil Saya
          </h1>
          <p className='mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base'>
            Kelola informasi profil Anda.
          </p>
        </div>

        <div className='rounded-lg border bg-white p-4 shadow-sm sm:p-6'>
          <div className='animate-pulse'>
            <div className='mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-4'>
              <div className='mx-auto h-16 w-16 rounded-full bg-gray-200 sm:mx-0 sm:h-20 sm:w-20'></div>
              <div className='text-center sm:text-left'>
                <div className='mx-auto mb-2 h-5 w-32 rounded bg-gray-200 sm:mx-0 sm:h-6 sm:w-48'></div>
                <div className='mx-auto h-4 w-24 rounded bg-gray-200 sm:mx-0 sm:w-32'></div>
              </div>
            </div>
            <div className='space-y-3 sm:space-y-4'>
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className='mb-2 h-4 w-20 rounded bg-gray-200 sm:w-24'></div>
                  <div className='h-9 rounded bg-gray-200 sm:h-10'></div>
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
      <div className='p-3 sm:p-4'>
        <div className='mb-4 sm:mb-6'>
          <h1 className='text-xl font-bold text-gray-800 sm:text-2xl'>
            Profil Saya
          </h1>
          <p className='mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base'>
            Kelola informasi profil Anda.
          </p>
        </div>

        <div className='rounded-lg border bg-white p-4 text-center shadow-sm sm:p-6'>
          <p className='mb-4 text-sm text-gray-600 sm:text-base'>
            Gagal memuat data profil.
          </p>
          <button
            onClick={fetchProfile}
            className='w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 sm:w-auto sm:text-base'
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='rounded-lg sm:p-6'>
        {/* Profile Header - Mobile First Design */}
        <div className='mb-4 sm:mb-6'>
          <div className='flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left'>
            <div className='mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 sm:mb-0 sm:h-20 sm:w-20'>
              <span className='text-xl font-semibold text-emerald-600 sm:text-2xl'>
                {profile.user.username?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>

            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-gray-800 sm:text-xl'>
                {profile.user.username}
              </h3>
              <p className='text-sm text-gray-600 sm:text-base'>
                {profile.user.email}
              </p>

              {/* Stats Grid - Mobile Optimized */}
              <div className='mt-2 grid hidden grid-cols-2 gap-2 text-xs text-gray-500 sm:flex sm:items-center sm:gap-4 sm:text-sm'>
                <span className='text-center sm:text-left'>
                  Poin: {profile.user.points || 0}
                </span>
                <span className='text-center sm:text-left'>
                  Saldo: Rp{' '}
                  {(profile.user.balance || 0).toLocaleString('id-ID')}
                </span>
              </div>

              {/* Environmental Stats - Mobile Optimized */}
              <div className='mt-1 grid hidden grid-cols-2 gap-1 text-xs text-gray-400 sm:flex sm:items-center sm:gap-4'>
                <span className='text-center sm:text-left'>
                  CO₂: {profile.carbon_deficit || 0}
                </span>
                <span className='text-center sm:text-left'>
                  Air: {profile.water_saved || 0}L
                </span>
                <span className='text-center sm:text-left'>
                  Tas: {profile.bags_stored || 0}
                </span>
                <span className='text-center sm:text-left'>
                  Pohon: {profile.trees || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form - Mobile Optimized */}
        <div className='space-y-4 sm:space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Bergabung Sejak
            </label>
            <p className='text-sm text-gray-500'>
              {profile.user.created_at
                ? new Date(profile.user.created_at).toLocaleDateString(
                    'id-ID',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )
                : '-'}
            </p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Nama Pengguna
            </label>
            <p className='text-sm text-gray-500'>{profile.user.username}</p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Email
            </label>
            <p className='text-sm text-gray-500'>{profile.user.email}</p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Role
            </label>
            <p className='text-sm text-gray-500'>{profile.user.role}</p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Nomor Telepon
            </label>
            <p className='text-sm text-gray-500'>{profile.user.phone_number}</p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Alamat
            </label>
            <p className='text-sm text-gray-500'>
              {profile.user.address || 'Tidak ada alamat yang ditentukan'}
            </p>
          </div>

          {/* City and Province Grid - Mobile Optimized */}
          <div className='space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Kota
              </label>
              <p className='text-sm text-gray-500'>
                {profile.user.city || 'Tidak ada kota yang ditentukan'}
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Provinsi
              </label>
              <p className='text-sm text-gray-500'>
                {profile.user.province || 'Tidak ada provinsi yang ditentukan'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
