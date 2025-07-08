'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  const [profileData, setProfileData] = useState({
    company: {
      name: 'WasteTrack Central Management',
      type: 'Pusat Manajemen Pengumpulan Sampah',
      establishedDate: '2018-03-15',
      registrationNumber: 'PT.123456789',
      licenseNumber: 'WM-2018-001',
      address: 'Jl. Gubernur Suryo No. 15, Surabaya, Jawa Timur 60271',
      phone: '+62 31 1234567',
      email: 'central@wastetrack.id',
      website: 'https://wastetrack.id',
      taxId: '12.345.678.9-123.000',
      operationalStatus: 'Aktif',
      certification: 'ISO 14001:2015, ISO 9001:2015',
    },
    management: {
      ceo: 'Dr. Bambang Soeharjo',
      operationsManager: 'Ir. Siti Nurhayati, MT',
      technicalManager: 'Drs. Ahmad Wijaya',
      adminManager: 'S.E. Lestari Dewi',
      employees: 25,
      departments: ['Operasional', 'Teknis', 'Administrasi', 'Keuangan', 'IT'],
    },
    coverage: {
      totalArea: 350, // km²
      regions: [
        'Surabaya Timur',
        'Surabaya Barat',
        'Surabaya Utara',
        'Surabaya Selatan',
        'Surabaya Pusat',
      ],
      collectorUnits: 45,
      servicePoints: 1247,
      customers: 8945,
    },
    services: {
      wasteTypes: [
        'Organik',
        'Anorganik',
        'Plastik',
        'Kertas',
        'Logam',
        'Kaca',
        'Elektronik',
        'B3',
      ],
      serviceTypes: [
        'Pengumpulan Reguler',
        'Pengumpulan Khusus',
        'Pengolahan',
        'Daur Ulang',
        'Konsultasi',
      ],
      operatingHours: '24/7',
      responseTime: '< 30 menit',
      capacity: '500 ton/hari',
    },
    performance: {
      totalCollected: 125000, // kg this month
      efficiency: 94.5, // percentage
      customerSatisfaction: 4.7, // out of 5
      onTimeDelivery: 96.8, // percentage
      wasteProcessed: 118000, // kg this month
      recyclingRate: 78.5, // percentage
      monthlyGrowth: 12.3, // percentage
    },
    financials: {
      monthlyRevenue: 2450000000, // IDR
      operatingCosts: 1890000000, // IDR
      netProfit: 560000000, // IDR
      profitMargin: 22.9, // percentage
      paymentMethods: ['Transfer Bank', 'Kartu Kredit', 'E-Wallet', 'Cash'],
      billingCycle: 'Bulanan',
    },
    technology: {
      trackingSystem: 'GPS Real-time',
      managementSoftware: 'WasteTrack Pro',
      mobileApp: 'WasteTrack Mobile',
      iotDevices: 234,
      automationLevel: 85, // percentage
      dataAnalytics: 'Advanced Analytics Dashboard',
    },
    compliance: {
      environmentalPermits: ['AMDAL', 'UKL-UPL', 'Izin Lingkungan'],
      safetyCompliance: ['K3', 'ISO 45001'],
      qualityStandards: ['ISO 9001', 'ISO 14001'],
      audits: [
        {
          type: 'Environmental',
          date: '2024-11-15',
          result: 'Passed',
          score: 95,
        },
        { type: 'Safety', date: '2024-10-20', result: 'Passed', score: 92 },
        { type: 'Quality', date: '2024-09-10', result: 'Passed', score: 88 },
      ],
    },
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save the data to your backend
    console.log('Profile data saved:', profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset any changes if needed
  };

  const tabs = [
    { id: 'company', label: 'Perusahaan', icon: '🏢' },
    { id: 'management', label: 'Manajemen', icon: '👥' },
    { id: 'coverage', label: 'Cakupan', icon: '🗺️' },
    { id: 'services', label: 'Layanan', icon: '🔧' },
    { id: 'performance', label: 'Performa', icon: '📊' },
    { id: 'financials', label: 'Keuangan', icon: '💰' },
    { id: 'technology', label: 'Teknologi', icon: '💻' },
    { id: 'compliance', label: 'Kepatuhan', icon: '✅' },
  ];

  const renderCompanyTab = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Nama Perusahaan
          </label>
          <input
            type='text'
            value={profileData.company.name}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                company: { ...profileData.company, name: e.target.value },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Jenis Usaha
          </label>
          <input
            type='text'
            value={profileData.company.type}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                company: { ...profileData.company, type: e.target.value },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Tanggal Berdiri
          </label>
          <input
            type='date'
            value={profileData.company.establishedDate}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                company: {
                  ...profileData.company,
                  establishedDate: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Nomor Registrasi
          </label>
          <input
            type='text'
            value={profileData.company.registrationNumber}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                company: {
                  ...profileData.company,
                  registrationNumber: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Nomor Izin
          </label>
          <input
            type='text'
            value={profileData.company.licenseNumber}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                company: {
                  ...profileData.company,
                  licenseNumber: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            NPWP
          </label>
          <input
            type='text'
            value={profileData.company.taxId}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                company: { ...profileData.company, taxId: e.target.value },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>
          Alamat
        </label>
        <textarea
          value={profileData.company.address}
          onChange={(e) =>
            setProfileData({
              ...profileData,
              company: { ...profileData.company, address: e.target.value },
            })
          }
          disabled={!isEditing}
          rows={3}
          className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
        />
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Telepon
          </label>
          <input
            type='text'
            value={profileData.company.phone}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                company: { ...profileData.company, phone: e.target.value },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Email
          </label>
          <input
            type='email'
            value={profileData.company.email}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                company: { ...profileData.company, email: e.target.value },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Website
          </label>
          <input
            type='url'
            value={profileData.company.website}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                company: { ...profileData.company, website: e.target.value },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Status Operasional
          </label>
          <select
            value={profileData.company.operationalStatus}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                company: {
                  ...profileData.company,
                  operationalStatus: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          >
            <option value='Aktif'>Aktif</option>
            <option value='Tidak Aktif'>Tidak Aktif</option>
            <option value='Pemeliharaan'>Pemeliharaan</option>
          </select>
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>
          Sertifikasi
        </label>
        <textarea
          value={profileData.company.certification}
          onChange={(e) =>
            setProfileData({
              ...profileData,
              company: {
                ...profileData.company,
                certification: e.target.value,
              },
            })
          }
          disabled={!isEditing}
          rows={2}
          className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
        />
      </div>
    </div>
  );

  const renderManagementTab = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            CEO
          </label>
          <input
            type='text'
            value={profileData.management.ceo}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                management: { ...profileData.management, ceo: e.target.value },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Manajer Operasional
          </label>
          <input
            type='text'
            value={profileData.management.operationsManager}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                management: {
                  ...profileData.management,
                  operationsManager: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Manajer Teknis
          </label>
          <input
            type='text'
            value={profileData.management.technicalManager}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                management: {
                  ...profileData.management,
                  technicalManager: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Manajer Admin
          </label>
          <input
            type='text'
            value={profileData.management.adminManager}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                management: {
                  ...profileData.management,
                  adminManager: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Jumlah Karyawan
          </label>
          <input
            type='number'
            value={profileData.management.employees}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                management: {
                  ...profileData.management,
                  employees: parseInt(e.target.value),
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>
          Departemen
        </label>
        <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
          {profileData.management.departments.map((dept, index) => (
            <div
              key={index}
              className='rounded-lg border border-blue-200 bg-blue-50 p-3'
            >
              <span className='text-sm font-medium text-blue-800'>{dept}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCoverageTab = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Total Area (km²)
          </label>
          <input
            type='number'
            value={profileData.coverage.totalArea}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                coverage: {
                  ...profileData.coverage,
                  totalArea: parseInt(e.target.value),
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Jumlah Unit Kolektor
          </label>
          <input
            type='number'
            value={profileData.coverage.collectorUnits}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                coverage: {
                  ...profileData.coverage,
                  collectorUnits: parseInt(e.target.value),
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Titik Layanan
          </label>
          <input
            type='number'
            value={profileData.coverage.servicePoints}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                coverage: {
                  ...profileData.coverage,
                  servicePoints: parseInt(e.target.value),
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Jumlah Pelanggan
          </label>
          <input
            type='number'
            value={profileData.coverage.customers}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                coverage: {
                  ...profileData.coverage,
                  customers: parseInt(e.target.value),
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>
          Wilayah Layanan
        </label>
        <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
          {profileData.coverage.regions.map((region, index) => (
            <div
              key={index}
              className='rounded-lg border border-green-200 bg-green-50 p-3'
            >
              <span className='text-sm font-medium text-green-800'>
                {region}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderServicesTab = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Jam Operasional
          </label>
          <input
            type='text'
            value={profileData.services.operatingHours}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                services: {
                  ...profileData.services,
                  operatingHours: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Waktu Respon
          </label>
          <input
            type='text'
            value={profileData.services.responseTime}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                services: {
                  ...profileData.services,
                  responseTime: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Kapasitas
          </label>
          <input
            type='text'
            value={profileData.services.capacity}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                services: { ...profileData.services, capacity: e.target.value },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>
          Jenis Sampah
        </label>
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          {profileData.services.wasteTypes.map((type, index) => (
            <div
              key={index}
              className='rounded-lg border border-yellow-200 bg-yellow-50 p-3'
            >
              <span className='text-sm font-medium text-yellow-800'>
                {type}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>
          Jenis Layanan
        </label>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          {profileData.services.serviceTypes.map((service, index) => (
            <div
              key={index}
              className='rounded-lg border border-purple-200 bg-purple-50 p-3'
            >
              <span className='text-sm font-medium text-purple-800'>
                {service}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
          <h4 className='mb-2 text-sm font-medium text-blue-800'>
            Sampah Terkumpul
          </h4>
          <p className='text-2xl font-bold text-blue-900'>
            {(profileData.performance.totalCollected / 1000).toFixed(1)} ton
          </p>
          <p className='text-sm text-blue-600'>Bulan ini</p>
        </div>
        <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
          <h4 className='mb-2 text-sm font-medium text-green-800'>Efisiensi</h4>
          <p className='text-2xl font-bold text-green-900'>
            {profileData.performance.efficiency}%
          </p>
          <p className='text-sm text-green-600'>Rata-rata</p>
        </div>
        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
          <h4 className='mb-2 text-sm font-medium text-yellow-800'>
            Kepuasan Pelanggan
          </h4>
          <p className='text-2xl font-bold text-yellow-900'>
            {profileData.performance.customerSatisfaction}/5
          </p>
          <p className='text-sm text-yellow-600'>Rating</p>
        </div>
        <div className='rounded-lg border border-purple-200 bg-purple-50 p-4'>
          <h4 className='mb-2 text-sm font-medium text-purple-800'>
            Ketepatan Waktu
          </h4>
          <p className='text-2xl font-bold text-purple-900'>
            {profileData.performance.onTimeDelivery}%
          </p>
          <p className='text-sm text-purple-600'>Pengiriman</p>
        </div>
        <div className='rounded-lg border border-indigo-200 bg-indigo-50 p-4'>
          <h4 className='mb-2 text-sm font-medium text-indigo-800'>
            Daur Ulang
          </h4>
          <p className='text-2xl font-bold text-indigo-900'>
            {profileData.performance.recyclingRate}%
          </p>
          <p className='text-sm text-indigo-600'>Tingkat</p>
        </div>
        <div className='rounded-lg border border-pink-200 bg-pink-50 p-4'>
          <h4 className='mb-2 text-sm font-medium text-pink-800'>
            Pertumbuhan
          </h4>
          <p className='text-2xl font-bold text-pink-900'>
            +{profileData.performance.monthlyGrowth}%
          </p>
          <p className='text-sm text-pink-600'>Bulanan</p>
        </div>
      </div>
    </div>
  );

  const renderFinancialsTab = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
          <h4 className='mb-2 text-sm font-medium text-green-800'>
            Pendapatan Bulanan
          </h4>
          <p className='text-2xl font-bold text-green-900'>
            Rp {(profileData.financials.monthlyRevenue / 1000000).toFixed(1)}M
          </p>
          <p className='text-sm text-green-600'>Bulan ini</p>
        </div>
        <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
          <h4 className='mb-2 text-sm font-medium text-red-800'>
            Biaya Operasional
          </h4>
          <p className='text-2xl font-bold text-red-900'>
            Rp {(profileData.financials.operatingCosts / 1000000).toFixed(1)}M
          </p>
          <p className='text-sm text-red-600'>Bulan ini</p>
        </div>
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
          <h4 className='mb-2 text-sm font-medium text-blue-800'>
            Laba Bersih
          </h4>
          <p className='text-2xl font-bold text-blue-900'>
            Rp {(profileData.financials.netProfit / 1000000).toFixed(1)}M
          </p>
          <p className='text-sm text-blue-600'>
            Margin: {profileData.financials.profitMargin}%
          </p>
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>
          Metode Pembayaran
        </label>
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          {profileData.financials.paymentMethods.map((method, index) => (
            <div
              key={index}
              className='rounded-lg border border-gray-200 bg-gray-50 p-3'
            >
              <span className='text-sm font-medium text-gray-800'>
                {method}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>
          Siklus Penagihan
        </label>
        <input
          type='text'
          value={profileData.financials.billingCycle}
          onChange={(e) =>
            setProfileData({
              ...profileData,
              financials: {
                ...profileData.financials,
                billingCycle: e.target.value,
              },
            })
          }
          disabled={!isEditing}
          className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
        />
      </div>
    </div>
  );

  const renderTechnologyTab = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Sistem Pelacakan
          </label>
          <input
            type='text'
            value={profileData.technology.trackingSystem}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                technology: {
                  ...profileData.technology,
                  trackingSystem: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Software Manajemen
          </label>
          <input
            type='text'
            value={profileData.technology.managementSoftware}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                technology: {
                  ...profileData.technology,
                  managementSoftware: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Aplikasi Mobile
          </label>
          <input
            type='text'
            value={profileData.technology.mobileApp}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                technology: {
                  ...profileData.technology,
                  mobileApp: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Perangkat IoT
          </label>
          <input
            type='number'
            value={profileData.technology.iotDevices}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                technology: {
                  ...profileData.technology,
                  iotDevices: parseInt(e.target.value),
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Tingkat Otomasi (%)
          </label>
          <input
            type='number'
            value={profileData.technology.automationLevel}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                technology: {
                  ...profileData.technology,
                  automationLevel: parseInt(e.target.value),
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Analitik Data
          </label>
          <input
            type='text'
            value={profileData.technology.dataAnalytics}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                technology: {
                  ...profileData.technology,
                  dataAnalytics: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'
          />
        </div>
      </div>
    </div>
  );

  const renderComplianceTab = () => (
    <div className='space-y-6'>
      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>
          Izin Lingkungan
        </label>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          {profileData.compliance.environmentalPermits.map((permit, index) => (
            <div
              key={index}
              className='rounded-lg border border-green-200 bg-green-50 p-3'
            >
              <span className='text-sm font-medium text-green-800'>
                {permit}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>
          Kepatuhan Keselamatan
        </label>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          {profileData.compliance.safetyCompliance.map((safety, index) => (
            <div
              key={index}
              className='rounded-lg border border-yellow-200 bg-yellow-50 p-3'
            >
              <span className='text-sm font-medium text-yellow-800'>
                {safety}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>
          Standar Kualitas
        </label>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          {profileData.compliance.qualityStandards.map((standard, index) => (
            <div
              key={index}
              className='rounded-lg border border-blue-200 bg-blue-50 p-3'
            >
              <span className='text-sm font-medium text-blue-800'>
                {standard}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium text-gray-700'>
          Riwayat Audit
        </label>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {profileData.compliance.audits.map((audit, index) => (
            <div
              key={index}
              className='rounded-lg border border-gray-200 bg-white p-4'
            >
              <h4 className='text-sm font-medium text-gray-900'>
                {audit.type}
              </h4>
              <p className='text-sm text-gray-600'>Tanggal: {audit.date}</p>
              <p className='text-sm text-gray-600'>Hasil: {audit.result}</p>
              <p className='text-sm text-gray-600'>Skor: {audit.score}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return renderCompanyTab();
      case 'management':
        return renderManagementTab();
      case 'coverage':
        return renderCoverageTab();
      case 'services':
        return renderServicesTab();
      case 'performance':
        return renderPerformanceTab();
      case 'financials':
        return renderFinancialsTab();
      case 'technology':
        return renderTechnologyTab();
      case 'compliance':
        return renderComplianceTab();
      default:
        return renderCompanyTab();
    }
  };

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Profil Perusahaan
          </h1>
          <p className='mt-1 text-gray-600'>
            Kelola informasi perusahaan dan konfigurasi sistem
          </p>
        </div>
        <div className='flex space-x-3'>
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className='rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                Simpan
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className='rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              Edit Profil
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8 overflow-x-auto'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <span className='mr-2'>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='rounded-lg bg-white p-6 shadow-md'>
        {renderTabContent()}
      </div>
    </div>
  );
}
