'use client';

import { useState } from 'react';

// Dummy data untuk laporan
const dummyReports = {
  monthlyStats: {
    totalPurchases: 1250000,
    totalWeight: 875,
    totalTransactions: 24,
    avgPricePerKg: 4200,
  },
  wasteTypeStats: [
    { type: 'Plastik PET', weight: 320, percentage: 36.6, value: 480000 },
    { type: 'Kardus', weight: 180, percentage: 20.6, value: 270000 },
    { type: 'Aluminium', weight: 95, percentage: 10.9, value: 285000 },
    { type: 'Kertas Bekas', weight: 150, percentage: 17.1, value: 150000 },
    { type: 'Botol Kaca', weight: 130, percentage: 14.9, value: 65000 },
  ],
  supplierStats: [
    { name: 'Bank Sampah Mawar', transactions: 8, weight: 245, value: 350000 },
    {
      name: 'Kolektor Sampah Sejahtera',
      transactions: 6,
      weight: 180,
      value: 280000,
    },
    { name: 'Bank Sampah Melati', transactions: 5, weight: 220, value: 320000 },
    {
      name: 'Pengumpul Sampah Mandiri',
      transactions: 3,
      weight: 150,
      value: 200000,
    },
    { name: 'Bank Sampah Hijau', transactions: 2, weight: 80, value: 100000 },
  ],
};

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='mb-2 text-2xl font-bold text-gray-900'>
          Laporan & Analisis
        </h1>
        <p className='text-gray-600'>
          Analisis performa pembelian sampah dan tren pasar
        </p>
      </div>

      {/* Period Filter */}
      <div className='mb-6'>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className='rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <option value='weekly'>Mingguan</option>
          <option value='monthly'>Bulanan</option>
          <option value='quarterly'>Kuartal</option>
          <option value='yearly'>Tahunan</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-2 text-sm font-medium text-gray-500'>
            Total Pembelian
          </h3>
          <p className='text-2xl font-bold text-blue-600'>
            Rp{' '}
            {dummyReports.monthlyStats.totalPurchases.toLocaleString('id-ID')}
          </p>
          <p className='mt-1 text-sm text-green-600'>
            ↗ +12.5% dari bulan lalu
          </p>
        </div>
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-2 text-sm font-medium text-gray-500'>
            Total Berat
          </h3>
          <p className='text-2xl font-bold text-green-600'>
            {dummyReports.monthlyStats.totalWeight} kg
          </p>
          <p className='mt-1 text-sm text-green-600'>
            ↗ +8.3% dari bulan lalu
          </p>
        </div>
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-2 text-sm font-medium text-gray-500'>
            Total Transaksi
          </h3>
          <p className='text-2xl font-bold text-purple-600'>
            {dummyReports.monthlyStats.totalTransactions}
          </p>
          <p className='mt-1 text-sm text-green-600'>
            ↗ +15.2% dari bulan lalu
          </p>
        </div>
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-2 text-sm font-medium text-gray-500'>
            Rata-rata Harga/kg
          </h3>
          <p className='text-2xl font-bold text-orange-600'>
            Rp {dummyReports.monthlyStats.avgPricePerKg.toLocaleString('id-ID')}
          </p>
          <p className='mt-1 text-sm text-red-600'>↘ -2.1% dari bulan lalu</p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Waste Type Statistics */}
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>
            Statistik Jenis Sampah
          </h3>
          <div className='space-y-4'>
            {dummyReports.wasteTypeStats.map((item, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='mb-1 flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-700'>
                      {item.type}
                    </span>
                    <span className='text-sm text-gray-500'>
                      {item.weight} kg ({item.percentage}%)
                    </span>
                  </div>
                  <div className='h-2 w-full rounded-full bg-gray-200'>
                    <div
                      className='h-2 rounded-full bg-blue-500'
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className='mt-1 text-xs text-gray-500'>
                    Nilai: Rp {item.value.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Performance */}
        <div className='rounded-lg border bg-white p-6 shadow-sm'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>
            Performa Pemasok
          </h3>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b'>
                  <th className='py-2 text-left text-sm font-medium text-gray-500'>
                    Pemasok
                  </th>
                  <th className='py-2 text-right text-sm font-medium text-gray-500'>
                    Transaksi
                  </th>
                  <th className='py-2 text-right text-sm font-medium text-gray-500'>
                    Berat (kg)
                  </th>
                  <th className='py-2 text-right text-sm font-medium text-gray-500'>
                    Nilai
                  </th>
                </tr>
              </thead>
              <tbody>
                {dummyReports.supplierStats.map((supplier, index) => (
                  <tr key={index} className='border-b'>
                    <td className='py-3 text-sm text-gray-900'>
                      {supplier.name}
                    </td>
                    <td className='py-3 text-right text-sm text-gray-500'>
                      {supplier.transactions}
                    </td>
                    <td className='py-3 text-right text-sm text-gray-500'>
                      {supplier.weight}
                    </td>
                    <td className='py-3 text-right text-sm font-medium text-gray-900'>
                      Rp {supplier.value.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Charts Section */}
      <div className='mt-8 rounded-lg border bg-white p-6 shadow-sm'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          Tren Pembelian Bulanan
        </h3>
        <div className='flex h-64 items-center justify-center rounded-lg bg-gray-50'>
          <div className='text-center text-gray-500'>
            <div className='mb-2 text-4xl'>📊</div>
            <p>Grafik tren akan ditampilkan di sini</p>
            <p className='text-sm'>
              Integrasi dengan library chart (Chart.js, Recharts, dll.)
            </p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className='mt-6 flex flex-col gap-4 sm:flex-row'>
        <button className='rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
          📥 Export PDF
        </button>
        <button className='rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700'>
          📊 Export Excel
        </button>
        <button className='rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700'>
          📧 Email Laporan
        </button>
      </div>
    </div>
  );
}
