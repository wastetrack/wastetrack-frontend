'use client';

import React from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

export default function ReportsPage() {
  // Mock data - replace with actual data from API
  const reportData = {
    daily: {
      transactions: 42,
      revenue: 520000,
      weight: 67.8,
      customers: 28,
    },
    weekly: {
      transactions: 315,
      revenue: 4250000,
      weight: 485.6,
      customers: 156,
    },
    monthly: {
      transactions: 1240,
      revenue: 15750000,
      weight: 1856.3,
      customers: 445,
    },
  };

  const recentReports = [
    {
      id: 1,
      title: 'Laporan Harian - 6 Juli 2024',
      type: 'daily',
      generatedAt: '2024-07-06 17:00:00',
      fileSize: '2.4 MB',
    },
    {
      id: 2,
      title: 'Laporan Mingguan - Minggu ke-27',
      type: 'weekly',
      generatedAt: '2024-07-06 08:00:00',
      fileSize: '5.7 MB',
    },
    {
      id: 3,
      title: 'Laporan Bulanan - Juni 2024',
      type: 'monthly',
      generatedAt: '2024-07-01 09:00:00',
      fileSize: '12.3 MB',
    },
  ];

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-green-100 text-green-800';
      case 'weekly':
        return 'bg-blue-100 text-blue-800';
      case 'monthly':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportTypeText = (type: string) => {
    switch (type) {
      case 'daily':
        return 'Harian';
      case 'weekly':
        return 'Mingguan';
      case 'monthly':
        return 'Bulanan';
      default:
        return 'Lainnya';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-2xl font-bold text-gray-900'>
            <FileText className='text-emerald-600' size={28} />
            Laporan Unit
          </h1>
          <p className='mt-1 text-gray-600'>
            Kelola dan unduh laporan operasional unit bank sampah
          </p>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button className='flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'>
            <Download size={20} />
            Generate Laporan
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Laporan Harian
            </h3>
            <div className='rounded-full bg-green-50 p-2'>
              <Calendar className='text-green-600' size={20} />
            </div>
          </div>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Transaksi:</span>
              <span className='font-medium'>
                {reportData.daily.transactions}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Pendapatan:</span>
              <span className='font-medium'>
                Rp {reportData.daily.revenue.toLocaleString('id-ID')}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Berat Total:</span>
              <span className='font-medium'>{reportData.daily.weight} kg</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Customer:</span>
              <span className='font-medium'>{reportData.daily.customers}</span>
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Laporan Mingguan
            </h3>
            <div className='rounded-full bg-blue-50 p-2'>
              <BarChart3 className='text-blue-600' size={20} />
            </div>
          </div>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Transaksi:</span>
              <span className='font-medium'>
                {reportData.weekly.transactions}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Pendapatan:</span>
              <span className='font-medium'>
                Rp {reportData.weekly.revenue.toLocaleString('id-ID')}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Berat Total:</span>
              <span className='font-medium'>{reportData.weekly.weight} kg</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Customer:</span>
              <span className='font-medium'>{reportData.weekly.customers}</span>
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Laporan Bulanan
            </h3>
            <div className='rounded-full bg-purple-50 p-2'>
              <TrendingUp className='text-purple-600' size={20} />
            </div>
          </div>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Transaksi:</span>
              <span className='font-medium'>
                {reportData.monthly.transactions}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Pendapatan:</span>
              <span className='font-medium'>
                Rp {reportData.monthly.revenue.toLocaleString('id-ID')}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Berat Total:</span>
              <span className='font-medium'>
                {reportData.monthly.weight} kg
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Customer:</span>
              <span className='font-medium'>
                {reportData.monthly.customers}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Generation */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          Generate Laporan Baru
        </h3>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Jenis Laporan
            </label>
            <select className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'>
              <option value='daily'>Laporan Harian</option>
              <option value='weekly'>Laporan Mingguan</option>
              <option value='monthly'>Laporan Bulanan</option>
              <option value='custom'>Periode Kustom</option>
            </select>
          </div>
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700'>
              Format File
            </label>
            <select className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'>
              <option value='pdf'>PDF</option>
              <option value='excel'>Excel (.xlsx)</option>
              <option value='csv'>CSV</option>
            </select>
          </div>
        </div>
        <div className='mt-4 flex gap-4'>
          <input
            type='date'
            defaultValue={new Date().toISOString().split('T')[0]}
            className='rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
          />
          <input
            type='date'
            defaultValue={new Date().toISOString().split('T')[0]}
            className='rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
          />
          <button className='flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700'>
            <Download size={20} />
            Generate
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='border-b border-gray-200 px-6 py-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Laporan Terbaru
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Nama Laporan
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Jenis
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Tanggal Generate
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Ukuran File
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {recentReports.map((report) => (
                <tr key={report.id} className='hover:bg-gray-50'>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='flex items-center'>
                      <FileText className='mr-3 text-gray-400' size={20} />
                      <div className='text-sm font-medium text-gray-900'>
                        {report.title}
                      </div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getReportTypeColor(report.type)}`}
                    >
                      {getReportTypeText(report.type)}
                    </span>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {new Date(report.generatedAt).toLocaleDateString('id-ID')}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {new Date(report.generatedAt).toLocaleTimeString(
                        'id-ID',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {report.fileSize}
                    </div>
                  </td>
                  <td className='space-x-2 whitespace-nowrap px-6 py-4 text-sm font-medium'>
                    <button className='flex items-center gap-1 text-emerald-600 hover:text-emerald-900'>
                      <Download size={16} />
                      Unduh
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Report Templates */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          Template Laporan Cepat
        </h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <button className='flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-green-300 p-4 transition-colors hover:border-green-500 hover:bg-green-50'>
            <Calendar className='text-green-600' size={24} />
            <span className='font-medium text-green-600'>Laporan Hari Ini</span>
          </button>
          <button className='flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50'>
            <BarChart3 className='text-blue-600' size={24} />
            <span className='font-medium text-blue-600'>Laporan 7 Hari</span>
          </button>
          <button className='flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-purple-300 p-4 transition-colors hover:border-purple-500 hover:bg-purple-50'>
            <TrendingUp className='text-purple-600' size={24} />
            <span className='font-medium text-purple-600'>
              Laporan Bulan Ini
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
