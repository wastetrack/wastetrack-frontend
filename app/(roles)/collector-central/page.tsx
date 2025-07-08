'use client';

import { useState } from 'react';
import { LogoutButton } from '@/components/logout-button/logout-button';

export default function CollectorCentralDashboard() {
  const [dashboardData] = useState({
    overview: {
      totalCollectors: 45,
      activeCollectors: 32,
      totalCollections: 1247,
      totalWaste: 34520, // kg
      completedToday: 189,
      pendingToday: 23,
      efficiency: 92.5, // percentage
    },
    recentActivity: [
      {
        id: 1,
        type: 'collection',
        message: 'PT. Surabaya Waste Collection menyelesaikan 15 pengumpulan',
        time: '2 menit yang lalu',
        status: 'success',
      },
      {
        id: 2,
        type: 'alert',
        message: 'CV. Bersih Lingkungan terlambat dari jadwal',
        time: '5 menit yang lalu',
        status: 'warning',
      },
      {
        id: 3,
        type: 'assignment',
        message: 'Tugas baru diberikan kepada Unit Kebersihan Timur',
        time: '10 menit yang lalu',
        status: 'info',
      },
      {
        id: 4,
        type: 'completion',
        message: 'Rute Surabaya Barat telah selesai 100%',
        time: '15 menit yang lalu',
        status: 'success',
      },
    ],
    todayStats: {
      activeTrips: 12,
      completedTrips: 89,
      totalDistance: 1247, // km
      fuelUsed: 342, // liters
      wasteCollected: 8450, // kg
    },
    regionPerformance: [
      {
        region: 'Surabaya Timur',
        collectors: 12,
        efficiency: 94.2,
        collections: 45,
      },
      {
        region: 'Surabaya Barat',
        collectors: 8,
        efficiency: 91.8,
        collections: 32,
      },
      {
        region: 'Surabaya Utara',
        collectors: 10,
        efficiency: 89.5,
        collections: 38,
      },
      {
        region: 'Surabaya Selatan',
        collectors: 9,
        efficiency: 93.1,
        collections: 41,
      },
      {
        region: 'Surabaya Pusat',
        collectors: 6,
        efficiency: 87.3,
        collections: 33,
      },
    ],
    alerts: [
      {
        id: 1,
        type: 'urgent',
        title: 'Kendaraan Bermasalah',
        message: 'Truk B 1234 CD mengalami kerusakan mesin',
        time: '1 jam yang lalu',
      },
      {
        id: 2,
        type: 'warning',
        title: 'Keterlambatan Jadwal',
        message: '3 unit pengumpul terlambat dari jadwal',
        time: '2 jam yang lalu',
      },
      {
        id: 3,
        type: 'info',
        title: 'Peningkatan Performa',
        message: 'Efisiensi minggu ini meningkat 5%',
        time: '3 jam yang lalu',
      },
    ],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Dashboard Pusat Pengumpul
          </h1>
          <p className='mt-1 text-gray-600'>
            Kelola dan monitor semua unit pengumpul sampah
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg bg-white p-6 shadow-md'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Total Kolektor
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {dashboardData.overview.totalCollectors}
              </p>
            </div>
            <div className='rounded-full bg-blue-50 p-3'>
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
                  d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
            </div>
          </div>
          <div className='mt-4 flex items-center text-sm'>
            <span className='font-medium text-green-600'>
              {dashboardData.overview.activeCollectors} aktif
            </span>
            <span className='ml-2 text-gray-600'>dari total unit</span>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Total Pengumpulan
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {dashboardData.overview.totalCollections.toLocaleString(
                  'id-ID'
                )}
              </p>
            </div>
            <div className='rounded-full bg-green-50 p-3'>
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
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
          </div>
          <div className='mt-4 flex items-center text-sm'>
            <span className='font-medium text-green-600'>
              {dashboardData.overview.completedToday} selesai
            </span>
            <span className='ml-2 text-gray-600'>hari ini</span>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Sampah</p>
              <p className='text-2xl font-bold text-gray-900'>
                {(dashboardData.overview.totalWaste / 1000).toFixed(1)} ton
              </p>
            </div>
            <div className='rounded-full bg-yellow-50 p-3'>
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
                  d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                />
              </svg>
            </div>
          </div>
          <div className='mt-4 flex items-center text-sm'>
            <span className='font-medium text-yellow-600'>
              {dashboardData.todayStats.wasteCollected} kg
            </span>
            <span className='ml-2 text-gray-600'>hari ini</span>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Efisiensi</p>
              <p className='text-2xl font-bold text-gray-900'>
                {dashboardData.overview.efficiency}%
              </p>
            </div>
            <div className='rounded-full bg-purple-50 p-3'>
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
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
            </div>
          </div>
          <div className='mt-4 flex items-center text-sm'>
            <span className='font-medium text-purple-600'>
              {dashboardData.overview.pendingToday} menunggu
            </span>
            <span className='ml-2 text-gray-600'>tugas</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Recent Activity */}
        <div className='lg:col-span-2'>
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Aktivitas Terkini
            </h3>
            <div className='space-y-4'>
              {dashboardData.recentActivity.map((activity) => (
                <div key={activity.id} className='flex items-start space-x-3'>
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${getStatusColor(activity.status)}`}
                  >
                    {activity.type === 'collection' && (
                      <svg
                        className='h-4 w-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    )}
                    {activity.type === 'alert' && (
                      <svg
                        className='h-4 w-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z'
                        />
                      </svg>
                    )}
                    {activity.type === 'assignment' && (
                      <svg
                        className='h-4 w-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                        />
                      </svg>
                    )}
                    {activity.type === 'completion' && (
                      <svg
                        className='h-4 w-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    )}
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm text-gray-900'>{activity.message}</p>
                    <p className='text-xs text-gray-500'>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div>
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Peringatan
            </h3>
            <div className='space-y-3'>
              {dashboardData.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-3 ${getAlertColor(alert.type)}`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h4 className='text-sm font-medium text-gray-900'>
                        {alert.title}
                      </h4>
                      <p className='mt-1 text-sm text-gray-600'>
                        {alert.message}
                      </p>
                      <p className='mt-2 text-xs text-gray-500'>{alert.time}</p>
                    </div>
                    {alert.type === 'urgent' && (
                      <div className='h-2 w-2 flex-shrink-0 rounded-full bg-red-500'></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance by Region */}
      <div className='rounded-lg bg-white p-6 shadow-md'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          Performa per Wilayah
        </h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
          {dashboardData.regionPerformance.map((region) => (
            <div key={region.region} className='rounded-lg bg-gray-50 p-4'>
              <h4 className='text-sm font-medium text-gray-900'>
                {region.region}
              </h4>
              <div className='mt-2 space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Kolektor</span>
                  <span className='font-medium'>{region.collectors}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Efisiensi</span>
                  <span className='font-medium text-green-600'>
                    {region.efficiency}%
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Pengumpulan</span>
                  <span className='font-medium'>{region.collections}</span>
                </div>
                <div className='mt-2'>
                  <div className='h-2 w-full rounded-full bg-gray-200'>
                    <div
                      className='h-2 rounded-full bg-green-600'
                      style={{ width: `${region.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Statistics */}
      <div className='rounded-lg bg-white p-6 shadow-md'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          Statistik Hari Ini
        </h3>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-blue-600'>
              {dashboardData.todayStats.activeTrips}
            </div>
            <div className='text-sm text-gray-600'>Perjalanan Aktif</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-green-600'>
              {dashboardData.todayStats.completedTrips}
            </div>
            <div className='text-sm text-gray-600'>Perjalanan Selesai</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-purple-600'>
              {dashboardData.todayStats.totalDistance.toLocaleString('id-ID')}
            </div>
            <div className='text-sm text-gray-600'>Total Jarak (km)</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-yellow-600'>
              {dashboardData.todayStats.fuelUsed.toLocaleString('id-ID')}
            </div>
            <div className='text-sm text-gray-600'>Bahan Bakar (L)</div>
          </div>
          <div className='text-center'>
            <div className='text-3xl font-bold text-orange-600'>
              {dashboardData.todayStats.wasteCollected.toLocaleString('id-ID')}
            </div>
            <div className='text-sm text-gray-600'>Sampah Terkumpul (kg)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
