'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Eye,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
} from 'lucide-react';

interface SalaryTransaction {
  id: number;
  collectorId: number;
  collectorName: string;
  period: string;
  baseSalary: number;
  bonus: number;
  deduction: number;
  totalSalary: number;
  status: 'pending' | 'paid' | 'cancelled';
  paidDate?: string;
  createdDate: string;
}

export default function SalariesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Mock data - replace with actual API call
  const salaryTransactions: SalaryTransaction[] = [
    {
      id: 1,
      collectorId: 101,
      collectorName: 'Ahmad Subandi',
      period: '2025-01',
      baseSalary: 2500000,
      bonus: 500000,
      deduction: 100000,
      totalSalary: 2900000,
      status: 'paid',
      paidDate: '2025-01-05',
      createdDate: '2025-01-01',
    },
    {
      id: 2,
      collectorId: 102,
      collectorName: 'Siti Rahayu',
      period: '2025-01',
      baseSalary: 2200000,
      bonus: 300000,
      deduction: 0,
      totalSalary: 2500000,
      status: 'paid',
      paidDate: '2025-01-05',
      createdDate: '2025-01-01',
    },
    {
      id: 3,
      collectorId: 103,
      collectorName: 'Bambang Wijaya',
      period: '2025-01',
      baseSalary: 2800000,
      bonus: 700000,
      deduction: 200000,
      totalSalary: 3300000,
      status: 'pending',
      createdDate: '2025-01-01',
    },
    {
      id: 4,
      collectorId: 104,
      collectorName: 'Dewi Sari',
      period: '2024-12',
      baseSalary: 2400000,
      bonus: 400000,
      deduction: 50000,
      totalSalary: 2750000,
      status: 'paid',
      paidDate: '2024-12-30',
      createdDate: '2024-12-01',
    },
    {
      id: 5,
      collectorId: 105,
      collectorName: 'Eko Prasetyo',
      period: '2025-01',
      baseSalary: 2600000,
      bonus: 450000,
      deduction: 150000,
      totalSalary: 2900000,
      status: 'pending',
      createdDate: '2025-01-01',
    },
  ];

  const periods = [
    'all',
    ...Array.from(new Set(salaryTransactions.map((item) => item.period))),
  ];

  const filteredSalaries = salaryTransactions.filter((item) => {
    const matchesSearch =
      item.collectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.period.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || item.status === selectedStatus;
    const matchesPeriod =
      selectedPeriod === 'all' || item.period === selectedPeriod;
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const getStatusBadge = (status: 'pending' | 'paid' | 'cancelled') => {
    const statusConfig = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Menunggu',
      },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Dibayar' },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Dibatalkan',
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Calculate statistics
  const totalPaidSalaries = salaryTransactions
    .filter((item) => item.status === 'paid')
    .reduce((sum, item) => sum + item.totalSalary, 0);

  const pendingSalaries = salaryTransactions.filter(
    (item) => item.status === 'pending'
  ).length;
  const totalCollectors = Array.from(
    new Set(salaryTransactions.map((item) => item.collectorId))
  ).length;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Manajemen Gaji Kolektor
          </h1>
          <p className='mt-1 text-gray-600'>
            Kelola pembayaran gaji untuk kolektor sampah
          </p>
        </div>
        <button className='flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-emerald-700'>
          <Plus className='h-4 w-4' />
          <span>Tambah Gaji</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='rounded-lg bg-emerald-100 p-2'>
              <DollarSign className='h-6 w-6 text-emerald-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Dibayar</p>
              <p className='text-2xl font-bold text-gray-900'>
                {formatCurrency(totalPaidSalaries)}
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='rounded-lg bg-yellow-100 p-2'>
              <Calendar className='h-6 w-6 text-yellow-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Menunggu Pembayaran
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {pendingSalaries}
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='rounded-lg bg-blue-100 p-2'>
              <Users className='h-6 w-6 text-blue-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Total Kolektor
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {totalCollectors}
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='rounded-lg bg-orange-100 p-2'>
              <TrendingUp className='h-6 w-6 text-orange-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Rata-rata Gaji
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {formatCurrency(
                  salaryTransactions.reduce(
                    (sum, item) => sum + item.totalSalary,
                    0
                  ) / salaryTransactions.length
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='rounded-lg border border-gray-200 bg-white p-6'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          {/* Search */}
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <input
              type='text'
              placeholder='Cari nama kolektor atau periode...'
              className='w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className='rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value='all'>Semua Status</option>
            <option value='pending'>Menunggu</option>
            <option value='paid'>Dibayar</option>
            <option value='cancelled'>Dibatalkan</option>
          </select>

          {/* Period Filter */}
          <select
            className='rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value='all'>Semua Periode</option>
            {periods
              .filter((period) => period !== 'all')
              .map((period) => (
                <option key={period} value={period}>
                  {formatPeriod(period)}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Salaries Table */}
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Kolektor
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Periode
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Gaji Pokok
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Bonus
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Potongan
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Total Gaji
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Tanggal Bayar
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {filteredSalaries.map((item) => (
                <tr key={item.id} className='hover:bg-gray-50'>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      {item.collectorName}
                    </div>
                    <div className='text-sm text-gray-500'>
                      ID: {item.collectorId}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {formatPeriod(item.period)}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {formatCurrency(item.baseSalary)}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm font-medium text-green-600'>
                      {item.bonus > 0 ? `+${formatCurrency(item.bonus)}` : '-'}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm font-medium text-red-600'>
                      {item.deduction > 0
                        ? `-${formatCurrency(item.deduction)}`
                        : '-'}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm font-semibold text-gray-900'>
                      {formatCurrency(item.totalSalary)}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    {getStatusBadge(item.status)}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-600'>
                      {item.paidDate
                        ? new Date(item.paidDate).toLocaleDateString('id-ID')
                        : '-'}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-right'>
                    <div className='flex items-center justify-end space-x-2'>
                      <button
                        className='p-1 text-blue-600 hover:text-blue-900'
                        title='Lihat Detail'
                      >
                        <Eye className='h-4 w-4' />
                      </button>
                      <button
                        className='p-1 text-emerald-600 hover:text-emerald-900'
                        title='Edit'
                      >
                        <Edit className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSalaries.length === 0 && (
          <div className='py-12 text-center'>
            <DollarSign className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              Tidak ada data
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              {searchTerm ||
              selectedStatus !== 'all' ||
              selectedPeriod !== 'all'
                ? 'Tidak ada transaksi gaji yang sesuai dengan filter.'
                : 'Belum ada transaksi gaji yang ditambahkan.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
