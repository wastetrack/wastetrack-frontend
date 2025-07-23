'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Plus,
  Building2,
  Package,
  Save,
  X,
} from 'lucide-react';
import { wasteBankTransferRequestAPI } from '@/services/api/wastebank';
import { userListAPI, wastePriceAPI } from '@/services/api/user';
import {
  wasteTypeAPI,
  currentUserAPI,
  storageAPI,
  storageItemAPI,
} from '@/services/api/user';
import { showToast } from '@/components/ui';
import type { CreateWasteTransferRequestParams, UserListItem } from '@/types';

interface WasteItem {
  waste_type_id: string;
  waste_type_name: string;
  offering_weight: number;
  offering_price_per_kg: number;
  original_price: number;
  max_available_weight?: number; // Tambahan untuk validasi
}

interface FormData {
  form_type: 'waste_bank_request' | 'industry_request';
  destination_user_id: string;
  source_phone_number: string;
  destination_phone_number: string;
  image_url: string;
  appointment_location: {
    latitude: number;
    longitude: number;
  };
  appointment_date: string;
  appointment_start_time: string;
  appointment_end_time: string;
  notes: string;
  items: WasteItem[];
}

export default function AddTransactionOutPage() {
  // State for current user's address, city, and province
  const [sourceUserAddress, setSourceUserAddress] = useState<string>('');
  const [sourceUserCity, setSourceUserCity] = useState<string>('');
  const [sourceUserProvince, setSourceUserProvince] = useState<string>('');
  const [, setSourcePhoneNumber] = useState<string>('');

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [success, setSuccess] = useState(false);

  // User data
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [destinationUsers, setDestinationUsers] = useState<UserListItem[]>([]);
  const [availableWasteTypes, setAvailableWasteTypes] = useState<WasteItem[]>(
    []
  );

  // Destination search states
  const [destinationInput, setDestinationInput] = useState('');
  const [showDestinationSuggestions, setShowDestinationSuggestions] =
    useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState<
    UserListItem[]
  >([]);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    form_type: 'waste_bank_request',
    destination_user_id: '',
    source_phone_number: '',
    destination_phone_number: '',
    image_url: '',
    appointment_location: {
      latitude: -6.2,
      longitude: 106.816666,
    },
    appointment_date: '',
    appointment_start_time: '09:00',
    appointment_end_time: '11:00',
    notes: '',
    items: [],
  });

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (formData.form_type) {
      fetchDestinationUsers();
    }
  }, [formData.form_type]);

  // UseEffect khusus untuk fetchAvailableWasteTypes ketika currentUserId berubah
  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    if (currentUserId.length < 10) {
      return;
    }

    fetchAvailableWasteTypes();
  }, [currentUserId]);

  // Fetch current user address, city, and province when currentUserId changes
  useEffect(() => {
    if (!currentUserId) return;
    const fetchUserData = async () => {
      try {
        // Fetch all users with a large enough size to include the current user
        const res = await userListAPI.getFlatUserList({ size: 100 });
        // console.log('👤 User list API response:', res);

        if (res && res.data && Array.isArray(res.data)) {
          const user = res.data.find(
            (u: UserListItem) => u.id === currentUserId
          );
          if (user) {
            setSourcePhoneNumber(user.phone_number || '');
            setSourceUserAddress(user.address || '');
            setSourceUserCity(user.city || '');
            setSourceUserProvince(user.province || '');

            setFormData((prev) => ({
              ...prev,
              source_phone_number: user.phone_number || '',
            }));
          } else {
            setSourcePhoneNumber('');
            setSourceUserAddress('');
            setSourceUserCity('');
            setSourceUserProvince('');
          }
        }
      } catch {
        setSourcePhoneNumber('');
        setSourceUserAddress('');
        setSourceUserCity('');
        setSourceUserProvince('');
      }
    };
    fetchUserData();
  }, [currentUserId]);

  const initializeData = async () => {
    setInitialLoading(true);

    try {
      const userId = await currentUserAPI.getUserId();
      setCurrentUserId(userId || '');
      const today = new Date().toISOString().split('T')[0];
      setFormData((prev) => ({
        ...prev,
        appointment_date: today,
      }));
    } catch {
      setError('Gagal memuat data awal');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchAvailableWasteTypes = async () => {
    if (!currentUserId || currentUserId.length < 10) {
      setAvailableWasteTypes([]);
      return;
    }

    try {
      const storagesRes = await storageAPI.getStorages({
        user_id: currentUserId,
      });

      if (
        !storagesRes?.data ||
        !Array.isArray(storagesRes.data) ||
        storagesRes.data.length === 0
      ) {
        setAvailableWasteTypes([]);
        return;
      }

      const storageId = storagesRes.data[0].id;

      const storageItemsRes = await storageItemAPI.getStorageItems({
        storage_id: storageId,
        size: 50,
      });

      if (
        !storageItemsRes?.data ||
        !Array.isArray(storageItemsRes.data) ||
        storageItemsRes.data.length === 0
      ) {
        setAvailableWasteTypes([]);
        return;
      }
      // STEP 3: Process each storage item to get waste type name and price

      const wasteItems: WasteItem[] = await Promise.all(
        storageItemsRes.data.map(async (storageItem) => {
          // Get waste type name
          let wasteTypeName = '';
          try {
            const wasteTypeDetail = await wasteTypeAPI.getWasteTypeById(
              storageItem.waste_type_id
            );

            if (wasteTypeDetail?.data?.name) {
              wasteTypeName = wasteTypeDetail.data.name;
            } else {
              wasteTypeName = `Unknown Type (${storageItem.waste_type_id})`;
            }
          } catch (error) {
            console.error(' Error fetching waste type name:', error);
            wasteTypeName = `Error Loading (${storageItem.waste_type_id})`;
          }

          // Get price from waste price API
          let pricePerKg = 0;
          try {
            const priceRes = await wastePriceAPI.getWastePrices({
              waste_bank_id: currentUserId,
              waste_type_id: storageItem.waste_type_id,
              page: 1,
              size: 10,
            });

            if (Array.isArray(priceRes?.data) && priceRes.data.length > 0) {
              pricePerKg = priceRes.data[0].custom_price_per_kgs || 0;
            } else {
              pricePerKg = 0; // Default price
            }
          } catch (error) {
            console.error('Error fetching price:', error);
            pricePerKg = 0; // Default price
          }

          const wasteItem = {
            waste_type_id: storageItem.waste_type_id,
            waste_type_name: wasteTypeName,
            offering_weight: 0, // User akan input ini
            offering_price_per_kg: pricePerKg,
            original_price: pricePerKg,
            max_available_weight: storageItem.weight_kgs || 0,
          };
          return wasteItem;
        })
      );

      // Filter out items with no weight available
      const validWasteItems = wasteItems.filter(
        (item) => (item.max_available_weight || 0) > 0
      );

      if (validWasteItems.length === 0) {
        setError(
          'Semua storage items memiliki berat 0. Silakan tambahkan berat ke storage items Anda.'
        );
        setAvailableWasteTypes([]);
        return;
      }

      setAvailableWasteTypes(validWasteItems);
    } catch {
      setError(`Gagal memuat tipe sampah:`);
      setAvailableWasteTypes([]);
    }
  };

  const fetchDestinationUsers = async () => {
    try {
      setDestinationUsers([]);

      if (!currentUserId) {
        // Tunggu currentUserId tersedia sebelum fetch
        return;
      }

      if (formData.form_type === 'waste_bank_request') {
        const [unitsResponse, centralsResponse] = await Promise.all([
          userListAPI.getFlatUserList({
            role: 'waste_bank_unit',
            size: 50,
          }),
          userListAPI.getFlatUserList({
            role: 'waste_bank_central',
            size: 50,
          }),
        ]);

        const unitUsers = unitsResponse?.data || [];
        const centralUsers = centralsResponse?.data || [];

        // Exclude current user from the list
        const allUsers = [...unitUsers, ...centralUsers].filter(
          (user) => user.id !== currentUserId
        );
        setDestinationUsers(allUsers);
        setFilteredDestinations(allUsers); // agar suggestions langsung muncul
      } else {
        // For industry requests
        const response = await userListAPI.getFlatUserList({
          role: 'industry',
          size: 50,
        });
        setDestinationUsers(response?.data || []);
        setFilteredDestinations(response?.data || []);
      }
    } catch (error) {
      console.error('Error fetching destination users:', error);
      setError('Gagal memuat daftar tujuan');
      setDestinationUsers([]);
      setFilteredDestinations([]);
    }
  };

  // Tambahkan useEffect agar fetchDestinationUsers dipanggil ketika currentUserId sudah ada
  useEffect(() => {
    if (currentUserId && formData.form_type) {
      fetchDestinationUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, formData.form_type]);

  const handleDestinationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setDestinationInput(value);

    if (value.trim() === '') {
      setFilteredDestinations(destinationUsers);
      setShowDestinationSuggestions(false);
      setFormData((prev) => ({
        ...prev,
        destination_user_id: '',
        destination_phone_number: '',
      }));
    } else {
      setDestinationLoading(true);
      setShowDestinationSuggestions(true);
      const filtered = destinationUsers.filter(
        (user) =>
          user.institution.toLowerCase().includes(value.toLowerCase()) ||
          user.city.toLowerCase().includes(value.toLowerCase()) ||
          user.province.toLowerCase().includes(value.toLowerCase())
      );

      setFilteredDestinations(filtered);
      setDestinationLoading(false);
    }
  };

  const handleDestinationSelect = (user: UserListItem) => {
    setDestinationInput(user.institution);
    setShowDestinationSuggestions(false);
    setFormData((prev) => ({
      ...prev,
      destination_user_id: user.id,
      destination_phone_number: user.phone_number || '',
    }));
  };

  const handleDestinationFocus = () => {
    if (destinationInput.trim()) {
      setShowDestinationSuggestions(true);
    }
  };

  const handleDestinationBlur = () => {
    setTimeout(() => {
      setShowDestinationSuggestions(false);
    }, 200);
  };

  const handleFormTypeChange = (
    type: 'waste_bank_request' | 'industry_request'
  ) => {
    setFormData((prev) => ({
      ...prev,
      form_type: type,
      destination_user_id: '',
      destination_phone_number: '',
    }));
    setDestinationInput('');
    setFilteredDestinations([]);
    setShowDestinationSuggestions(false);
  };

  const addWasteItem = () => {
    if (availableWasteTypes.length === 0) {
      setError('Tidak ada tipe sampah yang tersedia');
      return;
    }

    const firstAvailable = availableWasteTypes[0];
    const newItem: WasteItem = {
      waste_type_id: firstAvailable.waste_type_id,
      waste_type_name: firstAvailable.waste_type_name,
      offering_weight: Math.min(1, firstAvailable.max_available_weight || 1), // Tidak boleh melebihi max
      offering_price_per_kg: firstAvailable.original_price,
      original_price: firstAvailable.original_price,
      max_available_weight: firstAvailable.max_available_weight,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeWasteItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateWasteItem = (
    index: number,
    field: keyof WasteItem,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          if (field === 'waste_type_id') {
            // When waste type changes, update name and reset price to original
            const selectedType = availableWasteTypes.find(
              (wt) => wt.waste_type_id === value
            );
            return {
              ...item,
              waste_type_id: value as string,
              waste_type_name: selectedType?.waste_type_name || '',
              offering_price_per_kg: selectedType?.original_price || 0,
              original_price: selectedType?.original_price || 0,
              max_available_weight: selectedType?.max_available_weight || 0,
              offering_weight: Math.min(
                item.offering_weight,
                selectedType?.max_available_weight || 0
              ),
            };
          }

          if (field === 'offering_weight') {
            // Validasi: tidak boleh melebihi max available weight
            const maxWeight = item.max_available_weight || 0;
            const newWeight = Math.min(Number(value), maxWeight);

            if (Number(value) > maxWeight) {
              setError(
                `Berat tidak boleh melebihi ${maxWeight} kg (berat tersedia di storage)`
              );
              setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
            }

            return { ...item, [field]: newWeight };
          }

          return { ...item, [field]: value };
        }
        return item;
      }),
    }));
  };

  const validateFormItems = () => {
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (item.offering_weight > (item.max_available_weight || 0)) {
        setError(
          `Item #${i + 1}: Berat (${item.offering_weight} kg) melebihi berat tersedia (${item.max_available_weight} kg)`
        );
        return false;
      }
      if (item.offering_weight <= 0) {
        setError(`Item #${i + 1}: Berat harus lebih dari 0`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      setError('Minimal harus ada satu item sampah');
      showToast.error('Minimal harus ada satu item sampah');
      return;
    }

    if (!formData.destination_user_id) {
      setError('Pilih tujuan terlebih dahulu');
      showToast.error('Pilih tujuan terlebih dahulu');
      return;
    }

    if (!currentUserId) {
      setError('User ID tidak ditemukan');
      showToast.error('User ID tidak ditemukan');
      return;
    }

    // Validasi items
    if (!validateFormItems()) {
      // validateFormItems sudah setError, tampilkan juga toast
      showToast.error('Validasi item gagal');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: CreateWasteTransferRequestParams = {
        source_user_id: currentUserId,
        destination_user_id: formData.destination_user_id,
        form_type: formData.form_type,
        source_phone_number: formData.source_phone_number,
        destination_phone_number: formData.destination_phone_number,
        image_url: formData.image_url || '',
        appointment_location: formData.appointment_location,
        appointment_date: formData.appointment_date,
        appointment_start_time: `${formData.appointment_start_time}:00+07:00`,
        appointment_end_time: `${formData.appointment_end_time}:00+07:00`,
        notes: formData.notes || '',
        items: {
          waste_type_ids: formData.items.map((item) => item.waste_type_id),
          offering_weights: formData.items.map((item) => item.offering_weight),
          offering_prices_per_kgs: formData.items.map(
            (item) => item.offering_price_per_kg
          ),
        },
      };

      await wasteBankTransferRequestAPI.createWasteTransferRequest(payload);
      // setSuccess(true);
      showToast.success('Transaksi berhasil dibuat!');

      // Redirect after success
      setTimeout(() => {
        router.push('/wastebank-unit/transactions/out');
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error);
      const errMsg =
        error instanceof Error ? error.message : 'Gagal membuat transaksi';
      setError(errMsg);
      showToast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return (
        total +
        Number(item.offering_weight) * Number(item.offering_price_per_kg)
      );
    }, 0);
  };

  // Helper function to format complete address
  const getFormattedAddress = () => {
    const addressParts = [sourceUserAddress, sourceUserCity, sourceUserProvince]
      .filter(Boolean)
      .join(', ');
    return addressParts || 'Alamat tidak ditemukan';
  };

  if (initialLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='flex items-center gap-2 text-gray-600'>
          <Loader2 className='h-5 w-5 animate-spin' />
          <span>Memuat data...</span>
        </div>
      </div>
    );
  }

  // if (success) {
  //   return (
  //     <div className='flex h-64 items-center justify-center'>
  //       <div className='text-center text-green-600'>
  //         <CheckCircle className='mx-auto h-12 w-12' />
  //         <p className='mt-2 text-lg font-medium'>Transaksi berhasil dibuat!</p>
  //         <p className='text-sm'>Mengalihkan ke halaman transaksi...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className='space-y-6 font-poppins'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <button
          onClick={() => router.back()}
          className='flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-50'
        >
          <ArrowLeft className='h-5 w-5 text-gray-600' />
        </button>
        <div className='shadow-xs rounded-xl border border-zinc-200 bg-white p-4'>
          <Plus className='text-emerald-600' size={28} />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Buat Transaksi Keluar
          </h1>
          <p className='mt-1 text-gray-600'>Tambahkan transaksi keluar baru</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
          <div className='flex items-center gap-2 text-red-600'>
            <AlertCircle className='h-5 w-5' />
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Form Type Selection */}
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-4'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>
            Tipe Transaksi
          </h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <label className='cursor-pointer'>
              <input
                type='radio'
                name='form_type'
                value='waste_bank_request'
                checked={formData.form_type === 'waste_bank_request'}
                onChange={(e) =>
                  handleFormTypeChange(
                    e.target.value as 'waste_bank_request' | 'industry_request'
                  )
                }
                className='sr-only'
              />
              <div
                className={`rounded-lg border p-4 transition-colors ${
                  formData.form_type === 'waste_bank_request'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Building2 className='mb-2 h-6 w-6 text-emerald-600' />
                <h4 className='font-medium'>Bank Sampah</h4>
                <p className='text-sm text-gray-600'>
                  Transfer ke bank sampah lain
                </p>
              </div>
            </label>

            <label className='cursor-pointer'>
              <input
                type='radio'
                name='form_type'
                value='industry_request'
                checked={formData.form_type === 'industry_request'}
                onChange={(e) =>
                  handleFormTypeChange(
                    e.target.value as 'waste_bank_request' | 'industry_request'
                  )
                }
                className='sr-only'
              />
              <div
                className={`rounded-lg border p-4 transition-colors ${
                  formData.form_type === 'industry_request'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Package className='mb-2 h-6 w-6 text-emerald-600' />
                <h4 className='font-medium'>Industri</h4>
                <p className='text-sm text-gray-600'>
                  Transfer ke industri pengolahan
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Destination Selection */}
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>
            Pilih Tujuan
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                {formData.form_type === 'waste_bank_request'
                  ? 'Bank Sampah Tujuan'
                  : 'Industri Tujuan'}
              </label>
              <div className='relative'>
                <input
                  type='text'
                  value={destinationInput}
                  onChange={handleDestinationInputChange}
                  onFocus={handleDestinationFocus}
                  onBlur={handleDestinationBlur}
                  placeholder='Ketik atau pilih tujuan...'
                  className='shadow-xs mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                  required
                  autoComplete='off'
                />

                {destinationLoading && (
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600'></div>
                  </div>
                )}

                {/* Destination Suggestions Dropdown */}
                {showDestinationSuggestions && destinationInput.trim() && (
                  <div className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5'>
                    {destinationLoading ? (
                      <div className='px-4 py-2 text-sm text-gray-500'>
                        <div className='flex items-center space-x-2'>
                          <div className='h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600'></div>
                          <span>Mencari...</span>
                        </div>
                      </div>
                    ) : filteredDestinations.length > 0 ? (
                      filteredDestinations.map((user, index) => (
                        <div
                          key={`${user.id}-${index}`}
                          className='cursor-pointer px-4 py-2 text-sm hover:bg-emerald-50'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDestinationSelect(user);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <div className='font-medium'>{user.institution}</div>
                          <div className='text-xs text-gray-500'>
                            {[user.city, user.province]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='px-4 py-2 text-sm text-gray-500'>
                        Tidak ada hasil ditemukan
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className='mt-1 text-xs text-gray-500'>
                Ketik nama institusi untuk melihat saran
              </p>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  No. Telepon Anda
                </label>
                <input
                  type='tel'
                  value={formData.source_phone_number}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      source_phone_number: e.target.value,
                    }))
                  }
                  className='mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                  placeholder='+6281234567890'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  No. Telepon Tujuan
                </label>
                <input
                  type='tel'
                  value={formData.destination_phone_number}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      destination_phone_number: e.target.value,
                    }))
                  }
                  className='mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                  placeholder='+6289876543210'
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>
            Detail Janji Temu
          </h3>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Tanggal
                </label>
                <input
                  type='date'
                  value={formData.appointment_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      appointment_date: e.target.value,
                    }))
                  }
                  className='mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                  required
                />
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Waktu Mulai
                  </label>
                  <input
                    type='time'
                    value={formData.appointment_start_time}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        appointment_start_time: e.target.value,
                      }))
                    }
                    className='mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Waktu Selesai
                  </label>
                  <input
                    type='time'
                    value={formData.appointment_end_time}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        appointment_end_time: e.target.value,
                      }))
                    }
                    className='mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Alamat Lokasi Janji Temu
              </label>
              <div className='flex flex-col gap-2'>
                <input
                  type='text'
                  value={getFormattedAddress()}
                  readOnly
                  className='pointer-events-none mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2'
                  placeholder='Alamat tidak ditemukan'
                />
                <p className='text-xs text-gray-500'>
                  Alamat lengkap diambil dari data user Anda (alamat, kota,
                  provinsi). Lokasi janji temu akan menggunakan koordinat
                  (latitude & longitude) di bawah ini.
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  <div className='hidden'>
                    <label className='block text-xs font-medium text-gray-700'>
                      Latitude
                    </label>
                    <input
                      type='number'
                      step='any'
                      value={formData.appointment_location.latitude}
                      readOnly
                      className='block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                      required
                      placeholder='Latitude'
                    />
                  </div>
                  <div className='hidden'>
                    <label className='block text-xs font-medium text-gray-700'>
                      Longitude
                    </label>
                    <input
                      type='number'
                      step='any'
                      value={formData.appointment_location.longitude}
                      readOnly
                      className='block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                      required
                      placeholder='Longitude'
                    />
                  </div>
                </div>
                <p className='mt-1 hidden text-xs text-gray-500'>
                  Koordinat lokasi janji temu diambil otomatis dari data user
                  Anda dan tidak dapat diubah.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Waste Items */}
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>Item Sampah</h3>
            <button
              type='button'
              onClick={addWasteItem}
              disabled={availableWasteTypes.length === 0}
              className='flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Plus className='h-4 w-4' />
              Tambah Item
            </button>
          </div>

          {formData.items.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>
              <Package className='mx-auto h-12 w-12 text-gray-300' />
              <p className='mt-2'>Belum ada item sampah</p>
              <p className='text-sm'>
                {availableWasteTypes.length === 0
                  ? 'Tidak ada tipe sampah yang tersedia'
                  : 'Klik "Tambah Item" untuk menambahkan'}
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className='rounded-lg border border-gray-200 bg-gray-50 p-4'
                >
                  <div className='mb-2 flex items-center justify-between'>
                    <h4 className='font-medium text-gray-900'>
                      Item #{index + 1}
                    </h4>
                    <button
                      type='button'
                      onClick={() => removeWasteItem(index)}
                      className='text-red-600 hover:text-red-700'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        Tipe Sampah
                      </label>
                      <select
                        value={item.waste_type_id}
                        onChange={(e) =>
                          updateWasteItem(
                            index,
                            'waste_type_id',
                            e.target.value
                          )
                        }
                        className='mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                        required
                      >
                        {availableWasteTypes.map((wasteType) => (
                          <option
                            key={wasteType.waste_type_id}
                            value={wasteType.waste_type_id}
                          >
                            {wasteType.waste_type_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        Berat (kg)
                      </label>
                      <input
                        type='number'
                        min='0.1'
                        max={item.max_available_weight || 999}
                        step='0.001'
                        value={
                          typeof item.offering_weight === 'number'
                            ? String(item.offering_weight).replace(
                                /^0+(\d)/,
                                '$1'
                              )
                            : item.offering_weight
                        }
                        onChange={(e) => {
                          // Remove leading zeros except for "0." (decimal)
                          let val = e.target.value;
                          if (/^0+\d/.test(val) && !/^0\./.test(val)) {
                            val = val.replace(/^0+/, '');
                          }
                          updateWasteItem(
                            index,
                            'offering_weight',
                            parseFloat(val) || 0
                          );
                        }}
                        className='mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                        required
                      />
                      <p className='mt-1 text-xs text-gray-500'>
                        Maksimal: {item.max_available_weight || 0} kg (tersedia
                        di storage)
                      </p>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        Harga per Kg
                      </label>
                      <input
                        type='number'
                        min='0'
                        step='0.01'
                        value={
                          item.offering_price_per_kg === 0
                            ? ''
                            : item.offering_price_per_kg
                        }
                        onChange={(e) =>
                          updateWasteItem(
                            index,
                            'offering_price_per_kg',
                            e.target.value === ''
                              ? 0
                              : parseFloat(e.target.value)
                          )
                        }
                        className='mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                        required
                      />
                      <p className='mt-1 text-xs text-gray-500'>
                        Harga asli: Rp{' '}
                        {(item.original_price || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className='mt-2 text-right'>
                    <p className='text-sm font-medium text-emerald-600'>
                      Subtotal: Rp{' '}
                      {(
                        item.offering_weight * item.offering_price_per_kg
                      ).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-4'>
                <div className='flex justify-between text-lg font-bold text-emerald-800'>
                  <span>Total Keseluruhan:</span>
                  <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className='shadow-xs rounded-lg border border-gray-200 bg-white p-6'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>
            Informasi Tambahan
          </h3>
          <div className='space-y-4'>
            <div className='hidden'>
              <label className='block text-sm font-medium text-gray-700'>
                URL Gambar (Opsional)
              </label>
              <input
                type='url'
                value={formData.image_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    image_url: e.target.value,
                  }))
                }
                className='mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                placeholder='https://example.com/photo.jpg'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Catatan (Opsional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className='mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500'
                placeholder='Tambahkan catatan untuk transaksi ini...'
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className='flex justify-end space-x-4'>
          <button
            type='button'
            onClick={() => router.back()}
            className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
          >
            Batal
          </button>
          <button
            type='submit'
            disabled={loading || formData.items.length === 0 || !currentUserId}
            className='flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {loading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Save className='h-4 w-4' />
            )}
            {loading ? 'Membuat...' : 'Buat Transaksi'}
          </button>
        </div>
      </form>
    </div>
  );
}
