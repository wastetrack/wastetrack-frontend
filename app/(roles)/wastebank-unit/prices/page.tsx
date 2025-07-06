'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Package,
  TrendingUp,
} from 'lucide-react';

interface WastePrice {
  id: number;
  category: string;
  type: string;
  price: number;
  unit: string;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
}

export default function PricesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data - replace with actual API call
  const wastePrices: WastePrice[] = [
    {
      id: 1,
      category: 'Plastik',
      type: 'Botol PET',
      price: 2500,
      unit: 'kg',
      lastUpdated: '2025-01-06',
      trend: 'up',
    },
    {
      id: 2,
      category: 'Plastik',
      type: 'Plastik Keras',
      price: 3000,
      unit: 'kg',
      lastUpdated: '2025-01-06',
      trend: 'stable',
    },
    {
      id: 3,
      category: 'Kertas',
      type: 'Kertas Putih',
      price: 1800,
      unit: 'kg',
      lastUpdated: '2025-01-05',
      trend: 'down',
    },
    {
      id: 4,
      category: 'Kertas',
      type: 'Kardus',
      price: 1500,
      unit: 'kg',
      lastUpdated: '2025-01-05',
      trend: 'stable',
    },
    {
      id: 5,
      category: 'Logam',
      type: 'Aluminium',
      price: 8000,
      unit: 'kg',
      lastUpdated: '2025-01-04',
      trend: 'up',
    },
    {
      id: 6,
      category: 'Logam',
      type: 'Besi',
      price: 5500,
      unit: 'kg',
      lastUpdated: '2025-01-04',
      trend: 'up',
    },
  ];

  const categories = ['Plastik', 'Kertas', 'Logam', 'Kaca', 'Organik'];

  const filteredPrices = wastePrices.filter(
    (item) =>
      (selectedCategory === 'all' || item.category === selectedCategory) &&
      (item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className='h-4 w-4 text-emerald-600' />;
      case 'down':
        return <TrendingUp className='h-4 w-4 rotate-180 text-red-600' />;
      default:
        return <div className='h-4 w-4 rounded-full bg-gray-400' />;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-2xl font-bold text-gray-900'>
            <DollarSign className='text-emerald-600' size={28} />
            Manajemen Harga Sampah
          </h1>
          <p className='mt-1 text-gray-600'>
            Kelola harga pembelian sampah per jenis dan kategori
          </p>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button className='rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'>
            <Plus size={20} className='mr-2 inline' />
            Tambah Harga
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center'>
            <Package className='h-8 w-8 text-blue-600' />
            <div className='ml-4'>
              <div className='text-2xl font-bold text-gray-900'>
                {filteredPrices.length}
              </div>
              <div className='text-sm text-gray-600'>Jenis Sampah</div>
            </div>
          </div>
        </div>
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center'>
            <DollarSign className='h-8 w-8 text-emerald-600' />
            <div className='ml-4'>
              <div className='text-2xl font-bold text-gray-900'>
                {filteredPrices.length > 0
                  ? formatCurrency(
                      filteredPrices.reduce(
                        (sum, item) => sum + item.price,
                        0
                      ) / filteredPrices.length
                    ).replace('Rp', '')
                  : '0'}
              </div>
              <div className='text-sm text-gray-600'>Rata-rata Harga</div>
            </div>
          </div>
        </div>
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center'>
            <TrendingUp className='h-8 w-8 text-purple-600' />
            <div className='ml-4'>
              <div className='text-2xl font-bold text-gray-900'>
                {filteredPrices.length > 0
                  ? formatCurrency(
                      Math.max(...filteredPrices.map((item) => item.price))
                    ).replace('Rp', '')
                  : '0'}
              </div>
              <div className='text-sm text-gray-600'>Harga Tertinggi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder='Cari jenis sampah...'
            className='w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className='rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value='all'>Semua Kategori</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Prices Table */}
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Jenis Sampah
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Kategori
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Harga
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Trend
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Terakhir Update
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {filteredPrices.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-12 text-center text-gray-500'
                  >
                    {searchTerm || selectedCategory !== 'all'
                      ? 'Tidak ada data yang sesuai dengan filter'
                      : 'Belum ada harga yang ditentukan'}
                  </td>
                </tr>
              ) : (
                filteredPrices.map((item) => (
                  <tr key={item.id} className='hover:bg-gray-50'>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <div className='text-sm font-medium text-gray-900'>
                        {item.type}
                      </div>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <span className='inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800'>
                        {item.category}
                      </span>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <div className='text-sm font-medium text-gray-900'>
                        {formatCurrency(item.price)}
                      </div>
                      <div className='text-sm text-gray-600'>{item.unit}</div>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <div className='flex items-center'>
                        {getTrendIcon(item.trend || 'stable')}
                      </div>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                      {new Date(item.lastUpdated).toLocaleDateString('id-ID')}
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-right text-sm font-medium'>
                      <div className='flex justify-end gap-2'>
                        <button className='text-indigo-600 hover:text-indigo-900'>
                          <Edit size={16} />
                        </button>
                        <button className='text-red-600 hover:text-red-900'>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
