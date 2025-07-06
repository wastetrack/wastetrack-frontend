'use client';

import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  // Mock data - replace with actual data from API
  const dashboardData = {
    totalCollectors: 15,
    todayTransactions: 42,
    monthlyRevenue: 15750000,
    inventoryItems: 128,
    pendingRequests: 3,
    recentTransactions: [
      {
        id: 1,
        customer: 'Budi Santoso',
        amount: 125000,
        type: 'Plastik PET',
        time: '09:30',
      },
      {
        id: 2,
        customer: 'Siti Aminah',
        amount: 85000,
        type: 'Kertas',
        time: '10:15',
      },
      {
        id: 3,
        customer: 'Ahmad Rahman',
        amount: 200000,
        type: 'Logam',
        time: '11:00',
      },
    ],
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-2xl font-bold text-gray-900'>
            <LayoutDashboard className='text-emerald-600' size={28} />
            Dashboard Unit Bank Sampah
          </h1>
          <p className='mt-1 text-gray-600'>
            Kelola operasional harian bank sampah unit Anda
          </p>
        </div>
        <div className='mt-4 sm:mt-0'>
          <span className='text-sm text-gray-500'>
            Terakhir diperbarui: {new Date().toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Total Kolektor
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {dashboardData.totalCollectors}
              </p>
            </div>
            <div className='rounded-full bg-blue-50 p-3'>
              <Users className='text-blue-600' size={24} />
            </div>
          </div>
          <div className='mt-4 flex items-center text-sm'>
            <TrendingUp className='mr-1 text-green-500' size={16} />
            <span className='text-green-600'>+2 bulan ini</span>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Transaksi Hari Ini
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {dashboardData.todayTransactions}
              </p>
            </div>
            <div className='rounded-full bg-emerald-50 p-3'>
              <DollarSign className='text-emerald-600' size={24} />
            </div>
          </div>
          <div className='mt-4 flex items-center text-sm'>
            <TrendingUp className='mr-1 text-green-500' size={16} />
            <span className='text-green-600'>+15% dari kemarin</span>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Pendapatan Bulan Ini
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                Rp {dashboardData.monthlyRevenue.toLocaleString('id-ID')}
              </p>
            </div>
            <div className='rounded-full bg-purple-50 p-3'>
              <DollarSign className='text-purple-600' size={24} />
            </div>
          </div>
          <div className='mt-4 flex items-center text-sm'>
            <TrendingUp className='mr-1 text-green-500' size={16} />
            <span className='text-green-600'>+8% dari bulan lalu</span>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Item Inventori
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {dashboardData.inventoryItems}
              </p>
            </div>
            <div className='rounded-full bg-orange-50 p-3'>
              <Package className='text-orange-600' size={24} />
            </div>
          </div>
          <div className='mt-4 flex items-center text-sm'>
            <AlertCircle className='mr-1 text-yellow-500' size={16} />
            <span className='text-yellow-600'>3 item menipis</span>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Recent Transactions */}
        <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
          <div className='border-b border-gray-200 p-6'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Transaksi Terbaru
            </h3>
          </div>
          <div className='p-6'>
            <div className='space-y-4'>
              {dashboardData.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className='flex items-center justify-between rounded-lg bg-gray-50 p-3'
                >
                  <div>
                    <p className='font-medium text-gray-900'>
                      {transaction.customer}
                    </p>
                    <p className='text-sm text-gray-600'>
                      {transaction.type} • {transaction.time}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-emerald-600'>
                      +Rp {transaction.amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className='mt-4'>
              <button className='w-full py-2 text-center text-sm font-medium text-emerald-600 hover:text-emerald-700'>
                Lihat Semua Transaksi →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
          <div className='border-b border-gray-200 p-6'>
            <h3 className='text-lg font-semibold text-gray-900'>Aksi Cepat</h3>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-2 gap-4'>
              <button className='flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50'>
                <DollarSign className='mb-2 text-emerald-600' size={32} />
                <span className='text-sm font-medium text-gray-900'>
                  Transaksi Baru
                </span>
              </button>
              <button className='flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50'>
                <Users className='mb-2 text-blue-600' size={32} />
                <span className='text-sm font-medium text-gray-900'>
                  Kelola Kolektor
                </span>
              </button>
              <button className='flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50'>
                <Package className='mb-2 text-orange-600' size={32} />
                <span className='text-sm font-medium text-gray-900'>
                  Cek Inventori
                </span>
              </button>
              <button className='flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50'>
                <Calendar className='mb-2 text-purple-600' size={32} />
                <span className='text-sm font-medium text-gray-900'>
                  Jadwal Pickup
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts/Notifications */}
      {dashboardData.pendingRequests > 0 && (
        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
          <div className='flex items-center'>
            <AlertCircle className='mr-3 text-yellow-600' size={20} />
            <div>
              <p className='text-sm font-medium text-yellow-800'>
                Anda memiliki {dashboardData.pendingRequests} permintaan yang
                perlu diproses
              </p>
              <p className='mt-1 text-sm text-yellow-700'>
                Klik untuk melihat detail permintaan dari unit pusat
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
