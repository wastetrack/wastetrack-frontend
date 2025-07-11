'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, X, AlertCircle } from 'lucide-react';
import { wasteCategoryAPI, wasteTypeAPI } from '@/services/api/user';
import { wasteBankPriceAPI } from '@/services/api/wastebank/waste-price';
import { wasteBankProfileAPI } from '@/services/api/wastebank';
import { getTokenManager } from '@/lib/token-manager';
import { WasteCategory, WasteType } from '@/types';
import { showToast } from '@/components/ui/Toast';

interface WastePriceForm {
  category_id: string;
  waste_type_id: string;
  custom_price_per_kgs: number;
}

export default function AddPricesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [wasteTypesByCategory, setWasteTypesByCategory] = useState<
    Record<string, WasteType[]>
  >({});
  const [wasteBankId, setWasteBankId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for multiple waste prices
  const [wastePriceForms, setWastePriceForms] = useState<WastePriceForm[]>([
    {
      category_id: '',
      waste_type_id: '',
      custom_price_per_kgs: 0,
    },
  ]);

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

        const [categoriesResponse] = await Promise.all([
          wasteCategoryAPI.getWasteCategories({ page: 1, size: 100 }),
        ]);

        // Handle different possible API response structures
        let categoriesData: WasteCategory[] = [];

        // Try different possible response structures for categories
        if (
          categoriesResponse?.data?.items &&
          Array.isArray(categoriesResponse.data.items)
        ) {
          categoriesData = categoriesResponse.data.items;
        } else if (
          categoriesResponse?.data &&
          Array.isArray(categoriesResponse.data)
        ) {
          categoriesData = categoriesResponse.data;
        } else if (Array.isArray(categoriesResponse)) {
          categoriesData = categoriesResponse;
        }

        if (!Array.isArray(categoriesData)) {
          throw new Error('Invalid categories data received from API');
        }

        setCategories(categoriesData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to fetch data');
        } else {
          setError('Failed to fetch data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [wasteBankId]);

  // Fetch waste types when category is selected
  const fetchWasteTypesForCategory = async (categoryId: string) => {
    if (!categoryId || wasteTypesByCategory[categoryId]) return;

    try {
      // First, try to fetch waste types filtered by category_id from the backend
      const wasteTypesResponse = await wasteTypeAPI.getWasteTypes({
        category_id: categoryId,
        page: 1,
        size: 100,
      });

      let wasteTypesData: WasteType[] = [];

      if (
        wasteTypesResponse?.data?.items &&
        Array.isArray(wasteTypesResponse.data.items)
      ) {
        wasteTypesData = wasteTypesResponse.data.items;
      } else if (
        wasteTypesResponse?.data &&
        Array.isArray(wasteTypesResponse.data)
      ) {
        wasteTypesData = wasteTypesResponse.data;
      } else if (Array.isArray(wasteTypesResponse)) {
        wasteTypesData = wasteTypesResponse;
      }

      // Always apply client-side filtering as a safeguard
      // This ensures that even if the backend filtering fails, we only show relevant waste types
      const filteredWasteTypes = wasteTypesData.filter(
        (type) => type.category_id === categoryId
      );

      // Always set the result, even if it's an empty array
      setWasteTypesByCategory((prev) => ({
        ...prev,
        [categoryId]: filteredWasteTypes,
      }));
    } catch {
      // If the filtered API call fails, try fetching all waste types and filter client-side
      try {
        const allWasteTypesResponse = await wasteTypeAPI.getWasteTypes({
          page: 1,
          size: 500, // Increase limit to get more types
        });

        let allWasteTypesData: WasteType[] = [];

        if (
          allWasteTypesResponse?.data?.items &&
          Array.isArray(allWasteTypesResponse.data.items)
        ) {
          allWasteTypesData = allWasteTypesResponse.data.items;
        } else if (
          allWasteTypesResponse?.data &&
          Array.isArray(allWasteTypesResponse.data)
        ) {
          allWasteTypesData = allWasteTypesResponse.data;
        } else if (Array.isArray(allWasteTypesResponse)) {
          allWasteTypesData = allWasteTypesResponse;
        }

        // Filter client-side by category_id
        const filteredWasteTypes = allWasteTypesData.filter(
          (type) => type.category_id === categoryId
        );

        // Always set the result, even if it's an empty array
        setWasteTypesByCategory((prev) => ({
          ...prev,
          [categoryId]: filteredWasteTypes,
        }));
      } catch {
        // If both attempts fail, set empty array so UI shows "no waste types available"
        setWasteTypesByCategory((prev) => ({
          ...prev,
          [categoryId]: [],
        }));
        showToast.warning('Gagal memuat jenis sampah', {
          description:
            'Tidak dapat memuat data jenis sampah untuk kategori yang dipilih',
        });
      }
    }
  };

  const addNewForm = () => {
    setWastePriceForms([
      ...wastePriceForms,
      {
        category_id: '',
        waste_type_id: '',
        custom_price_per_kgs: 0,
      },
    ]);
  };

  const removeForm = (index: number) => {
    if (wastePriceForms.length > 1) {
      const newForms = wastePriceForms.filter((_, i) => i !== index);
      setWastePriceForms(newForms);
    }
  };

  const updateForm = (
    index: number,
    field: keyof WastePriceForm,
    value: string | number
  ) => {
    const newForms = [...wastePriceForms];
    if (field === 'custom_price_per_kgs') {
      newForms[index][field] = Number(value);
    } else {
      newForms[index][field] = value as string;
    }
    setWastePriceForms(newForms);

    // If category is changed, fetch waste types for that category
    if (field === 'category_id' && value) {
      fetchWasteTypesForCategory(value as string);
      // Reset waste type selection when category changes
      newForms[index].waste_type_id = '';
      setWastePriceForms([...newForms]);
    }
  };

  const validateForms = (): string | null => {
    for (let i = 0; i < wastePriceForms.length; i++) {
      const form = wastePriceForms[i];
      if (!form.category_id) {
        return `Form ${i + 1}: Please select a category`;
      }

      // Check if the selected category has waste types available
      const availableWasteTypes = wasteTypesByCategory[form.category_id];
      if (availableWasteTypes && availableWasteTypes.length === 0) {
        return `Form ${i + 1}: The selected category has no waste types available`;
      }

      if (!form.waste_type_id) {
        return `Form ${i + 1}: Please select a waste type`;
      }
      if (form.custom_price_per_kgs <= 0) {
        return `Form ${i + 1}: Price must be greater than 0`;
      }
    }

    // Check for duplicate waste type selections
    const wasteTypeIds = wastePriceForms.map((form) => form.waste_type_id);
    const duplicates = wasteTypeIds.filter(
      (id, index) => wasteTypeIds.indexOf(id) !== index
    );
    if (duplicates.length > 0) {
      return 'Duplicate waste types are not allowed';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteBankId) return;

    const validationError = validateForms();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const requestData = wastePriceForms.map((form) => ({
        waste_type_id: form.waste_type_id,
        custom_price_per_kgs: form.custom_price_per_kgs,
        waste_bank_id: wasteBankId,
      }));

      await wasteBankPriceAPI.batchCreateWasteBankPrices(requestData);

      showToast.success('Harga sampah berhasil ditambahkan!', {
        description: 'Data harga sampah telah disimpan ke sistem',
      });

      setTimeout(() => {
        router.push('/wastebank-central/prices');
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        showToast.error('Gagal menambahkan harga sampah', {
          description: err.message,
        });
      } else {
        showToast.error('Gagal menambahkan harga sampah', {
          description: 'Terjadi kesalahan yang tidak diketahui',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='text-lg text-gray-600'>Loading...</div>
          <div className='mt-2 text-sm text-gray-500'>Loading form data...</div>
        </div>
      </div>
    );
  }

  if (error && !categories.length) {
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

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='shadow-xs rounded-xl border border-zinc-200 bg-white p-4'>
            <Plus className='text-emerald-600' size={28} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Tambah Harga Sampah
            </h1>
            <p className='mt-1 text-gray-600'>
              Tambahkan harga untuk jenis sampah berdasarkan kategori yang sudah
              ada
            </p>
          </div>
        </div>
        <div className='mt-4 sm:mt-0'>
          <button
            onClick={() => router.back()}
            className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'
          >
            <ArrowLeft size={20} className='mr-2 inline' />
            Kembali
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
          <div className='flex items-center'>
            <AlertCircle className='h-5 w-5 text-red-600' />
            <div className='ml-3'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className='ml-auto text-red-600 hover:text-red-800'
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Waste Price Forms */}
        <div className='space-y-4'>
          {wastePriceForms.map((form, index) => (
            <div
              key={index}
              className='rounded-lg border border-gray-200 bg-white p-6'
            >
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Harga Sampah #{index + 1}
                </h3>
                {wastePriceForms.length > 1 && (
                  <button
                    type='button'
                    onClick={() => removeForm(index)}
                    className='text-red-600 hover:text-red-800'
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Kategori Sampah
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      updateForm(index, 'category_id', e.target.value)
                    }
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                    required
                  >
                    <option value=''>Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Jenis Sampah
                  </label>
                  <select
                    value={form.waste_type_id}
                    onChange={(e) =>
                      updateForm(index, 'waste_type_id', e.target.value)
                    }
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                    required
                    disabled={!form.category_id}
                  >
                    <option value=''>
                      {!form.category_id
                        ? 'Pilih kategori terlebih dahulu'
                        : 'Pilih jenis sampah'}
                    </option>
                    {form.category_id &&
                      wasteTypesByCategory[form.category_id] && (
                        <>
                          {wasteTypesByCategory[form.category_id].length > 0 ? (
                            wasteTypesByCategory[form.category_id].map(
                              (type) => (
                                <option key={type.id} value={type.id}>
                                  {type.name}
                                </option>
                              )
                            )
                          ) : (
                            <option value='' disabled>
                              - (Tidak ada jenis sampah untuk kategori ini)
                            </option>
                          )}
                        </>
                      )}
                  </select>
                  {form.category_id &&
                    !wasteTypesByCategory[form.category_id] && (
                      <p className='mt-1 text-xs text-gray-500'>
                        Loading waste types...
                      </p>
                    )}
                  {form.category_id &&
                    wasteTypesByCategory[form.category_id] &&
                    wasteTypesByCategory[form.category_id].length === 0 && (
                      <p className='mt-1 text-xs text-amber-600'>
                        Tidak ada jenis sampah yang tersedia untuk kategori ini
                      </p>
                    )}
                </div>
              </div>

              <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-700'>
                    Harga per Kg
                  </label>
                  <input
                    type='number'
                    value={form.custom_price_per_kgs || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateForm(
                        index,
                        'custom_price_per_kgs',
                        value === '' ? 0 : Number(value)
                      );
                    }}
                    onFocus={(e) => {
                      // Select all text when focused so user can easily replace
                      e.target.select();
                    }}
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                    placeholder='Masukkan harga per kg'
                    min='0'
                    required
                  />
                  {form.custom_price_per_kgs > 0 && (
                    <p className='mt-1 text-xs text-gray-500'>
                      {formatCurrency(form.custom_price_per_kgs)} per kg
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add More Button */}
        <div className='text-center'>
          <button
            type='button'
            onClick={addNewForm}
            className='rounded-lg border border-emerald-600 px-4 py-2 text-emerald-600 transition-colors hover:bg-emerald-50'
          >
            <Plus size={20} className='mr-2 inline' />
            Tambah Jenis Sampah Lain
          </button>
        </div>

        {/* Submit Buttons */}
        <div className='flex flex-col gap-4 sm:flex-row sm:justify-end'>
          <button
            type='button'
            onClick={() => router.back()}
            className='rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50'
          >
            Batal
          </button>
          <button
            type='submit'
            disabled={submitting}
            className='rounded-lg bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-400'
          >
            <Save size={20} className='mr-2 inline' />
            {submitting ? 'Menyimpan...' : 'Simpan Harga'}
          </button>
        </div>
      </form>
    </div>
  );
}
