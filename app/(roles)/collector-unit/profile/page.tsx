'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    // Company Information
    companyName: 'PT. Surabaya Waste Collection',
    companyType: 'Perusahaan Pengumpul Sampah',
    establishedYear: '2018',
    license: 'WC-2018-SBY-001',
    address: 'Jl. Raya Surabaya No. 123, Surabaya, Jawa Timur 60115',
    phone: '+62 31 123 4567',
    email: 'info@sbywastetech.com',
    website: 'www.sbywastetech.com',

    // Contact Person
    contactName: 'Budi Santoso',
    contactPosition: 'Operational Manager',
    contactPhone: '+62 812 3456 7890',
    contactEmail: 'budi.santoso@sbywastetech.com',

    // Operational Details
    serviceArea: 'Surabaya Timur, Surabaya Selatan, Surabaya Utara',
    operationalHours: '06:00 - 18:00',
    vehicleCount: 8,
    employeeCount: 24,
    wasteTypes: ['Organik', 'Plastik', 'Kertas', 'Logam', 'Kaca'],

    // Bank Information
    bankName: 'Bank Mandiri',
    accountNumber: '1234567890',
    accountHolder: 'PT. Surabaya Waste Collection',

    // Documents
    documents: [
      { name: 'Surat Izin Usaha', status: 'verified', expiry: '2025-12-31' },
      {
        name: 'Sertifikat Lingkungan',
        status: 'verified',
        expiry: '2025-06-30',
      },
      { name: 'Asuransi Kendaraan', status: 'pending', expiry: '2025-08-15' },
      { name: 'Sertifikat K3', status: 'verified', expiry: '2025-11-20' },
    ],
  });

  const [performanceData] = useState({
    totalCollections: 2847,
    totalWasteCollected: 45680, // kg
    averageRating: 4.7,
    onTimeDelivery: 96.8, // percentage
    customerSatisfaction: 4.6,
    monthlyGrowth: 12.5, // percentage

    // Monthly Performance (last 6 months)
    monthlyStats: [
      { month: 'Jan 2025', collections: 420, waste: 6850, rating: 4.8 },
      { month: 'Feb 2025', collections: 445, waste: 7200, rating: 4.6 },
      { month: 'Mar 2025', collections: 478, waste: 7650, rating: 4.7 },
      { month: 'Apr 2025', collections: 502, waste: 8100, rating: 4.8 },
      { month: 'May 2025', collections: 485, waste: 7890, rating: 4.6 },
      { month: 'Jun 2025', collections: 517, waste: 8230, rating: 4.9 },
    ],
  });

  const [vehicles] = useState([
    {
      id: 1,
      plateNumber: 'B 1234 CD',
      type: 'Truck Sampah',
      capacity: '5 ton',
      year: 2020,
      status: 'active',
      lastMaintenance: '2025-06-15',
      nextMaintenance: '2025-08-15',
      driver: 'Budi Santoso',
    },
    {
      id: 2,
      plateNumber: 'B 5678 EF',
      type: 'Truck Sampah',
      capacity: '3 ton',
      year: 2019,
      status: 'active',
      lastMaintenance: '2025-06-20',
      nextMaintenance: '2025-08-20',
      driver: 'Siti Aminah',
    },
    {
      id: 3,
      plateNumber: 'B 9012 GH',
      type: 'Pick Up',
      capacity: '1 ton',
      year: 2021,
      status: 'maintenance',
      lastMaintenance: '2025-07-01',
      nextMaintenance: '2025-07-10',
      driver: 'Ahmad Rizki',
    },
    {
      id: 4,
      plateNumber: 'B 3456 IJ',
      type: 'Truck Sampah',
      capacity: '4 ton',
      year: 2022,
      status: 'active',
      lastMaintenance: '2025-06-25',
      nextMaintenance: '2025-08-25',
      driver: 'Dewi Sartika',
    },
  ]);

  const [employees] = useState([
    {
      id: 1,
      name: 'Budi Santoso',
      position: 'Operational Manager',
      joinDate: '2018-03-15',
      phone: '+62 812 3456 7890',
      status: 'active',
      vehicle: 'B 1234 CD',
    },
    {
      id: 2,
      name: 'Siti Aminah',
      position: 'Senior Driver',
      joinDate: '2018-06-20',
      phone: '+62 813 4567 8901',
      status: 'active',
      vehicle: 'B 5678 EF',
    },
    {
      id: 3,
      name: 'Ahmad Rizki',
      position: 'Driver',
      joinDate: '2019-02-10',
      phone: '+62 814 5678 9012',
      status: 'active',
      vehicle: 'B 9012 GH',
    },
    {
      id: 4,
      name: 'Dewi Sartika',
      position: 'Driver',
      joinDate: '2020-01-05',
      phone: '+62 815 6789 0123',
      status: 'active',
      vehicle: 'B 3456 IJ',
    },
    {
      id: 5,
      name: 'Rudi Hermawan',
      position: 'Koordinator Lapangan',
      joinDate: '2019-08-12',
      phone: '+62 816 7890 1234',
      status: 'active',
      vehicle: '-',
    },
  ]);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    console.log('Profile saved:', profileData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'verified':
        return 'Terverifikasi';
      case 'maintenance':
        return 'Maintenance';
      case 'pending':
        return 'Menunggu';
      case 'inactive':
        return 'Tidak Aktif';
      default:
        return status;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='mb-2 text-2xl font-bold text-gray-900'>
              Profil Unit Pengumpul
            </h1>
            <p className='text-gray-600'>
              Kelola informasi profil, kendaraan, dan tim pengumpul sampah Anda.
            </p>
          </div>
          <div className='flex space-x-3'>
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
                >
                  Simpan
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
              >
                Edit Profil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Total Pengumpulan</p>
              <p className='text-2xl font-bold text-blue-600'>
                {performanceData.totalCollections.toLocaleString()}
              </p>
            </div>
            <div className='rounded-full bg-blue-100 p-3'>
              <svg
                className='h-6 w-6 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Total Sampah (kg)</p>
              <p className='text-2xl font-bold text-green-600'>
                {performanceData.totalWasteCollected.toLocaleString()}
              </p>
            </div>
            <div className='rounded-full bg-green-100 p-3'>
              <svg
                className='h-6 w-6 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Rating Rata-rata</p>
              <p className='text-2xl font-bold text-yellow-600'>
                {performanceData.averageRating}
              </p>
            </div>
            <div className='rounded-full bg-yellow-100 p-3'>
              <svg
                className='h-6 w-6 text-yellow-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Ketepatan Waktu</p>
              <p className='text-2xl font-bold text-purple-600'>
                {performanceData.onTimeDelivery}%
              </p>
            </div>
            <div className='rounded-full bg-purple-100 p-3'>
              <svg
                className='h-6 w-6 text-purple-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='rounded-lg bg-white shadow-sm'>
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 px-6'>
            <button
              onClick={() => setActiveTab('profile')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Informasi Perusahaan
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'vehicles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Kendaraan
              <span className='ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600'>
                {vehicles.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'employees'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Tim Kerja
              <span className='ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-600'>
                {employees.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Performa
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className='p-6'>
          {activeTab === 'profile' && (
            <div className='space-y-8'>
              {/* Company Information */}
              <div>
                <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                  Informasi Perusahaan
                </h3>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Nama Perusahaan
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={profileData.companyName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            companyName: e.target.value,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    ) : (
                      <p className='text-gray-900'>{profileData.companyName}</p>
                    )}
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Jenis Perusahaan
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={profileData.companyType}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            companyType: e.target.value,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    ) : (
                      <p className='text-gray-900'>{profileData.companyType}</p>
                    )}
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Tahun Berdiri
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={profileData.establishedYear}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            establishedYear: e.target.value,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    ) : (
                      <p className='text-gray-900'>
                        {profileData.establishedYear}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Nomor Lisensi
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={profileData.license}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            license: e.target.value,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    ) : (
                      <p className='text-gray-900'>{profileData.license}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                  Informasi Kontak
                </h3>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='md:col-span-2'>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Alamat
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profileData.address}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            address: e.target.value,
                          })
                        }
                        rows={3}
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    ) : (
                      <p className='text-gray-900'>{profileData.address}</p>
                    )}
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Telepon
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    ) : (
                      <p className='text-gray-900'>{profileData.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type='email'
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    ) : (
                      <p className='text-gray-900'>{profileData.email}</p>
                    )}
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={profileData.website}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            website: e.target.value,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    ) : (
                      <p className='text-gray-900'>{profileData.website}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Operational Information */}
              <div>
                <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                  Informasi Operasional
                </h3>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='md:col-span-2'>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Area Layanan
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={profileData.serviceArea}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            serviceArea: e.target.value,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    ) : (
                      <p className='text-gray-900'>{profileData.serviceArea}</p>
                    )}
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Jam Operasional
                    </label>
                    {isEditing ? (
                      <input
                        type='text'
                        value={profileData.operationalHours}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            operationalHours: e.target.value,
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    ) : (
                      <p className='text-gray-900'>
                        {profileData.operationalHours}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Jumlah Kendaraan
                    </label>
                    {isEditing ? (
                      <input
                        type='number'
                        value={profileData.vehicleCount}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            vehicleCount: parseInt(e.target.value),
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    ) : (
                      <p className='text-gray-900'>
                        {profileData.vehicleCount} unit
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Jumlah Karyawan
                    </label>
                    {isEditing ? (
                      <input
                        type='number'
                        value={profileData.employeeCount}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            employeeCount: parseInt(e.target.value),
                          })
                        }
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    ) : (
                      <p className='text-gray-900'>
                        {profileData.employeeCount} orang
                      </p>
                    )}
                  </div>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Jenis Sampah yang Dilayani
                    </label>
                    <div className='flex flex-wrap gap-2'>
                      {profileData.wasteTypes.map((type, index) => (
                        <span
                          key={index}
                          className='rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800'
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                  Dokumen
                </h3>
                <div className='space-y-3'>
                  {profileData.documents.map((doc, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between rounded-lg border border-gray-200 p-4'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='rounded-full bg-blue-100 p-2'>
                          <svg
                            className='h-5 w-5 text-blue-600'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                            />
                          </svg>
                        </div>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {doc.name}
                          </p>
                          <p className='text-sm text-gray-600'>
                            Berakhir: {doc.expiry}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(doc.status)}`}
                      >
                        {getStatusText(doc.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Daftar Kendaraan
                </h3>
                <button className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
                  + Tambah Kendaraan
                </button>
              </div>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className='rounded-lg border border-gray-200 p-6'
                  >
                    <div className='mb-4 flex items-start justify-between'>
                      <div>
                        <h4 className='text-lg font-semibold text-gray-900'>
                          {vehicle.plateNumber}
                        </h4>
                        <p className='text-sm text-gray-600'>
                          {vehicle.type} - {vehicle.capacity}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(vehicle.status)}`}
                      >
                        {getStatusText(vehicle.status)}
                      </span>
                    </div>

                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Tahun:</span>
                        <span className='text-gray-900'>{vehicle.year}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Driver:</span>
                        <span className='text-gray-900'>{vehicle.driver}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>
                          Maintenance Terakhir:
                        </span>
                        <span className='text-gray-900'>
                          {vehicle.lastMaintenance}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>
                          Maintenance Berikutnya:
                        </span>
                        <span className='text-gray-900'>
                          {vehicle.nextMaintenance}
                        </span>
                      </div>
                    </div>

                    <div className='mt-4 flex space-x-2'>
                      <button className='flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50'>
                        Edit
                      </button>
                      <button className='flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700'>
                        Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Tim Kerja
                </h3>
                <button className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
                  + Tambah Karyawan
                </button>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-gray-200'>
                      <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                        Nama
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                        Posisi
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                        Bergabung
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                        Telepon
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                        Kendaraan
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                        Status
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr
                        key={employee.id}
                        className='border-b border-gray-100 hover:bg-gray-50'
                      >
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {employee.name}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          {employee.position}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          {employee.joinDate}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          {employee.phone}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          {employee.vehicle}
                        </td>
                        <td className='px-4 py-3'>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(employee.status)}`}
                          >
                            {getStatusText(employee.status)}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <div className='flex space-x-2'>
                            <button className='text-sm text-blue-600 hover:text-blue-800'>
                              Edit
                            </button>
                            <button className='text-sm text-gray-600 hover:text-gray-800'>
                              Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Performa Bulanan
              </h3>

              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-gray-200'>
                      <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                        Bulan
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                        Pengumpulan
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                        Sampah (kg)
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                        Rating
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                        Perubahan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.monthlyStats.map((stat, index) => (
                      <tr
                        key={index}
                        className='border-b border-gray-100 hover:bg-gray-50'
                      >
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {stat.month}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          {stat.collections}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          {stat.waste.toLocaleString()}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          <div className='flex items-center'>
                            <span className='mr-1'>⭐</span>
                            {stat.rating}
                          </div>
                        </td>
                        <td className='px-4 py-3 text-sm'>
                          {index > 0 && (
                            <span
                              className={`flex items-center ${
                                stat.collections >
                                performanceData.monthlyStats[index - 1]
                                  .collections
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {stat.collections >
                              performanceData.monthlyStats[index - 1]
                                .collections
                                ? '↗'
                                : '↘'}
                              {Math.abs(
                                stat.collections -
                                  performanceData.monthlyStats[index - 1]
                                    .collections
                              )}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
