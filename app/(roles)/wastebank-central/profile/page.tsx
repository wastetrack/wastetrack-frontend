'use client';

import React from 'react';
import { Users } from 'lucide-react';

export default function ProfilePage() {
  // Mock data untuk profile wastebank central
  const profile = {
    institution: 'Bank Sampah Pusat Surabaya',
    email: 'wastebank-central@example.com',
    address: 'Jl. Mayjen Sungkono No. 123, Surabaya',
    phone_number: '+62 31 123 4567',
    city: 'Surabaya',
    province: 'Jawa Timur',
    operating_hours: {
      open: '07:00',
      close: '17:00',
    },
    business_license: 'SIUP-12345678',
    waste_types_accepted: ['Plastik', 'Kertas', 'Logam', 'Kaca'],
    points: 125000,
    balance: 45750000,
    is_email_verified: true,
    created_at: '2023-01-15T00:00:00Z',
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-2xl font-bold text-gray-900'>
            <Users className='text-emerald-600' size={28} />
            Profil Bank Sampah Pusat
          </h1>
          <p className='mt-1 text-gray-600'>
            Kelola informasi profil bank sampah pusat Anda
          </p>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button className='rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'>
            Edit Profil
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8'>
          <div className='flex items-center'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-white bg-opacity-20'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white'>
                <span className='text-2xl font-bold text-emerald-600'>
                  {profile.institution?.substring(0, 2).toUpperCase() || 'BS'}
                </span>
              </div>
            </div>
            <div className='ml-6 text-white'>
              <h2 className='text-2xl font-bold'>
                {profile.institution || 'Bank Sampah Pusat'}
              </h2>
              <p className='text-emerald-100'>
                {profile.email || 'Email tidak tersedia'}
              </p>
              <p className='mt-1 text-sm text-emerald-100'>
                Didirikan:{' '}
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString('id-ID')
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
                    {profile.institution || 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Alamat
                  </label>
                  <p className='text-gray-900'>
                    {profile.address || 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Telepon
                  </label>
                  <p className='text-gray-900'>
                    {profile.phone_number || 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Kota
                  </label>
                  <p className='text-gray-900'>
                    {profile.city || 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Provinsi
                  </label>
                  <p className='text-gray-900'>
                    {profile.province || 'Tidak tersedia'}
                  </p>
                </div>
              </div>
            </div>

            {/* Operational Information */}
            <div>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Informasi Operasional
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Jam Operasional
                  </label>
                  <p className='text-gray-900'>
                    {profile.operating_hours?.open &&
                    profile.operating_hours?.close
                      ? `${profile.operating_hours.open} - ${profile.operating_hours.close}`
                      : 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Izin Usaha
                  </label>
                  <p className='text-gray-900'>
                    {profile.business_license || 'Tidak ada'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Jenis Sampah Diterima
                  </label>
                  <p className='text-gray-900'>
                    {profile.waste_types_accepted?.length > 0
                      ? profile.waste_types_accepted.join(', ')
                      : 'Belum ditentukan'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Poin Terkumpul
                  </label>
                  <p className='text-gray-900'>
                    {profile.points?.toLocaleString() || '0'} poin
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>
                    Saldo
                  </label>
                  <p className='text-gray-900'>
                    Rp {profile.balance?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          Pengaturan Akun
        </h3>
        <div className='space-y-4'>
          <div className='flex items-center justify-between rounded-lg border border-gray-200 p-4'>
            <div>
              <h4 className='font-medium text-gray-900'>Email Akun</h4>
              <p className='text-sm text-gray-600'>
                {profile.email || 'Tidak tersedia'}
              </p>
              <p className='text-xs text-gray-500'>
                {profile.is_email_verified ? (
                  <span className='text-emerald-600'>✓ Terverifikasi</span>
                ) : (
                  <span className='text-orange-600'>
                    ⚠ Belum terverifikasi
                  </span>
                )}
              </p>
            </div>
            <button className='text-sm font-medium text-emerald-600 hover:text-emerald-700'>
              Ubah Email
            </button>
          </div>
          <div className='flex items-center justify-between rounded-lg border border-gray-200 p-4'>
            <div>
              <h4 className='font-medium text-gray-900'>Password</h4>
              <p className='text-sm text-gray-600'>
                Terakhir diubah 30 hari yang lalu
              </p>
            </div>
            <button className='text-sm font-medium text-emerald-600 hover:text-emerald-700'>
              Ubah Password
            </button>
          </div>
          <div className='flex items-center justify-between rounded-lg border border-gray-200 p-4'>
            <div>
              <h4 className='font-medium text-gray-900'>Notifikasi</h4>
              <p className='text-sm text-gray-600'>
                Kelola preferensi notifikasi Anda
              </p>
            </div>
            <button className='text-sm font-medium text-emerald-600 hover:text-emerald-700'>
              Pengaturan
            </button>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          Ringkasan Aktivitas
        </h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='rounded-lg bg-gray-50 p-4 text-center'>
            <div className='text-2xl font-bold text-emerald-600'>3,560</div>
            <div className='text-sm text-gray-600'>Total Transaksi</div>
          </div>
          <div className='rounded-lg bg-gray-50 p-4 text-center'>
            <div className='text-2xl font-bold text-blue-600'>25</div>
            <div className='text-sm text-gray-600'>Kolektor Aktif</div>
          </div>
          <div className='rounded-lg bg-gray-50 p-4 text-center'>
            <div className='text-2xl font-bold text-purple-600'>15.2 Ton</div>
            <div className='text-sm text-gray-600'>Sampah Terkumpul</div>
          </div>
        </div>
      </div>
    </div>
  );
}
