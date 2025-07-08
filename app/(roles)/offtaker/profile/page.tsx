'use client';

import { useState } from 'react';

// Dummy data profil offtaker
const dummyProfile = {
  companyInfo: {
    name: 'PT Daur Ulang Nusantara',
    type: 'Perusahaan Pengolahan Sampah',
    registrationNumber: 'REG-OFF-2024-001',
    establishedYear: '2019',
    address: 'Jl. Industri Hijau No. 15, Surabaya, Jawa Timur',
    phone: '+62-31-5555-0123',
    email: 'info@daurulangnusantara.com',
    website: 'www.daurulangnusantara.com',
  },
  businessInfo: {
    wasteTypesAccepted: [
      'Plastik PET',
      'Kardus',
      'Aluminium',
      'Kerjas Bekas',
      'Botol Kaca',
    ],
    capacity: '500 ton/bulan',
    operatingHours: 'Senin - Sabtu, 08:00 - 17:00',
    certifications: ['ISO 14001', 'PROPER Hijau', 'Sertifikat Daur Ulang'],
    paymentMethods: ['Bank Transfer', 'E-Wallet', 'Cash'],
  },
  contactPerson: {
    name: 'Budi Santoso',
    position: 'Manajer Operasional',
    phone: '+62-812-3456-7890',
    email: 'budi.santoso@daurulangnusantara.com',
  },
  statistics: {
    totalPurchases: 2450000,
    totalWeight: 1250,
    averageMonthlyVolume: 125,
    activeSuppliers: 15,
  },
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='mb-6 flex items-start justify-between'>
        <div>
          <h1 className='mb-2 text-2xl font-bold text-gray-900'>
            Profil Perusahaan
          </h1>
          <p className='text-gray-600'>
            Kelola informasi profil dan pengaturan akun
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`rounded-md px-4 py-2 transition-colors ${
            isEditing
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isEditing ? '💾 Simpan' : '✏️ Edit Profil'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className='mb-6 border-b border-gray-200'>
        <nav className='flex space-x-8'>
          <button
            onClick={() => setActiveTab('company')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'company'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Informasi Perusahaan
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'business'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Informasi Bisnis
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'contact'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Kontak Person
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Statistik
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className='rounded-lg border bg-white p-6 shadow-sm'>
        {/* Company Information Tab */}
        {activeTab === 'company' && (
          <div className='space-y-6'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Informasi Perusahaan
            </h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Nama Perusahaan
                </label>
                <input
                  type='text'
                  defaultValue={dummyProfile.companyInfo.name}
                  disabled={!isEditing}
                  className={`w-full rounded-md border px-3 py-2 ${
                    isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Jenis Perusahaan
                </label>
                <input
                  type='text'
                  defaultValue={dummyProfile.companyInfo.type}
                  disabled={!isEditing}
                  className={`w-full rounded-md border px-3 py-2 ${
                    isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Nomor Registrasi
                </label>
                <input
                  type='text'
                  defaultValue={dummyProfile.companyInfo.registrationNumber}
                  disabled={!isEditing}
                  className={`w-full rounded-md border px-3 py-2 ${
                    isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Tahun Berdiri
                </label>
                <input
                  type='text'
                  defaultValue={dummyProfile.companyInfo.establishedYear}
                  disabled={!isEditing}
                  className={`w-full rounded-md border px-3 py-2 ${
                    isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div className='md:col-span-2'>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Alamat
                </label>
                <textarea
                  defaultValue={dummyProfile.companyInfo.address}
                  disabled={!isEditing}
                  rows={3}
                  className={`w-full rounded-md border px-3 py-2 ${
                    isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Telepon
                </label>
                <input
                  type='text'
                  defaultValue={dummyProfile.companyInfo.phone}
                  disabled={!isEditing}
                  className={`w-full rounded-md border px-3 py-2 ${
                    isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Email
                </label>
                <input
                  type='email'
                  defaultValue={dummyProfile.companyInfo.email}
                  disabled={!isEditing}
                  className={`w-full rounded-md border px-3 py-2 ${
                    isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Business Information Tab */}
        {activeTab === 'business' && (
          <div className='space-y-6'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Informasi Bisnis
            </h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Kapasitas Bulanan
                </label>
                <input
                  type='text'
                  defaultValue={dummyProfile.businessInfo.capacity}
                  disabled={!isEditing}
                  className={`w-full rounded-md border px-3 py-2 ${
                    isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Jam Operasional
                </label>
                <input
                  type='text'
                  defaultValue={dummyProfile.businessInfo.operatingHours}
                  disabled={!isEditing}
                  className={`w-full rounded-md border px-3 py-2 ${
                    isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div className='md:col-span-2'>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Jenis Sampah yang Diterima
                </label>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {dummyProfile.businessInfo.wasteTypesAccepted.map(
                    (type, index) => (
                      <span
                        key={index}
                        className='rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800'
                      >
                        {type}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className='md:col-span-2'>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Sertifikasi
                </label>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {dummyProfile.businessInfo.certifications.map(
                    (cert, index) => (
                      <span
                        key={index}
                        className='rounded-full bg-green-100 px-3 py-1 text-sm text-green-800'
                      >
                        {cert}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Person Tab */}
        {activeTab === 'contact' && (
          <div className='space-y-6'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Kontak Person
            </h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Nama
                </label>
                <input
                  type='text'
                  defaultValue={dummyProfile.contactPerson.name}
                  disabled={!isEditing}
                  className={`w-full rounded-md border px-3 py-2 ${
                    isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Jabatan
                </label>
                <input
                  type='text'
                  defaultValue={dummyProfile.contactPerson.position}
                  disabled={!isEditing}
                  className={`w-full rounded-md border px-3 py-2 ${
                    isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Telepon
                </label>
                <input
                  type='text'
                  defaultValue={dummyProfile.contactPerson.phone}
                  disabled={!isEditing}
                  className={`w-full rounded-md border px-3 py-2 ${
                    isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  Email
                </label>
                <input
                  type='email'
                  defaultValue={dummyProfile.contactPerson.email}
                  disabled={!isEditing}
                  className={`w-full rounded-md border px-3 py-2 ${
                    isEditing
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className='space-y-6'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Statistik Perusahaan
            </h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
              <div className='rounded-lg bg-blue-50 p-4 text-center'>
                <div className='mb-2 text-2xl font-bold text-blue-600'>
                  Rp{' '}
                  {dummyProfile.statistics.totalPurchases.toLocaleString(
                    'id-ID'
                  )}
                </div>
                <div className='text-sm text-gray-600'>Total Pembelian</div>
              </div>
              <div className='rounded-lg bg-green-50 p-4 text-center'>
                <div className='mb-2 text-2xl font-bold text-green-600'>
                  {dummyProfile.statistics.totalWeight} kg
                </div>
                <div className='text-sm text-gray-600'>Total Berat</div>
              </div>
              <div className='rounded-lg bg-purple-50 p-4 text-center'>
                <div className='mb-2 text-2xl font-bold text-purple-600'>
                  {dummyProfile.statistics.averageMonthlyVolume} kg
                </div>
                <div className='text-sm text-gray-600'>Rata-rata Bulanan</div>
              </div>
              <div className='rounded-lg bg-orange-50 p-4 text-center'>
                <div className='mb-2 text-2xl font-bold text-orange-600'>
                  {dummyProfile.statistics.activeSuppliers}
                </div>
                <div className='text-sm text-gray-600'>Pemasok Aktif</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
