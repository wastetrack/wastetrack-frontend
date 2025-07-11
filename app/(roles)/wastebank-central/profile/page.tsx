'use client';

import React, { useState, useEffect } from 'react';
import { Users, Loader2, AlertCircle, Edit, X, Save } from 'lucide-react';
import {
  wasteBankProfileAPI,
  WasteBankProfile,
  UpdateWasteBankProfileRequest,
} from '@/services/api/wastebank/profile';
import { getTokenManager } from '@/lib/token-manager';
import { showToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState<WasteBankProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState<UpdateWasteBankProfileRequest>({});

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

      const response = await wasteBankProfileAPI.getProfile(userData.id);
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

  const handleEditClick = () => {
    if (profile) {
      // Parse time to extract HH:MM format from HH:MM:SS+07:00 or HH:MM:SS format
      const parseTimeForInput = (timeString: string) => {
        if (!timeString) return '';
        // Remove timezone and seconds, keep only HH:MM
        return timeString.split(':').slice(0, 2).join(':');
      };

      setEditData({
        total_waste_weight: profile.total_waste_weight,
        total_workers: profile.total_workers,
        open_time: parseTimeForInput(profile.open_time || ''),
        close_time: parseTimeForInput(profile.close_time || ''),
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSaveEdit = async () => {
    if (!profile) return;

    try {
      setEditLoading(true);
      setError(null);

      // Format time strings to include seconds and timezone (+07:00 for Asia/Jakarta)
      const formattedEditData = {
        ...editData,
        open_time: editData.open_time
          ? `${editData.open_time}:00+07:00`
          : undefined,
        close_time: editData.close_time
          ? `${editData.close_time}:00+07:00`
          : undefined,
      };

      const response = await wasteBankProfileAPI.updateProfile(
        profile.id,
        formattedEditData
      );

      // Update profile with the response data, ensuring we preserve all existing data
      setProfile((prevProfile) => ({
        ...prevProfile,
        ...response.data,
        // Ensure user data is preserved
        user: response.data.user || prevProfile?.user,
      }));

      setIsEditing(false);
      setEditData({});
      showToast.success('Profil berhasil diperbarui');

      // Refresh profile data to ensure we have the latest information
      setTimeout(() => {
        fetchProfile();
      }, 500);
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Gagal mengupdate profil';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof UpdateWasteBankProfileRequest,
    value: string | number
  ) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

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
              Profil Bank Sampah Pusat
            </h1>
            <p className='mt-1 text-gray-600'>
              Kelola informasi profil bank sampah pusat Anda
            </p>
          </div>
        </div>
        <div className='mt-4 sm:mt-0'>
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className='flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'
            >
              <Edit size={16} />
              Edit Profil
            </button>
          ) : (
            <div className='flex items-center gap-2'>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading}
                className='flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 disabled:opacity-50'
              >
                <Save size={16} />
                {editLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={editLoading}
                className='flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700 disabled:opacity-50'
              >
                <X size={16} />
                Batal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Mode Information */}
      {isEditing && (
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
          <div className='flex items-center gap-2'>
            <h4 className='text-sm font-medium text-blue-900'>
              Mode Edit Aktif
            </h4>
          </div>
          <p className='mt-1 text-xs text-blue-700'>
            Anda sedang mengedit profil bank sampah. Ubah informasi operasional
            di bawah ini dan klik &quot;Simpan&quot; untuk menyimpan perubahan.
          </p>
        </div>
      )}

      {/* Profile Card */}
      <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
        <div className='bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8'>
          <div className='flex items-center'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-white bg-opacity-20'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white'>
                <span className='text-2xl font-bold text-emerald-600'>
                  {profile.user?.institution?.substring(0, 2).toUpperCase() ||
                    'BS'}
                </span>
              </div>
            </div>
            <div className='ml-6 text-white'>
              <h2 className='text-2xl font-bold'>
                {profile.user?.institution || 'Bank Sampah'}
              </h2>
              <p className='text-emerald-100'>
                {profile.user?.email || 'Email tidak tersedia'}
              </p>
              <p className='mt-1 text-sm text-emerald-100'>
                Didirikan:{' '}
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
                    Nama Institusi
                  </label>
                  <p className='text-gray-900'>
                    {profile.user?.institution || 'Tidak tersedia'}
                  </p>
                </div>
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
                    Role
                  </label>
                  <p className='text-gray-900'>
                    {profile.user?.role === 'waste_bank_unit'
                      ? 'Bank Sampah Unit'
                      : profile.user?.role === 'waste_bank_central'
                        ? 'Bank Sampah Pusat'
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
                <div
                  className={`rounded-lg transition-colors ${isEditing ? '' : ''}`}
                >
                  <label className='text-sm font-medium text-gray-500'>
                    Jam Operasional
                  </label>
                  {isEditing ? (
                    <div className='flex gap-2'>
                      <div className='flex-1'>
                        <input
                          type='time'
                          value={editData.open_time || ''}
                          onChange={(e) =>
                            handleInputChange('open_time', e.target.value)
                          }
                          className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                        />
                      </div>
                      <span className='flex items-center px-2 text-gray-500'>
                        -
                      </span>
                      <div className='flex-1'>
                        <input
                          type='time'
                          value={editData.close_time || ''}
                          onChange={(e) =>
                            handleInputChange('close_time', e.target.value)
                          }
                          className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                        />
                      </div>
                    </div>
                  ) : (
                    <p className='text-gray-900'>
                      {profile.open_time && profile.close_time
                        ? `${new Date(
                            `1970-01-01T${profile.open_time}`
                          ).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Asia/Jakarta',
                          })} - ${new Date(
                            `1970-01-01T${profile.close_time}`
                          ).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Asia/Jakarta',
                          })}`
                        : 'Tidak tersedia'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          Pengaturan Akun
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
              <h4 className='font-medium text-gray-900'>Password</h4>
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
            <button className='hidden text-sm font-medium text-emerald-600 hover:text-emerald-700'>
              Ubah Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
