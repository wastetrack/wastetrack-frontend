'use client';

import React, { useState, useEffect } from 'react';
import { Users, Loader2, AlertCircle } from 'lucide-react';
import {
  collectorProfileAPI,
  CollectorProfile,
} from '@/services/api/collector';
import { getTokenManager } from '@/lib/token-manager';

export default function ProfilePage() {
  const [profile, setProfile] = useState<CollectorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user ID from token
      const tokenManager = getTokenManager();
      const userData = tokenManager.getCurrentUser();

      if (!userData?.id) {
        throw new Error('User ID tidak ditemukan');
      }

      const response = await collectorProfileAPI.getProfile(userData.id);
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex items-center gap-2 text-gray-600'>
          <Loader2 className='h-5 w-5 animate-spin' />
          <span>Memuat profil...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex flex-col items-center gap-2 text-red-600'>
          <AlertCircle className='h-8 w-8' />
          <span>{error}</span>
          <button
            onClick={() => window.location.reload()}
            className='mt-2 rounded-lg bg-red-100 px-4 py-2 text-red-700 transition-colors hover:bg-red-200'
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // No profile data or user data
  if (!profile) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex items-center gap-2 text-gray-600'>
          <Loader2 className='h-5 w-5 animate-spin' />
          <span>Memuat profil...</span>
        </div>
      </div>
    );
  }

  // Check if user data is missing but we have profile data
  if (!profile.user) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center text-gray-600'>
          <Users className='mx-auto h-12 w-12 text-gray-400' />
          <p className='mt-2'>Data pengguna tidak lengkap</p>
          <button
            onClick={() => window.location.reload()}
            className='mt-2 rounded-lg bg-emerald-100 px-4 py-2 text-emerald-700 transition-colors hover:bg-emerald-200'
          >
            Muat Ulang
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
            <Users className='text-emerald-600' size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Profil Kolektor Sampah
            </h1>
            <p className='mt-1 text-gray-600'>
              Lihat informasi profil kolektor sampah Anda
            </p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
        <div className='bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8'>
          <div className='flex items-center'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-white bg-opacity-20'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white'>
                <span className='text-2xl font-bold text-emerald-600'>
                  {profile.user?.username?.substring(0, 2).toUpperCase() ||
                    'KS'}
                </span>
              </div>
            </div>
            <div className='ml-6 text-white'>
              <h2 className='text-2xl font-bold'>
                {profile.user?.username || 'Kolektor Sampah'}
              </h2>
              <p className='text-emerald-100'>
                {profile.user?.email || 'Email tidak tersedia'}
              </p>
              <p className='mt-1 text-sm text-emerald-100'>
                Bergabung:{' '}
                {profile.user?.created_at
                  ? new Date(profile.user.created_at).toLocaleDateString(
                      'id-ID'
                    )
                  : 'Tanggal tidak tersedia'}
              </p>
            </div>
          </div>
        </div>

        <div className='p-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Basic Information */}
            <div>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Informasi Dasar
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Username
                  </label>
                  <p className='text-gray-900'>
                    {profile.user?.username || 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Email
                  </label>
                  <p className='text-gray-900'>
                    {profile.user?.email || 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Role
                  </label>
                  <p className='text-gray-900'>
                    {profile.user?.role === 'waste_collector_unit'
                      ? 'Kolektor Sampah Unit'
                      : profile.user?.role || 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Alamat
                  </label>
                  <p className='text-gray-900'>
                    {profile.user?.address || 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Telepon
                  </label>
                  <p className='text-gray-900'>
                    {profile.user?.phone_number || 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Kota
                  </label>
                  <p className='text-gray-900'>
                    {profile.user?.city || 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Provinsi
                  </label>
                  <p className='text-gray-900'>
                    {profile.user?.province || 'Tidak tersedia'}
                  </p>
                </div>
              </div>
            </div>

            {/* Operational Information */}
            <div>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Informasi Operasional
                </h3>
              </div>
              <div className='space-y-3'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Total Berat Sampah (kg)
                  </label>
                  <p className='text-gray-900'>
                    {profile.total_waste_weight || 0} kg
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Poin
                  </label>
                  <p className='text-gray-900'>
                    {profile.user?.points || 0} poin
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Saldo
                  </label>
                  <p className='text-gray-900'>
                    Rp {profile.user?.balance?.toLocaleString('id-ID') || 0}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Lokasi
                  </label>
                  <p className='text-gray-900'>
                    {profile.user?.location
                      ? `${profile.user.location.latitude.toFixed(6)}, ${profile.user.location.longitude.toFixed(6)}`
                      : 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Status Email
                  </label>
                  <p className='text-gray-900'>
                    {profile.user?.is_email_verified ? (
                      <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'>
                        Terverifikasi
                      </span>
                    ) : (
                      <span className='inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800'>
                        Belum Terverifikasi
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          Informasi Akun
        </h3>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-medium text-gray-900'>Email Akun</h4>
              <p className='text-sm text-gray-600'>
                {profile.user?.email || 'Tidak tersedia'}
              </p>
              <p className='text-xs text-gray-500'>
                {profile.user?.is_email_verified ? (
                  <span className='text-emerald-600'>Terverifikasi</span>
                ) : (
                  <span className='text-orange-600'>Belum terverifikasi</span>
                )}
              </p>
            </div>
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-medium text-gray-900'>Terakhir Diperbarui</h4>
              <p className='text-sm text-gray-600'>
                {profile.user?.updated_at
                  ? new Date(profile.user.updated_at).toLocaleDateString(
                      'id-ID',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )
                  : 'Belum pernah diperbarui'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
