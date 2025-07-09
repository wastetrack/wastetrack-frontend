'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Package,
  TrendingUp,
  Check,
  X,
} from 'lucide-react';
import {
  wasteCategoryAPI,
  wasteTypeAPI,
  wastePriceAPI,
} from '@/services/api/user';
import { wasteBankProfileAPI } from '@/services/api/wastebank';
import { wasteBankPriceAPI } from '@/services/api/wastebank/waste-price';
import { getTokenManager } from '@/lib/token-manager';
import { WasteCategory } from '@/types';
import { showToast } from '@/components/ui/Toast';
import { Alert } from '@/components/ui/Alert';

interface CombinedWasteData {
  id: string;
  category: string;
  type: string;
  price: number | null;
  unit: string;
  lastUpdated: string | null;
  waste_type_id: string;
  category_id: string;
  price_id?: string;
}

export default function PricesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wastePrices, setWastePrices] = useState<CombinedWasteData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [categories, setCategories] = useState<WasteCategory[]>([]); // Used in fetchData
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wasteBankId, setWasteBankId] = useState<string | null>(null);

  // Edit state management
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete state management
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when needed

  const getUserId = (): string | null => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          return user.id || user.user_id || null;
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchWasteBankProfile = async () => {
      try {
        const userId = getUserId();

        if (!userId) {
          throw new Error('User ID not found. Please login again.');
        }

        const profileResponse = await wasteBankProfileAPI.getProfile(userId);

        const wasteBankIdForPrices = profileResponse.data.user_id || userId;

        setWasteBankId(wasteBankIdForPrices);
      } catch {
        setError('Failed to load waste bank profile. Please login again.');
        setLoading(false);
      }
    };

    fetchWasteBankProfile();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!wasteBankId) return;

      try {
        setLoading(true);
        setError(null);

        const tokenManager = getTokenManager();
        const validToken = await tokenManager.getValidAccessToken();

        if (!validToken) {
          setError(
            'Authentication token is invalid or expired. Please login again.'
          );
          setLoading(false);
          return;
        }

        const [categoriesResponse, typesResponse] = await Promise.all([
          wasteCategoryAPI.getWasteCategories({ page: 1, size: 100 }),
          wasteTypeAPI.getWasteTypes({ page: 1, size: 100 }),
        ]);

        const categoriesData = categoriesResponse?.data?.items || [];
        const typesData = typesResponse?.data?.items || [];

        const pricesResponse = await wastePriceAPI.getWastePrices({
          waste_bank_id: wasteBankId,
          page: 1,
          size: 100,
        });

        const pricesData = Array.isArray(pricesResponse?.data)
          ? pricesResponse.data
          : [];

        if (!Array.isArray(categoriesData)) {
          throw new Error('Invalid categories data received from API');
        }

        if (!Array.isArray(typesData)) {
          throw new Error('Invalid waste types data received from API');
        }

        if (!Array.isArray(pricesData)) {
          throw new Error('Invalid prices data received from API');
        }

        const combinedData: CombinedWasteData[] = pricesData.map(
          (priceItem) => {
            const nestedWasteType = priceItem.waste_type;
            const wasteTypeFromList = typesData.find(
              (type) => type.id === priceItem.waste_type_id
            );

            const typeName = wasteTypeFromList?.name || nestedWasteType?.name;

            const categoryIdFromList = wasteTypeFromList?.category_id;
            const categoryIdFromNested = nestedWasteType?.category_id;

            let categoryId = categoryIdFromList || categoryIdFromNested;

            if (
              !categoryId ||
              categoryId === '00000000-0000-0000-0000-000000000000'
            ) {
              categoryId = undefined;
            }

            let categoryName: string | null = null;

            const nestedCategory = nestedWasteType?.waste_category;
            if (nestedCategory?.name && nestedCategory.name.trim() !== '') {
              categoryName = nestedCategory.name;
            } else {
              if (
                categoryId &&
                categoryId !== '00000000-0000-0000-0000-000000000000'
              ) {
                const foundCategory = categoriesData.find(
                  (cat) => cat.id === categoryId
                );

                if (foundCategory) {
                  categoryName = foundCategory.name;
                } else {
                  const partialMatch = categoriesData.find(
                    (cat) =>
                      cat.id.substring(0, 8) === categoryId.substring(0, 8)
                  );
                  if (partialMatch) {
                    categoryName = partialMatch.name;
                  }
                }
              }
            }

            return {
              id: priceItem.id,
              category: categoryName || 'Unknown Category',
              type: typeName || 'Unknown Type',
              price: priceItem.custom_price_per_kgs || null,
              unit: 'kg',
              lastUpdated: priceItem.updated_at || null,
              waste_type_id: priceItem.waste_type_id,
              category_id: categoryId || '',
              price_id: priceItem.id,
            };
          }
        );

        setWastePrices(combinedData);
        setCategories(categoriesData);
      } catch (err) {
        if (err instanceof Error) {
          if (
            err.message.includes('Authentication') ||
            err.message.includes('token')
          ) {
            setError('Authentication error: Please login again.');
          } else {
            setError(err.message || 'Failed to fetch data');
          }
        } else {
          setError('Failed to fetch data');
        }

        setWastePrices([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [wasteBankId]);

  const filteredPrices = wastePrices.filter(
    (item) =>
      (selectedCategory === 'all' || item.category === selectedCategory) &&
      (item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get unique categories from the actual waste prices data
  const availableCategories = Array.from(
    new Set(wastePrices.map((item) => item.category))
  )
    .filter((category) => category && category !== 'Unknown Category')
    .sort();

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddPrice = () => {
    router.push('/wastebank-unit/prices/add');
  };

  const handleEditPrice = (item: CombinedWasteData) => {
    setEditingId(item.id);
    setEditPrice(item.price || 0);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPrice(0);
  };

  const handleSaveEdit = async () => {
    if (!editingId || editPrice <= 0) {
      showToast.error('Harga tidak valid', {
        description: 'Harga harus lebih besar dari 0',
      });
      return;
    }

    setIsUpdating(true);

    try {
      await wasteBankPriceAPI.updateWasteBankPrice(editingId, {
        custom_price_per_kgs: editPrice,
      });

      // Update the local state
      setWastePrices((prevPrices) =>
        prevPrices.map((price) =>
          price.id === editingId
            ? {
                ...price,
                price: editPrice,
                lastUpdated: new Date().toISOString(),
              }
            : price
        )
      );

      showToast.success('Harga berhasil diperbarui!', {
        description: 'Perubahan harga telah disimpan ke sistem',
      });

      setEditingId(null);
      setEditPrice(0);
    } catch (err) {
      if (err instanceof Error) {
        showToast.error('Gagal memperbarui harga', {
          description: err.message,
        });
      } else {
        showToast.error('Gagal memperbarui harga', {
          description: 'Terjadi kesalahan yang tidak diketahui',
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePrice = async (item: CombinedWasteData) => {
    if (!item.price_id) {
      showToast.error('Error', {
        description: 'ID harga tidak ditemukan',
      });
      return;
    }

    const result = await Alert.confirm({
      title: 'Konfirmasi Hapus Harga',
      html: `
        <div>
          <p>Apakah Anda yakin ingin menghapus harga untuk <strong>${item.type}</strong> dalam kategori <strong>${item.category}</strong>?</p>
        </div>
      `,
      confirmButtonText: 'Ya, Hapus',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      setDeletingId(item.id);

      try {
        await wasteBankPriceAPI.deleteWasteBankPrice(item.price_id);

        // Update the local state immediately - set price to null and remove price_id
        setWastePrices((prevPrices) => {
          const updatedPrices = prevPrices.map((price) =>
            price.id === item.id
              ? {
                  ...price,
                  price: null,
                  lastUpdated: null,
                  price_id: undefined,
                }
              : price
          );
          console.log(
            'Updated prices after delete:',
            updatedPrices.find((p) => p.id === item.id)
          );
          return updatedPrices;
        });

        // Force a re-render to ensure UI updates
        setRefreshKey((prev) => prev + 1);

        showToast.success('Harga berhasil dihapus!', {
          description: 'Harga untuk jenis sampah ini telah dihapus dari sistem',
        });
      } catch (err) {
        if (err instanceof Error) {
          showToast.error('Gagal menghapus harga', {
            description: err.message,
          });
        } else {
          showToast.error('Gagal menghapus harga', {
            description: 'Terjadi kesalahan yang tidak diketahui',
          });
        }
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='text-lg text-gray-600'>Loading...</div>
          <div className='mt-2 text-sm text-gray-500'>
            {!wasteBankId
              ? 'Getting waste bank profile...'
              : 'Loading waste price data...'}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='text-lg text-red-600'>{error}</div>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700'
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!wasteBankId) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='text-lg text-gray-600'>
            Waste bank profile not found
          </div>
          <div className='mt-2 text-sm text-gray-500'>
            Please ensure you have a valid waste bank profile.
          </div>
          <div className='mt-4'>
            <button
              onClick={() => window.location.reload()}
              className='rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700'
            >
              Retry
            </button>
          </div>
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
            <DollarSign className='text-emerald-600' size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Manajemen Harga Sampah
            </h1>
            <p className='mt-1 text-gray-600'>
              Kelola harga sampah per jenis dan kategori
            </p>
          </div>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button
            onClick={handleAddPrice}
            className='rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'
          >
            <Plus size={20} className='mr-2 inline' />
            Tambah Harga
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='my-6 grid grid-cols-1 gap-6 text-left md:grid-cols-3'>
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
                  Total Jenis Sampah
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {filteredPrices.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <DollarSign className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Rata-rata Harga
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {filteredPrices.length > 0 &&
                  filteredPrices.filter((item) => item.price !== null).length >
                    0
                    ? formatCurrency(
                        filteredPrices
                          .filter((item) => item.price !== null)
                          .reduce((sum, item) => sum + (item.price || 0), 0) /
                          filteredPrices.filter((item) => item.price !== null)
                            .length
                      )
                    : 'Rp 0'}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white'>
                <TrendingUp className='h-5 w-5' />
              </div>
            </div>
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='truncate text-sm font-medium text-gray-500'>
                  Harga Tertinggi
                </dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {filteredPrices.length > 0 &&
                  filteredPrices.filter((item) => item.price !== null).length >
                    0
                    ? formatCurrency(
                        Math.max(
                          ...filteredPrices
                            .filter((item) => item.price !== null)
                            .map((item) => item.price || 0)
                        )
                      )
                    : 'Rp 0'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='shadow-xs flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder='Cari jenis & kategori sampah...'
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
          {availableCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Prices Table */}
      <div
        key={refreshKey}
        className='shadow-xs overflow-hidden rounded-lg border border-gray-200 bg-white'
      >
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead>
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
                      {editingId === item.id ? (
                        <div className='flex items-center space-x-2'>
                          <input
                            type='number'
                            value={editPrice || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Handle empty input
                              if (value === '') {
                                setEditPrice(0);
                                return;
                              }
                              // Convert to number to remove leading zeros
                              const numValue = Number(value);
                              setEditPrice(numValue);
                            }}
                            onFocus={(e) => {
                              // Select all text when focused so user can easily replace
                              e.target.select();
                            }}
                            className='w-32 rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                            placeholder='Masukkan harga per kg'
                            min='0'
                            step='1'
                          />
                          <span className='text-sm text-gray-600'>per kg</span>
                        </div>
                      ) : (
                        <>
                          <div className='text-sm font-medium text-gray-900'>
                            {formatCurrency(item.price)}
                          </div>
                          <div className='text-sm text-gray-600'>
                            {item.price ? `per ${item.unit}` : '-'}
                          </div>
                        </>
                      )}
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                      {item.lastUpdated
                        ? new Date(item.lastUpdated).toLocaleDateString('id-ID')
                        : '-'}
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-right text-sm font-medium'>
                      <div className='flex justify-end gap-2'>
                        {editingId === item.id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              disabled={isUpdating}
                              className='text-emerald-600 hover:text-emerald-900 disabled:opacity-50'
                              title='Save Changes'
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              className='text-gray-600 hover:text-gray-900 disabled:opacity-50'
                              title='Cancel Edit'
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : item.price ? (
                          <>
                            <button
                              onClick={() => handleEditPrice(item)}
                              className='text-indigo-600 hover:text-indigo-900'
                              title='Edit Price'
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeletePrice(item)}
                              disabled={deletingId === item.id}
                              className='text-red-600 hover:text-red-900 disabled:opacity-50'
                              title='Delete Price'
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            className='text-emerald-600 hover:text-emerald-900'
                            title='Add Price'
                          >
                            <Plus size={16} />
                          </button>
                        )}
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
