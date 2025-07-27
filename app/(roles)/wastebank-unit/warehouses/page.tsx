'use client';

import React, { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  TrendingDown,
  Loader2,
  Box,
  Warehouse,
  Edit,
  Eye,
} from 'lucide-react';
import {
  storageAPI,
  storageItemAPI,
  currentUserAPI,
} from '@/services/api/user';
import { wastePriceAPI } from '@/services/api/user';
import { showToast } from '@/components/ui';

// Interface untuk inventory item yang akan ditampilkan
interface InventoryItem {
  id: string;
  wasteType: string;
  category: string;
  currentStock: number;
  unit: string;
  minThreshold: number;
  maxCapacity: number;
  lastUpdated: string;
  pricePerKg: number;
  status: 'normal' | 'low' | 'critical';
  storageId: string;
  wasteTypeId: string;
  storageItemId: string;
  // Tambahan untuk storage info
  // storageName: string;
  storageUsagePercentage: number;
  totalStorageWeight: number;
}

export default function WarehousesPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data dari API
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Dapatkan user ID dari current user API
        const userResponse = await currentUserAPI.getCurrentUser();
        const userId = userResponse.data.id;

        if (!userId) {
          throw new Error('User tidak ditemukan. Silakan login ulang.');
        }

        // 2. Ambil daftar storage berdasarkan user ID
        const storagesResponse = await storageAPI.getStorages({
          user_id: userId,
          page: 1,
          size: 100,
        });

        if (!storagesResponse.data || storagesResponse.data.length === 0) {
          setInventoryItems([]);
          setLoading(false);
          return;
        }

        // 3. Untuk setiap storage, ambil storage items
        const allInventoryItems: InventoryItem[] = [];

        for (const storage of storagesResponse.data) {
          try {
            // Hitung kapasitas storage (volume storage)
            const storageVolume =
              storage.length * storage.width * storage.height; // dalam cubic unit
            const maxCapacity = storageVolume / 1000; // Asumsi 1000 cubic unit = 1 kg capacity
            const minThreshold = maxCapacity * 0.001; // 10% dari kapasitas maksimal

            // Ambil storage items berdasarkan storage_id
            const storageItemsResponse = await storageItemAPI.getStorageItems({
              storage_id: storage.id,
              page: 1,
              size: 100,
            });

            // Hitung total berat semua item di storage ini
            let totalStorageWeight = 0;
            const tempItems: typeof storageItemsResponse.data = [];

            if (
              storageItemsResponse.data &&
              storageItemsResponse.data.length > 0
            ) {
              // 4. Untuk setiap storage item, ambil detail lengkap
              for (const item of storageItemsResponse.data) {
                try {
                  const itemDetailResponse =
                    await storageItemAPI.getStorageItemById(item.id);
                  const itemDetail = itemDetailResponse.data;

                  totalStorageWeight += itemDetail.weight_kgs;
                  tempItems.push(itemDetail);
                } catch (itemError) {
                  console.error(
                    'Error fetching item detail:',
                    item.id,
                    itemError
                  );
                }
              }
            }

            // Hitung persentase penggunaan storage
            const storageUsagePercentage =
              maxCapacity > 0 ? (totalStorageWeight / maxCapacity) * 100 : 0;

            // 5. Setelah mendapat total weight, proses setiap item
            for (const itemDetail of tempItems) {
              try {
                // 6. Ambil harga dari waste price API
                let pricePerKg = 0;
                try {
                  const pricesResponse = await wastePriceAPI.getWastePrices({
                    page: 1,
                    size: 100,
                  });

                  const priceData = pricesResponse.data.find(
                    (price) => price.waste_type_id === itemDetail.waste_type_id
                  );
                  pricePerKg = priceData?.custom_price_per_kgs || 0;
                } catch (priceError) {
                  console.warn(
                    'Error fetching price for waste type:',
                    itemDetail.waste_type_id,
                    priceError
                  );
                }

                // 7. Tentukan status berdasarkan threshold STORAGE (bukan per item)
                let status: 'normal' | 'low' | 'critical' = 'normal';
                const remainingCapacity = maxCapacity - totalStorageWeight;

                if (remainingCapacity <= minThreshold * 0.5) {
                  status = 'critical'; // Storage hampir penuh
                } else if (remainingCapacity <= minThreshold) {
                  status = 'low'; // Storage mulai penuh
                }

                console.log('Item Detail:', itemDetail);

                // 8. Format data untuk tampilan
                const inventoryItem: InventoryItem = {
                  id: itemDetail.id,
                  wasteType: itemDetail.waste_type?.name || 'Unknown Type',
                  category:
                    itemDetail.waste_type?.waste_category?.name ||
                    'Unknown Category',
                  currentStock: itemDetail.weight_kgs,
                  unit: 'kg',
                  minThreshold,
                  maxCapacity,
                  lastUpdated: itemDetail.updated_at,
                  pricePerKg,
                  status,
                  storageId: storage.id,
                  wasteTypeId: itemDetail.waste_type_id,
                  storageItemId: itemDetail.id,
                  // Info storage
                  // storageName: storage.name || `Storage ${storage.id}`,
                  storageUsagePercentage: Math.min(storageUsagePercentage, 100),
                  totalStorageWeight,
                };

                allInventoryItems.push(inventoryItem);
              } catch (itemProcessError) {
                console.error(
                  'Error processing item:',
                  itemDetail.id,
                  itemProcessError
                );
              }
            }
          } catch (storageItemError) {
            console.error(
              'Error fetching storage items for storage:',
              storage.id,
              storageItemError
            );
          }
        }

        setInventoryItems(allInventoryItems);
      } catch (fetchError) {
        console.error('Error fetching inventory data:', fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Gagal memuat data inventori'
        );
        showToast.error('Gagal memuat data inventori');
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  // Hitung statistik
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

  // Loading state
  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex items-center gap-2 text-gray-600'>
          <Loader2 className='h-5 w-5 animate-spin' />
          <span>Memuat data inventori...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex flex-col items-center gap-2 text-red-600'>
          <AlertTriangle className='h-8 w-8' />
          <span>{error}</span>
          <button
            onClick={() => window.location.reload()}
            className='mt-2 rounded-lg bg-red-100 px-4 py-2 text-red-700 transition-colors hover:bg-red-200'
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='shadow-xs rounded-xl border border-zinc-200 bg-white p-4'>
            <Warehouse className='text-emerald-600' size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Inventori Lokal
            </h1>
            <p className='mt-1 text-gray-600'>
              Kelola stok sampah di gudang unit Anda
            </p>
          </div>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button className='flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'>
            <Plus size={20} />
            Tambah Stok
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className='my-6 grid grid-cols-1 gap-6 text-left md:grid-cols-4'>
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <Package className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Total Item
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {inventoryItems.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <Box className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Kapasitas Maksimum
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {inventoryItems.length > 0
                    ? inventoryItems[0].maxCapacity.toLocaleString('id-ID', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                    : 0}{' '}
                  kg
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <Package className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Total Saat Ini
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {totalWeight.toLocaleString('id-ID', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}{' '}
                  kg
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <TrendingDown className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Nilai Total
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  Rp {totalValue.toLocaleString('id-ID')}
                </dd>
              </dl>
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

      {/* Empty State */}
      {inventoryItems.length === 0 && (
        <div className='flex h-64 items-center justify-center'>
          <div className='text-center text-gray-500'>
            <Package className='mx-auto h-12 w-12 text-gray-300' />
            <p className='mt-2'>Belum ada data inventori</p>
            <p className='text-sm'>Tambahkan stok sampah untuk memulai</p>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      {inventoryItems.length > 0 && (
        <div className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'>
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
                {[...inventoryItems]
                  .sort((a, b) => b.currentStock - a.currentStock)
                  .map((item) => (
                    <tr key={item.id} className='hover:bg-gray-50'>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {item.wasteType}
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='text-sm text-gray-900'>
                          {item.category}
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <div className='text-sm font-medium text-gray-900'>
                              {item.currentStock.toLocaleString('id-ID', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              {item.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {item.pricePerKg > 0
                            ? `Rp ${item.pricePerKg.toLocaleString('id-ID')}`
                            : 'Belum ditentukan'}
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
                          {new Date(item.lastUpdated).toLocaleDateString(
                            'id-ID',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </div>
                      </td>
                      <td className='space-x-2 whitespace-nowrap px-6 py-4 text-sm font-medium'>
                        <button
                          className='text-emerald-600 hover:text-emerald-900'
                          title='Update'
                        >
                          <Edit className='h-4 w-4' />
                        </button>
                        <button
                          className='text-blue-600 hover:text-blue-900'
                          title='Detail'
                        >
                          <Eye className='h-4 w-4' />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
