'use client';

import React from 'react';
import { Package, Plus, AlertTriangle, TrendingDown } from 'lucide-react';

export default function WarehousesPage() {
  // Mock data - replace with actual data from API
  const inventoryItems = [
    {
      id: 1,
      wasteType: 'Plastik PET',
      category: 'Plastik',
      currentStock: 125.5,
      unit: 'kg',
      minThreshold: 50,
      maxCapacity: 200,
      lastUpdated: '2024-07-06 08:30:00',
      pricePerKg: 2500,
      status: 'normal',
    },
    {
      id: 2,
      wasteType: 'Kertas HVS',
      category: 'Kertas',
      currentStock: 45.2,
      unit: 'kg',
      minThreshold: 50,
      maxCapacity: 150,
      lastUpdated: '2024-07-06 09:15:00',
      pricePerKg: 1500,
      status: 'low',
    },
    {
      id: 3,
      wasteType: 'Aluminium',
      category: 'Logam',
      currentStock: 78.8,
      unit: 'kg',
      minThreshold: 30,
      maxCapacity: 100,
      lastUpdated: '2024-07-06 10:00:00',
      pricePerKg: 8000,
      status: 'normal',
    },
    {
      id: 4,
      wasteType: 'Botol Kaca',
      category: 'Kaca',
      currentStock: 15.3,
      unit: 'kg',
      minThreshold: 20,
      maxCapacity: 80,
      lastUpdated: '2024-07-05 16:45:00',
      pricePerKg: 1000,
      status: 'critical',
    },
  ];

  const totalValue = inventoryItems.reduce(
    (sum, item) => sum + item.currentStock * item.pricePerKg,
    0
  );
  const lowStockItems = inventoryItems.filter(
    (item) => item.status === 'low' || item.status === 'critical'
  ).length;
  const totalWeight = inventoryItems.reduce(
    (sum, item) => sum + item.currentStock,
    0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critical':
        return 'Kritis';
      case 'low':
        return 'Rendah';
      default:
        return 'Normal';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-2xl font-bold text-gray-900'>
            <Package className='text-emerald-600' size={28} />
            Inventori Lokal
          </h1>
          <p className='mt-1 text-gray-600'>
            Kelola stok sampah di gudang unit Anda
          </p>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button className='flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'>
            <Plus size={20} />
            Tambah Stok
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Item</p>
              <p className='text-2xl font-bold text-gray-900'>
                {inventoryItems.length}
              </p>
            </div>
            <div className='rounded-full bg-blue-50 p-3'>
              <Package className='text-blue-600' size={24} />
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Berat</p>
              <p className='text-2xl font-bold text-gray-900'>
                {totalWeight.toFixed(1)} kg
              </p>
            </div>
            <div className='rounded-full bg-emerald-50 p-3'>
              <Package className='text-emerald-600' size={24} />
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Nilai Total</p>
              <p className='text-2xl font-bold text-gray-900'>
                Rp {totalValue.toLocaleString('id-ID')}
              </p>
            </div>
            <div className='rounded-full bg-purple-50 p-3'>
              <TrendingDown className='text-purple-600' size={24} />
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Stok Menipis</p>
              <p className='text-2xl font-bold text-gray-900'>
                {lowStockItems}
              </p>
            </div>
            <div className='rounded-full bg-red-50 p-3'>
              <AlertTriangle className='text-red-600' size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems > 0 && (
        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
          <div className='flex items-center'>
            <AlertTriangle className='mr-3 text-yellow-600' size={20} />
            <div>
              <p className='text-sm font-medium text-yellow-800'>
                Peringatan: {lowStockItems} item memerlukan perhatian
              </p>
              <p className='mt-1 text-sm text-yellow-700'>
                Beberapa jenis sampah memiliki stok yang rendah atau kritis
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <div className='border-b border-gray-200 px-6 py-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Daftar Inventori
          </h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Jenis Sampah
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Kategori
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Stok Saat Ini
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Kapasitas
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Harga/kg
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Terakhir Update
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {inventoryItems.map((item) => (
                <tr key={item.id} className='hover:bg-gray-50'>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      {item.wasteType}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>{item.category}</div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      {item.currentStock} {item.unit}
                    </div>
                    <div className='mt-1 h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className={`h-2 rounded-full ${
                          item.status === 'critical'
                            ? 'bg-red-500'
                            : item.status === 'low'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{
                          width: `${(item.currentStock / item.maxCapacity) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {item.maxCapacity} {item.unit}
                    </div>
                    <div className='text-xs text-gray-500'>
                      Min: {item.minThreshold} {item.unit}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      Rp {item.pricePerKg.toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(item.status)}`}
                    >
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {new Date(item.lastUpdated).toLocaleDateString('id-ID')}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {new Date(item.lastUpdated).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className='space-x-2 whitespace-nowrap px-6 py-4 text-sm font-medium'>
                    <button className='text-emerald-600 hover:text-emerald-900'>
                      Update
                    </button>
                    <button className='text-blue-600 hover:text-blue-900'>
                      Detail
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
              Tambah Stok Manual
            </span>
          </button>
          <button className='flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50'>
            <Package className='text-blue-600' size={24} />
            <span className='font-medium text-blue-600'>Transfer ke Pusat</span>
          </button>
          <button className='flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-purple-300 p-4 transition-colors hover:border-purple-500 hover:bg-purple-50'>
            <AlertTriangle className='text-purple-600' size={24} />
            <span className='font-medium text-purple-600'>
              Laporan Inventori
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
