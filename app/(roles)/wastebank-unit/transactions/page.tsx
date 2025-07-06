'use client';

import React from 'react';
import { CreditCard, Plus, Calendar, TrendingUp } from 'lucide-react';

export default function TransactionsPage() {
  // Mock data - replace with actual data from API
  const transactions = [
    {
      id: 1,
      customer: 'Budi Santoso',
      wasteType: 'Plastik PET',
      weight: 5.2,
      pricePerKg: 2500,
      totalAmount: 13000,
      timestamp: '2024-07-06 09:30:00',
      collector: 'Ahmad Hidayat',
    },
    {
      id: 2,
      customer: 'Siti Aminah',
      wasteType: 'Kertas',
      weight: 8.5,
      pricePerKg: 1500,
      totalAmount: 12750,
      timestamp: '2024-07-06 10:15:00',
      collector: 'Sari Dewi',
    },
    {
      id: 3,
      customer: 'Ahmad Rahman',
      wasteType: 'Logam',
      weight: 3.2,
      pricePerKg: 5000,
      totalAmount: 16000,
      timestamp: '2024-07-06 11:00:00',
      collector: 'Ahmad Hidayat',
    },
  ];

  const todayStats = {
    totalTransactions: transactions.length,
    totalWeight: transactions.reduce((sum, t) => sum + t.weight, 0),
    totalRevenue: transactions.reduce((sum, t) => sum + t.totalAmount, 0),
    avgTransaction:
      transactions.reduce((sum, t) => sum + t.totalAmount, 0) /
      transactions.length,
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-2xl font-bold text-gray-900'>
            <CreditCard className='text-emerald-600' size={28} />
            Transaksi Harian
          </h1>
          <p className='mt-1 text-gray-600'>
            Catat dan pantau transaksi sampah harian
          </p>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button className='flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'>
            <Plus size={20} />
            Transaksi Baru
          </button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Total Transaksi
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {todayStats.totalTransactions}
              </p>
            </div>
            <div className='rounded-full bg-emerald-50 p-3'>
              <CreditCard className='text-emerald-600' size={24} />
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Berat</p>
              <p className='text-2xl font-bold text-gray-900'>
                {todayStats.totalWeight.toFixed(1)} kg
              </p>
            </div>
            <div className='rounded-full bg-blue-50 p-3'>
              <TrendingUp className='text-blue-600' size={24} />
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Total Pendapatan
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                Rp {todayStats.totalRevenue.toLocaleString('id-ID')}
              </p>
            </div>
            <div className='rounded-full bg-purple-50 p-3'>
              <CreditCard className='text-purple-600' size={24} />
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Rata-rata/Transaksi
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                Rp{' '}
                {Math.round(todayStats.avgTransaction).toLocaleString('id-ID')}
              </p>
            </div>
            <div className='rounded-full bg-orange-50 p-3'>
              <TrendingUp className='text-orange-600' size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='flex flex-col items-center gap-4 sm:flex-row'>
          <div className='flex items-center gap-2'>
            <Calendar className='text-gray-400' size={20} />
            <span className='text-sm font-medium text-gray-700'>
              Filter Tanggal:
            </span>
          </div>
          <div className='flex gap-4'>
            <input
              type='date'
              defaultValue={new Date().toISOString().split('T')[0]}
              className='rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            />
            <button className='rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'>
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='border-b border-gray-200 px-6 py-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Daftar Transaksi Hari Ini
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Waktu
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Customer
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Jenis Sampah
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Berat (kg)
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Harga/kg
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Total
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Kolektor
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className='hover:bg-gray-50'>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {new Date(transaction.timestamp).toLocaleTimeString(
                        'id-ID',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      {transaction.customer}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {transaction.wasteType}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      {transaction.weight}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      Rp {transaction.pricePerKg.toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm font-bold text-emerald-600'>
                      Rp {transaction.totalAmount.toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {transaction.collector}
                    </div>
                  </td>
                  <td className='space-x-2 whitespace-nowrap px-6 py-4 text-sm font-medium'>
                    <button className='text-emerald-600 hover:text-emerald-900'>
                      Lihat
                    </button>
                    <button className='text-blue-600 hover:text-blue-900'>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>Aksi Cepat</h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <button className='flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-emerald-300 p-4 transition-colors hover:border-emerald-500 hover:bg-emerald-50'>
            <Plus className='text-emerald-600' size={24} />
            <span className='font-medium text-emerald-600'>
              Tambah Transaksi Manual
            </span>
          </button>
          <button className='flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50'>
            <CreditCard className='text-blue-600' size={24} />
            <span className='font-medium text-blue-600'>Rekap Harian</span>
          </button>
          <button className='flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-purple-300 p-4 transition-colors hover:border-purple-500 hover:bg-purple-50'>
            <TrendingUp className='text-purple-600' size={24} />
            <span className='font-medium text-purple-600'>Analisis Trend</span>
          </button>
        </div>
      </div>
    </div>
  );
}
